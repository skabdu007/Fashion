import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { useToast } from "../ui/ToastProvider";
import LoadingSpinner from "../ui/LoadingSpinner";
import api, { API_BASE_URL } from "../../utils/axios";
import { getProductImageUrl, handleImageError } from "../../utils/image";
import { showResultAlert } from "../../utils/alerts";

const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

const getStoredToken = () =>
  localStorage.getItem("accessToken") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("accessToken") ||
  sessionStorage.getItem("token") ||
  "";

const formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const formatCountdown = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

const formatDateTime = (value) => {
  if (!value) {
    return "Not scheduled";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Not scheduled";
  }

  return parsed.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const formatBidTime = (value) => {
  if (!value) {
    return "Just now";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Just now";
  }

  return parsed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
};

export default function LiveAuctionRoom({ auctionId, mode = "customer" }) {
  const navigate = useNavigate();
  const toast = useToast();
  const socketRef = useRef(null);
  const prevRoomRef = useRef(null);
  const removalAlertShown = useRef(false);
  const priceTimerRef = useRef(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const [room, setRoom] = useState(null);
  const [recentBids, setRecentBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(true);
  const [pendingBid, setPendingBid] = useState(0);
  const [placingBid, setPlacingBid] = useState(false);
  const [pricePulse, setPricePulse] = useState(false);
  const [connectionLabel, setConnectionLabel] = useState("Connecting");
  const [countdown, setCountdown] = useState(0);
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [foldingBid, setFoldingBid] = useState(false);

  const isAdminView = mode === "admin";
  const canBid = !isAdminView && room?.viewer_can_bid;
  const removalMessage = room?.removal_message || "";
  const currentUserId = String(user?.user_id || user?._id || "");
  const currentProductStatus = room?.product?.status || "";
  const isProductSold = currentProductStatus === "SOLD";

  const applyRoomUpdate = useCallback((nextRoom) => {
    const previousRoom = prevRoomRef.current;

    if (previousRoom?.current_price !== nextRoom.current_price) {
      setPricePulse(true);
      window.clearTimeout(priceTimerRef.current);
      priceTimerRef.current = window.setTimeout(() => setPricePulse(false), 650);
    }

    if (
      nextRoom.viewer?.status === "FOLDED" &&
      !removalAlertShown.current &&
      nextRoom.removal_message !== "You folded from the current product"
    ) {
      removalAlertShown.current = true;
      toast.error("You are removed due to insufficient balance", "Auction access removed");
      showResultAlert({
        title: "Auction Access Removed",
        text: "You are removed due to insufficient balance",
        icon: "warning",
        confirmButtonText: "Okay"
      });
    }

    setRoom(nextRoom);
    setCountdown(Number(nextRoom.countdown_seconds || 0));
    setPendingBid((current) => {
      if (!current || current < nextRoom.next_bid_amount) {
        return nextRoom.next_bid_amount;
      }
      return current;
    });
    prevRoomRef.current = nextRoom;
  }, [toast]);

  useEffect(() => {
    let active = true;

    const loadRoom = async () => {
      try {
        const [roomRes, bidsRes] = await Promise.all([
          api.get(`/auction/room/${auctionId}/state`),
          api.get(`/auction/board/${auctionId}`)
        ]);
        if (!active) return;
        applyRoomUpdate(roomRes.data.data);
        setRecentBids(
          (bidsRes.data.bids || []).map((bid) => ({
            id: bid._id,
            userId: String(bid.bidder?.user_id || ""),
            nickname: bid.bidder?.nickname || "Bidder",
            amount: Number(bid.bid_amount || 0),
            time: bid.time
          }))
        );
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load this auction room.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadRoom();

    return () => {
      active = false;
    };
  }, [applyRoomUpdate, auctionId, toast]);

  useEffect(() => {
    const interval = window.setInterval(async () => {
      try {
        const res = await api.get(`/auction/room/${auctionId}/state`);
        applyRoomUpdate(res.data.data);
      } catch (error) {
        console.error("Auction polling error:", error);
      }
    }, 2000);

    return () => window.clearInterval(interval);
  }, [applyRoomUpdate, auctionId]);

  useEffect(() => {
    const token = getStoredToken();
    const socket = io(SOCKET_BASE_URL, {
      transports: ["websocket"],
      auth: token ? { token } : undefined
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnectionLabel("Live");
      setConnecting(false);
      socket.emit("auction:join", { auctionId }, (response) => {
        if (response?.success && response.data) {
          applyRoomUpdate(response.data);
          return;
        }

        if (response?.message) {
          toast.error(response.message);
        }
      });
    });

    socket.on("disconnect", () => {
      setConnectionLabel("Reconnecting");
      setConnecting(true);
    });

    socket.on("auction:state", (nextRoom) => {
      applyRoomUpdate(nextRoom);

      if (nextRoom.status === "ENDED") {
        toast.success("Auction room completed.");
      }
    });

    socket.on("auction:bid-placed", (payload) => {
      if (payload?.bidder_name) {
        setRecentBids((current) => [
          {
            id: `${payload.bidder_name}-${payload.current_price}-${Date.now()}`,
            userId: "",
            nickname: payload.bidder_name,
            amount: Number(payload.current_price || 0),
            time: new Date().toISOString()
          },
          ...current
        ].slice(0, 10));
        toast.success(
          `${payload.bidder_name} pushed the bid to ${formatMoney(payload.current_price)}`,
          "New bid"
        );
      }
    });

    socket.on("connect_error", () => {
      setConnectionLabel("Offline");
      setConnecting(false);
    });

    return () => {
      window.clearTimeout(priceTimerRef.current);
      socket.disconnect();
    };
  }, [applyRoomUpdate, auctionId, toast]);

  const roomStatus = room?.status;
  const currentProductIndex = room?.current_product_index;

  useEffect(() => {
    if (roomStatus !== "LIVE") {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setCountdown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [currentProductIndex, roomStatus]);

  const incrementBid = () => {
    if (!room) return;
    setPendingBid((current) => {
      const base = current && current >= room.next_bid_amount ? current : room.next_bid_amount;
      return Number(base) + Number(room.bid_increment || 0);
    });
  };

  const placeBid = () => {
    if (!socketRef.current || !room || !canBid) {
      return;
    }

    setPlacingBid(true);

    socketRef.current.emit("auction:bid", { auctionId, bidAmount: pendingBid }, (response) => {
      setPlacingBid(false);

      if (!response?.success) {
        toast.error(response?.message || "Bid could not be placed.");
        return;
      }

      if (response?.data?.removed_participants?.length) {
        toast.warning(
          `${response.data.removed_participants.length} bidder(s) folded after the price moved up.`,
          "Active bidders updated"
        );
      }

      setPendingBid(response.data.room.next_bid_amount);
    });
  };

  const foldBid = () => {
    if (!socketRef.current || !room || isAdminView) {
      return;
    }

    setFoldingBid(true);

    socketRef.current.emit("auction:fold", { auctionId }, (response) => {
      setFoldingBid(false);

      if (!response?.success) {
        toast.error(response?.message || "Unable to fold right now.");
        return;
      }

      toast.success(response.message || "You folded successfully.");
      if (response.data) {
        applyRoomUpdate(response.data);
      }
    });
  };

  const finalizeCurrentProduct = async () => {
    try {
      setAdminActionLoading(true);
      await api.post("/auction/finalize-product", { room_id: auctionId });
      toast.success("Current product marked sold or advanced.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to finalize this product.");
    } finally {
      setAdminActionLoading(false);
    }
  };

  const closeAuction = async () => {
    try {
      setAdminActionLoading(true);
      await api.post("/auction/close-room", { room_id: auctionId });
      toast.success("Auction room closed.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to close the auction.");
    } finally {
      setAdminActionLoading(false);
    }
  };

  if (loading || !room) {
    return (
      <div className="shop-shell">
        <div className="shop-container auction-live-shell">
          <LoadingSpinner centered label="Loading live auction room..." />
        </div>
      </div>
    );
  }

  return (
    <div className="shop-shell">
      <div className="shop-container auction-live-shell">
        <section className="auction-live-topbar glass-card">
          <div>
            <span className={`auction-status-pill auction-status-pill-${String(room.status || "").toLowerCase()}`}>
              {room.status}
            </span>
            <h1>{room.product?.product_name || "Live Auction Room"}</h1>
            <p>
              Room code {room.room_code} | Product {Math.min((room.current_product_index || 0) + 1, room.total_products || 1)} of{" "}
              {room.total_products || 1}
            </p>
          </div>

          <div className="auction-topbar-actions">
            <span className={`auction-connection ${connecting ? "is-waiting" : "is-live"}`}>
              {connectionLabel}
            </span>
            {isAdminView ? (
              <>
                <button
                  type="button"
                  className="btn-secondary-modern"
                  onClick={finalizeCurrentProduct}
                  disabled={adminActionLoading || room.status !== "LIVE"}
                >
                  {adminActionLoading ? "Updating..." : "Sold / Next"}
                </button>
                <button type="button" className="btn-danger-modern" onClick={closeAuction} disabled={adminActionLoading}>
                  Close Room
                </button>
              </>
            ) : (
              <button type="button" className="btn-secondary-modern" onClick={() => navigate("/auction/join")}>
                More Rooms
              </button>
            )}
          </div>
        </section>

        <section className="auction-live-layout">
          <div className="auction-product-panel glass-card">
            <div className="auction-product-media">
              <img
                src={getProductImageUrl(room.product?.image)}
                alt={room.product?.product_name || "Auction product"}
                onError={handleImageError}
              />
            </div>

            <div className="auction-product-copy">
              <div className="premium-badge">Single Room Live Auction</div>
              <h2>{room.product?.product_name}</h2>
              <p>{room.product?.description || "Premium live bidding experience with wallet validation and real-time room sync."}</p>

              <div className="summary-grid">
                <div className={`summary-tile auction-price-tile ${pricePulse ? "is-updating" : ""}`}>
                  <div className="summary-label">Current Price</div>
                  <div className="summary-value">{formatMoney(room.current_price)}</div>
                </div>

                <div className="summary-tile">
                  <div className="summary-label">Next Bid</div>
                  <div className="summary-value">{formatMoney(room.next_bid_amount)}</div>
                </div>

                <div className="summary-tile">
                  <div className="summary-label">Timer</div>
                  <div className="summary-value auction-compact-value">{formatCountdown(countdown)}</div>
                </div>

                <div className="summary-tile">
                  <div className="summary-label">Highest Nickname</div>
                  <div className="summary-value auction-compact-value">{room.highest_bidder_name || "Awaiting first bid"}</div>
                </div>
              </div>

              <div className="auction-schedule-grid">
                <div className="summary-tile">
                  <div className="summary-label">Room Start</div>
                  <div className="summary-value auction-compact-value">{formatDateTime(room.scheduled_start_time)}</div>
                </div>
                <div className="summary-tile">
                  <div className="summary-label">Room End</div>
                  <div className="summary-value auction-compact-value">{formatDateTime(room.scheduled_end_time)}</div>
                </div>
              </div>

              <div className="glass-card auction-queue-panel">
                <div className="auction-card-heading">
                  <h3>Product Queue</h3>
                  <span>{room.products.length}</span>
                </div>
                <div className="auction-preview-list">
                  {room.products.map((product) => (
                    <div
                      key={product.product_id || `${product.product_name}-${product.index}`}
                      className={`line-item auction-queue-item ${product.is_current ? "is-current" : ""}`}
                    >
                      <div>
                        <div className="line-item-title">
                          {product.index + 1}. {product.product_name}
                        </div>
                        <div className="line-item-meta">
                          {product.status} | {formatMoney(product.current_price)}
                          {product.winner_name ? ` | Sold to ${product.winner_name}` : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="auction-roster-grid">
                <div className="auction-roster-card">
                  <div className="auction-card-heading">
                    <h3>Active Bidders</h3>
                    <span>{room.active_bidders.length}</span>
                  </div>

                  {room.active_bidders.length ? (
                    room.active_bidders.map((bidder) => (
                      <div
                        key={bidder.user_id}
                        className={`auction-bidder-row ${String(bidder.user_id) === String(room.highest_bidder_id || "") ? "is-leading" : ""}`}
                      >
                        <div>
                          <strong>{bidder.username}</strong>
                          <span>Chips {formatMoney(bidder.wallet_balance)}</span>
                        </div>
                        <div className="auction-bidder-meta">
                          <span>{bidder.last_bid_amount ? formatMoney(bidder.last_bid_amount) : "Ready"}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">No active bidders yet.</p>
                  )}
                </div>

                <div className="auction-roster-card">
                  <div className="auction-card-heading">
                    <h3>Folded</h3>
                    <span>{room.folded_bidders.length}</span>
                  </div>

                  {room.folded_bidders.length ? (
                    room.folded_bidders.map((bidder) => (
                      <div key={bidder.user_id} className="auction-bidder-row is-folded">
                        <div>
                          <strong>{bidder.username}</strong>
                          <span>{bidder.folded_reason || "Folded"}</span>
                        </div>
                        <div className="auction-bidder-meta">
                          <span>Folded</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">No folded users.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="auction-chat-panel glass-card">
            <div className="auction-card-heading">
              <h3>Live Bidding</h3>
              <span>{recentBids.length} bids</span>
            </div>

            <div className="auction-chat-messages">
              {recentBids.length ? (
                recentBids.map((bid) => (
                  <div
                    key={bid.id}
                    className={`auction-chat-bubble ${bid.userId === currentUserId ? "is-self" : ""}`}
                  >
                    <div className="auction-bid-feed-head">
                      <strong>{bid.nickname}</strong>
                      <span>{formatBidTime(bid.time)}</span>
                    </div>
                    <p>{formatMoney(bid.amount)}</p>
                  </div>
                ))
              ) : (
                <div className="empty-state">Live bids will appear here.</div>
              )}
            </div>

            <div className="glass-card auction-sold-panel">
              <div className="auction-card-heading">
                <h3>Sold</h3>
                <span>{room.sold_products.length}</span>
              </div>
              {room.sold_products.length ? (
                room.sold_products.map((product) => (
                  <div key={`sold-${product.product_id}`} className="line-item">
                    <div>
                      <div className="line-item-title">{product.product_name}</div>
                      <div className="line-item-meta">
                        {product.winner_name || "Winner pending"} | {formatMoney(product.current_price)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">Sold items will appear here.</div>
              )}
            </div>
          </aside>
        </section>

        <section className="auction-bid-panel glass-card">
          <div>
            <div className="summary-label">Your bid target</div>
            <div className="auction-bid-target">{formatMoney(pendingBid || room.next_bid_amount || 0)}</div>
          </div>

          <div className="auction-bid-actions">
            <button
              type="button"
              className="btn-secondary-modern"
              onClick={incrementBid}
              disabled={!canBid}
            >
              + {formatMoney(room.bid_increment)}
            </button>

            <button
              type="button"
              className="btn-modern"
              onClick={placeBid}
              disabled={!canBid || placingBid || room.status !== "LIVE"}
            >
              {placingBid ? "Placing Bid..." : "Place Bid"}
            </button>

            {!isAdminView ? (
              <button
                type="button"
                className="btn-danger-modern"
                onClick={foldBid}
                disabled={foldingBid || room.status !== "LIVE"}
              >
                {foldingBid ? "Folding..." : "Fold"}
              </button>
            ) : null}
          </div>

          <div className="auction-bid-status">
            {isAdminView ? (
              <div className="info-banner">
                Admin monitor mode: use Sold / Next to move the queue, or Close Room to end the full auction.
              </div>
            ) : isProductSold ? (
              <div className="success-banner">This product is sold. Wait while the host moves the room to the next product.</div>
            ) : removalMessage ? (
              <div className="error-banner">{removalMessage}</div>
            ) : canBid ? (
              <div className="success-banner">
                Chip balance validated. Only nicknames are shown in the room, and every successful bid adds 20 seconds.
              </div>
            ) : (
              <div className="warning-banner">Bidding is unavailable for your account in the current room state.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
