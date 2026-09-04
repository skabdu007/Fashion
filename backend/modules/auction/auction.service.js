const crypto = require("crypto");
const Auction = require("./auction.model");
const Bid = require("../bidding/bid.model");
const Subscription = require("../Subscription/subscription.model");
const Notification = require("../notification/notification.model");
const Customer = require("../customer/customer.model");
const Product = require("../product/product.model");
const Winner = require("../winner/winner.model");
const WonProduct = require("../wallet/wonProduct.model");
const { getIo } = require("../../socket/socketStore");
const {
  getOrCreateWallet,
  getAvailableChipBalance,
  deductAuctionChips
} = require("../wallet/wallet.service");

const ROOM_PREFIX = "auction:";
const REMOVAL_MESSAGE = "You are removed due to insufficient balance";
const DEFAULT_CHAT_LIMIT = 40;
const DEFAULT_TURN_TIME_SECONDS = 60;
const BID_EXTENSION_SECONDS = 20;
const MAX_PRODUCTS_PER_ROOM = 50;
const timerRegistry = new Map();

const normalizeMoney = (value) => Number(Number(value || 0).toFixed(2));

const toObjectIdString = (value) => String(value || "");

const getCurrentAuctionProduct = (auction) => {
  if (!auction?.products?.length) {
    return null;
  }

  return auction.products[auction.current_product_index] || null;
};

const syncLegacyProductFields = (auction) => {
  const currentProduct = getCurrentAuctionProduct(auction);

  auction.product_id = currentProduct?.product_id || null;
  auction.current_price = normalizeMoney(currentProduct?.current_price || currentProduct?.min_bid || auction.min_bid || 0);
  auction.highest_bidder_id = currentProduct?.highest_bidder_id || null;
  auction.highest_bidder_name = currentProduct?.highest_bidder_nickname || currentProduct?.highest_bidder_name || "";
};

const getTurnEndTime = (auction) => {
  if (!auction?.end_time) {
    return null;
  }

  const time = new Date(auction.end_time);
  return Number.isNaN(time.getTime()) ? null : time;
};

const getCountdownMs = (auction) => {
  const endTime = getTurnEndTime(auction);

  if (!endTime || auction.status !== "LIVE") {
    return 0;
  }

  return Math.max(0, endTime.getTime() - Date.now());
};

const getWalletBalance = async (user_id) => {
  const wallet = await getOrCreateWallet(user_id);
  return normalizeMoney(getAvailableChipBalance(wallet));
};

const getCustomerIdentity = async (user_id) => {
  const customer = await Customer.findById(user_id).select("username nickname email");

  if (!customer) {
    throw new Error("Customer not found");
  }

  const emailAlias = customer.email ? String(customer.email).split("@")[0] : "";
  const username = customer.username || emailAlias || "Bidder";
  const nickname = customer.nickname || username;

  return {
    username,
    nickname,
    display_name: nickname,
    original_name: username
  };
};

const getNextBidAmount = (auction) => {
  const currentProduct = getCurrentAuctionProduct(auction);
  const currentPrice = normalizeMoney(
    currentProduct?.current_price || auction.current_price || currentProduct?.min_bid || auction.min_bid || 0
  );
  const increment = normalizeMoney(auction.bid_increment || 0);
  return normalizeMoney(currentPrice + increment);
};

const clearAuctionTimer = (auctionId) => {
  const key = String(auctionId);
  const existing = timerRegistry.get(key);

  if (existing) {
    clearTimeout(existing);
    timerRegistry.delete(key);
  }
};

const ensureAuctionTimer = async (auctionId) => {
  clearAuctionTimer(auctionId);

  const auction = await Auction.findById(auctionId);

  if (!auction || auction.status !== "LIVE") {
    return;
  }

  const currentProduct = getCurrentAuctionProduct(auction);
  const countdownMs = getCountdownMs(auction);

  if (!currentProduct || currentProduct.status !== "LIVE") {
    return;
  }

  if (countdownMs <= 0) {
    setTimeout(() => {
      exports.finalizeCurrentProductService(auctionId, { reason: "timer" }).catch(() => {});
    }, 0);
    return;
  }

  const timeoutId = setTimeout(() => {
    exports.finalizeCurrentProductService(auctionId, { reason: "timer" }).catch(() => {});
  }, countdownMs);

  timerRegistry.set(String(auctionId), timeoutId);
};

const reserveProductsForAuction = async (auctionId, productIds) => {
  await Product.updateMany(
    { _id: { $in: productIds } },
    {
      $set: {
        is_auction_exclusive: true,
        auction_room_id: auctionId,
        auction_availability: "RESERVED"
      }
    }
  );
};

const buildAuctionProducts = async (productIds, roomMinBid) => {
  const uniqueIds = [...new Set((productIds || []).map((item) => String(item)).filter(Boolean))];

  if (!uniqueIds.length) {
    throw new Error("Add at least one auction product.");
  }

  if (uniqueIds.length > MAX_PRODUCTS_PER_ROOM) {
    throw new Error(`Only ${MAX_PRODUCTS_PER_ROOM} products can be added to one auction room.`);
  }

  const products = await Product.find({ _id: { $in: uniqueIds } }).lean();

  if (products.length !== uniqueIds.length) {
    throw new Error("One or more selected products were not found.");
  }

  const unavailableProducts = products.filter(
    (product) =>
      product.auction_availability === "SOLD" ||
      Boolean(product.auction_room_id)
  );

  if (unavailableProducts.length) {
    throw new Error(`${unavailableProducts[0].product_name} is not available for this auction room.`);
  }

  const orderedProducts = uniqueIds.map((productId) => {
    const product = products.find((entry) => String(entry._id) === String(productId));
    const minBid = normalizeMoney(Math.max(Number(roomMinBid || 0), Number(product.price || 0)));

    return {
      product_id: product._id,
      product_name: product.product_name || "Auction Product",
      description: product.description || "",
      image: product.image || "",
      base_price: normalizeMoney(product.price || 0),
      min_bid: minBid,
      current_price: minBid,
      status: "PENDING"
    };
  });

  return {
    productIds: uniqueIds,
    products: orderedProducts
  };
};

const validateRequestedProductCount = (productIds, requestedCount) => {
  if (requestedCount === undefined || requestedCount === null || requestedCount === "") {
    return;
  }

  const parsedRequestedCount = Number(requestedCount);

  if (!Number.isInteger(parsedRequestedCount) || parsedRequestedCount <= 0) {
    throw new Error("Product count must be a valid whole number greater than 0.");
  }

  if (parsedRequestedCount > MAX_PRODUCTS_PER_ROOM) {
    throw new Error(`Only ${MAX_PRODUCTS_PER_ROOM} products can be added to one auction room.`);
  }

  if (productIds.length !== parsedRequestedCount) {
    throw new Error(`Select exactly ${parsedRequestedCount} products for this room.`);
  }
};

const validateAuctionSchedule = (startTime, endTime) => {
  if (!startTime && !endTime) {
    return {
      parsedStartTime: null,
      parsedEndTime: null
    };
  }

  const parsedStartTime = startTime ? new Date(startTime) : null;
  const parsedEndTime = endTime ? new Date(endTime) : null;

  if (parsedStartTime && Number.isNaN(parsedStartTime.getTime())) {
    throw new Error("start_time must be a valid date and time.");
  }

  if (parsedEndTime && Number.isNaN(parsedEndTime.getTime())) {
    throw new Error("end_time must be a valid date and time.");
  }

  if (parsedStartTime && parsedEndTime && parsedEndTime <= parsedStartTime) {
    throw new Error("end_time must be later than start_time.");
  }

  return {
    parsedStartTime,
    parsedEndTime
  };
};

const buildWinnerPayload = async (auction, currentProduct, resultType = "SOLD") => {
  if (!currentProduct) {
    return null;
  }

  if (resultType === "UNSOLD") {
    return {
      auction_id: auction._id,
      product_id: currentProduct.product_id,
      product_name: currentProduct.product_name,
      winning_bid: normalizeMoney(currentProduct.current_price || currentProduct.min_bid || 0),
      result_type: "UNSOLD"
    };
  }

  if (!currentProduct.highest_bidder_id) {
    return null;
  }

  return {
    auction_id: auction._id,
    product_id: currentProduct.product_id,
    product_name: currentProduct.product_name,
    user_id: currentProduct.highest_bidder_id,
    winner_name: currentProduct.winner_name || currentProduct.highest_bidder_name || "",
    winner_nickname: currentProduct.winner_nickname || currentProduct.highest_bidder_nickname || "",
    winning_bid: normalizeMoney(currentProduct.current_price || currentProduct.min_bid || 0),
    result_type: "SOLD"
  };
};

const persistWinner = async (payload) => {
  if (!payload) {
    return null;
  }

  const filter = {
    auction_id: payload.auction_id,
    product_id: payload.product_id
  };

  return Winner.findOneAndUpdate(filter, payload, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  });
};

const persistWonProduct = async (auction, currentProduct) => {
  if (!auction || !currentProduct?.highest_bidder_id || !currentProduct?.product_id) {
    return null;
  }

  const winningBid = normalizeMoney(currentProduct.current_price || currentProduct.min_bid || 0);

  return WonProduct.findOneAndUpdate(
    {
      auction_id: auction._id,
      product_id: currentProduct.product_id
    },
    {
      $setOnInsert: {
        user_id: currentProduct.highest_bidder_id,
        product_id: currentProduct.product_id,
        auction_id: auction._id,
        winning_bid: winningBid,
        status: "won",
        created_at: new Date()
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );
};

const notifyAuctionWinner = async (auction, currentProduct) => {
  if (!auction || !currentProduct?.highest_bidder_id) {
    return null;
  }

  return Notification.create({
    user_id: currentProduct.highest_bidder_id,
    type: "AUCTION_WIN",
    title: "You won this auction!",
    message: `You won ${currentProduct.product_name || "an auction product"} for Rs. ${normalizeMoney(currentProduct.current_price || currentProduct.min_bid || 0).toLocaleString()}.`,
    link: "/wallet",
    metadata: {
      auction_id: auction._id,
      product_id: currentProduct.product_id
    }
  });
};

const settleWinnerWallet = async (winnerRecord) => {
  if (!winnerRecord || winnerRecord.result_type !== "SOLD" || !winnerRecord.user_id) {
    return winnerRecord;
  }

  if (winnerRecord.wallet_settled) {
    return winnerRecord;
  }

  const wallet = await getOrCreateWallet(winnerRecord.user_id);

  await deductAuctionChips({
    wallet,
    user_id: winnerRecord.user_id,
    amount: normalizeMoney(winnerRecord.winning_bid || 0),
    description: `Auction win settled for ${winnerRecord.product_name || "auction product"}`,
    metadata: {
      auction_id: winnerRecord.auction_id,
      product_id: winnerRecord.product_id,
      winner_id: winnerRecord._id
    }
  });

  return Winner.findByIdAndUpdate(
    winnerRecord._id,
    {
      $set: {
        wallet_settled: true,
        wallet_settled_at: new Date()
      }
    },
    { new: true }
  );
};

const populateAuctionForState = async (auctionId) =>
  Auction.findById(auctionId).populate("products.product_id", "product_name description image price").lean();

const syncTimerSensitiveAuction = async (auctionId) => {
  const auction = await Auction.findById(auctionId);

  if (!auction) {
    return null;
  }

  if (auction.status === "LIVE" && getCountdownMs(auction) <= 0) {
    await exports.finalizeCurrentProductService(auctionId, { reason: "timer" });
    return Auction.findById(auctionId);
  }

  if (auction.status === "LIVE") {
    await ensureAuctionTimer(auctionId);
  }

  return auction;
};

const serializeAuctionState = async (auction, viewerId = null) => {
  const populatedAuction = await populateAuctionForState(auction._id);
  const nextBidAmount = getNextBidAmount(populatedAuction);
  const activeBidders = populatedAuction.participants
    .filter((participant) => participant.status === "ACTIVE")
    .sort((a, b) => b.last_bid_amount - a.last_bid_amount || new Date(a.joined_at) - new Date(b.joined_at));

  const foldedBidders = populatedAuction.participants
    .filter((participant) => participant.status === "FOLDED")
    .sort((a, b) => new Date(b.folded_at || b.joined_at) - new Date(a.folded_at || a.joined_at));

  const viewer = populatedAuction.participants.find(
    (participant) => String(participant.user_id) === String(viewerId || "")
  );

  const currentProduct = getCurrentAuctionProduct(populatedAuction);
  const productQueue = (populatedAuction.products || []).map((product, index) => ({
    index,
    product_id: product.product_id?._id || product.product_id,
    product_name: product.product_name || product.product_id?.product_name || "Auction Product",
    image: product.image || product.product_id?.image || "",
    base_price: normalizeMoney(product.base_price || product.product_id?.price || 0),
    min_bid: normalizeMoney(product.min_bid),
    current_price: normalizeMoney(product.current_price),
    status: product.status,
    is_current: index === populatedAuction.current_product_index,
    highest_bidder_name: product.highest_bidder_nickname || product.highest_bidder_name || "",
    winner_name: product.winner_nickname || product.winner_name || ""
  }));

  const soldProducts = productQueue.filter((product) => product.status === "SOLD");
  const unsoldProducts = productQueue.filter((product) => product.status === "UNSOLD");

  return {
    success: true,
    data: {
      auction_id: populatedAuction._id,
      room_code: populatedAuction.room_code,
      status: populatedAuction.status,
      min_bid: normalizeMoney(populatedAuction.min_bid),
      bid_increment: normalizeMoney(populatedAuction.bid_increment),
      current_price: normalizeMoney(populatedAuction.current_price),
      next_bid_amount: nextBidAmount,
      highest_bidder_id: populatedAuction.highest_bidder_id,
      highest_bidder_name: populatedAuction.highest_bidder_name,
      product: currentProduct
        ? {
            _id: currentProduct.product_id?._id || currentProduct.product_id,
            product_name: currentProduct.product_name || currentProduct.product_id?.product_name,
            description: currentProduct.description || currentProduct.product_id?.description || "",
            image: currentProduct.image || currentProduct.product_id?.image || "",
            price: normalizeMoney(currentProduct.base_price || currentProduct.product_id?.price || 0),
            min_bid: normalizeMoney(currentProduct.min_bid),
            current_price: normalizeMoney(currentProduct.current_price),
            status: currentProduct.status
          }
        : null,
      current_product_index: populatedAuction.current_product_index,
      products: productQueue,
      sold_products: soldProducts,
      unsold_products: unsoldProducts,
      total_products: productQueue.length,
      scheduled_start_time: populatedAuction.start_time,
      scheduled_end_time: populatedAuction.end_time,
      turn_time_seconds: Number(populatedAuction.turn_time_seconds || DEFAULT_TURN_TIME_SECONDS),
      countdown_ms: getCountdownMs(populatedAuction),
      countdown_seconds: Math.ceil(getCountdownMs(populatedAuction) / 1000),
      active_bidders: activeBidders,
      folded_bidders: foldedBidders,
      chat_messages: populatedAuction.chat_messages
        .slice(-DEFAULT_CHAT_LIMIT)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
      viewer: viewer || null,
      viewer_can_bid: Boolean(
        viewer &&
        viewer.status === "ACTIVE" &&
        viewer.wallet_balance >= nextBidAmount &&
        populatedAuction.status === "LIVE"
      ),
      removal_message: viewer?.status === "FOLDED" ? viewer.folded_reason || REMOVAL_MESSAGE : ""
    }
  };
};

const emitAuctionState = async (auctionId, viewerId = null) => {
  const io = getIo();

  if (!io) {
    return;
  }

  const auction = await syncTimerSensitiveAuction(auctionId);

  if (!auction) {
    return;
  }

  const payload = await serializeAuctionState(auction, viewerId);
  io.to(`${ROOM_PREFIX}${auctionId}`).emit("auction:state", payload.data);
};

const foldParticipantsWhoCannotAfford = async (auction) => {
  const nextBidAmount = getNextBidAmount(auction);
  const removedParticipants = [];

  auction.participants = auction.participants.map((participant) => {
    if (participant.status !== "ACTIVE") {
      return participant;
    }

    if (normalizeMoney(participant.wallet_balance) >= nextBidAmount) {
      return participant;
    }

    removedParticipants.push({
      user_id: participant.user_id,
      username: participant.username
    });

    return {
      ...participant.toObject(),
      status: "FOLDED",
      folded_reason: REMOVAL_MESSAGE,
      folded_at: new Date()
    };
  });

  return removedParticipants;
};

const syncParticipantWallet = async (auction, user_id) => {
  const walletBalance = await getWalletBalance(user_id);
  const identity = await getCustomerIdentity(user_id);
  const nextBidAmount = getNextBidAmount(auction);
  const existingParticipant = auction.participants.find(
    (participant) => String(participant.user_id) === String(user_id)
  );

  if (!existingParticipant) {
    auction.participants.push({
      user_id,
      username: identity.display_name,
      wallet_balance: walletBalance,
      status: walletBalance >= nextBidAmount ? "ACTIVE" : "FOLDED",
      folded_reason: walletBalance >= nextBidAmount ? "" : REMOVAL_MESSAGE,
      folded_at: walletBalance >= nextBidAmount ? null : new Date()
    });

    return auction.participants[auction.participants.length - 1];
  }

  existingParticipant.username = identity.display_name;
  existingParticipant.wallet_balance = walletBalance;

  if (walletBalance < nextBidAmount) {
    existingParticipant.status = "FOLDED";
    existingParticipant.folded_reason = REMOVAL_MESSAGE;
    existingParticipant.folded_at = new Date();
  } else if (existingParticipant.status !== "ACTIVE") {
    existingParticipant.status = "ACTIVE";
    existingParticipant.folded_reason = "";
    existingParticipant.folded_at = null;
  }

  return existingParticipant;
};

const ensurePlatinumAccess = async (user_id) => {
  const subscription = await Subscription.findOne({
    user_id,
    plan: "PLATINUM",
    status: "ACTIVE",
    end_date: { $gte: new Date() }
  });

  if (!subscription) {
    throw new Error("Only platinum subscribers can join auction rooms.");
  }

  return subscription;
};

const setCurrentProductLive = (auction, startTime = new Date()) => {
  const currentProduct = getCurrentAuctionProduct(auction);

  if (!currentProduct) {
    return null;
  }

  currentProduct.status = "LIVE";
  currentProduct.current_price = normalizeMoney(currentProduct.current_price || currentProduct.min_bid);
  auction.current_price = currentProduct.current_price;
  auction.highest_bidder_id = currentProduct.highest_bidder_id || null;
  auction.highest_bidder_name = currentProduct.highest_bidder_nickname || currentProduct.highest_bidder_name || "";
  auction.start_time = startTime;
  auction.end_time = new Date(startTime.getTime() + Number(auction.turn_time_seconds || DEFAULT_TURN_TIME_SECONDS) * 1000);
  syncLegacyProductFields(auction);

  return currentProduct;
};

exports.createRoomService = async (admin_id, data) => {
  const room_code = crypto.randomBytes(4)
    .toString("hex")
    .toUpperCase();

  const requestedProductIds = data.product_ids || (data.product_id ? [data.product_id] : []);

  validateRequestedProductCount(requestedProductIds, data.product_count);
  const { parsedStartTime, parsedEndTime } = validateAuctionSchedule(data.start_time, data.end_time);

  const { productIds, products } = await buildAuctionProducts(
    requestedProductIds,
    data.min_bid
  );

  const auction = new Auction({
    room_code,
    product_id: products[0]?.product_id || null,
    products,
    current_product_index: 0,
    min_bid: normalizeMoney(data.min_bid),
    bid_increment: normalizeMoney(data.bid_increment || 100),
    entry_fee: normalizeMoney(data.entry_fee),
    start_time: parsedStartTime,
    end_time: parsedEndTime,
    turn_time_seconds: Math.max(15, Number(data.turn_time_seconds || DEFAULT_TURN_TIME_SECONDS)),
    host_id: admin_id,
    current_price: normalizeMoney(products[0]?.min_bid || data.min_bid)
  });

  syncLegacyProductFields(auction);
  await auction.save();
  await reserveProductsForAuction(auction._id, productIds);

  const activePlatinumUsers = await Subscription.find({
    plan: "PLATINUM",
    status: "ACTIVE",
    end_date: { $gte: new Date() }
  }).distinct("user_id");

  if (activePlatinumUsers.length > 0) {
    await Notification.insertMany(
      activePlatinumUsers.map((userId) => ({
        user_id: userId,
        type: "INVITE",
        title: "Exclusive auction room invite",
        message: `A platinum-only room with ${products.length} exclusive products is now open. Use code ${room_code} to join.`,
        room_code,
        link: `/auction/join?code=${room_code}`,
        metadata: {
          auction_id: auction._id
        }
      }))
    );
  }

  return {
    success: true,
    room_code,
    auction_id: auction._id
  };
};

exports.joinRoomService = async (user_id, room_code) => {
  await ensurePlatinumAccess(user_id);

  const auction = await Auction.findOne({
    room_code: String(room_code).toUpperCase()
  });

  if (!auction) {
    return {
      success: false,
      message: "Invalid room code"
    };
  }

  if (auction.status === "ENDED") {
    return {
      success: false,
      message: "This room has already ended."
    };
  }

  return {
    success: true,
    auction_id: auction._id,
    room_code: auction.room_code
  };
};

exports.listRoomsService = async () => {
  const rooms = await Auction.find()
    .populate("product_id", "product_name image price")
    .sort({ createdAt: -1 });

  return {
    success: true,
    data: rooms.map((room) => {
      const currentProduct = getCurrentAuctionProduct(room);

      return {
        _id: room._id,
        auction_id: room._id,
        room_code: room.room_code,
        status: room.status,
        min_bid: normalizeMoney(room.min_bid),
        current_price: normalizeMoney(room.current_price || room.min_bid),
        bid_increment: normalizeMoney(room.bid_increment),
        product_name: currentProduct?.product_name || room.product_id?.product_name || "Auction Product",
        product: room.product_id,
        total_products: room.products?.length || 0,
        start_time: room.start_time,
        end_time: room.end_time,
        turn_time_seconds: Number(room.turn_time_seconds || DEFAULT_TURN_TIME_SECONDS),
        sold_products_count: (room.products || []).filter((product) => product.status === "SOLD").length,
        active_bidders_count: room.participants.filter((item) => item.status === "ACTIVE").length,
        folded_bidders_count: room.participants.filter((item) => item.status === "FOLDED").length
      };
    })
  };
};

exports.enterAuctionService = async (user_id, room_id) => {
  await ensurePlatinumAccess(user_id);

  const auction = await syncTimerSensitiveAuction(room_id);

  if (!auction) {
    return {
      success: false,
      message: "Auction not found"
    };
  }

  await syncParticipantWallet(auction, user_id);
  syncLegacyProductFields(auction);
  await auction.save();

  const payload = await serializeAuctionState(auction, user_id);

  return {
    success: true,
    data: payload.data
  };
};

exports.placeBidService = async (user_id, room_id, bid_amount) => {
  await ensurePlatinumAccess(user_id);

  const auction = await syncTimerSensitiveAuction(room_id);

  if (!auction) {
    return { success: false, message: "Auction not found" };
  }

  if (auction.status !== "LIVE") {
    return { success: false, message: "Auction not live" };
  }

  const currentProduct = getCurrentAuctionProduct(auction);

  if (!currentProduct || currentProduct.status !== "LIVE") {
    return { success: false, message: "There is no live product in this auction room." };
  }

  const participant = await syncParticipantWallet(auction, user_id);
  const increment = normalizeMoney(auction.bid_increment);
  const currentPrice = normalizeMoney(currentProduct.current_price || currentProduct.min_bid);
  const nextBidAmount = getNextBidAmount(auction);
  const parsedBidAmount = normalizeMoney(bid_amount);
  const identity = await getCustomerIdentity(user_id);

  if (participant.status !== "ACTIVE") {
    return { success: false, message: REMOVAL_MESSAGE };
  }

  if (parsedBidAmount < nextBidAmount) {
    return { success: false, message: `Next valid bid is Rs. ${nextBidAmount}` };
  }

  if (normalizeMoney(parsedBidAmount - currentPrice) % increment !== 0) {
    return { success: false, message: "Bid must follow the configured increment." };
  }

  if (participant.wallet_balance < parsedBidAmount) {
    participant.status = "FOLDED";
    participant.folded_reason = REMOVAL_MESSAGE;
    participant.folded_at = new Date();
    await auction.save();
    return { success: false, message: REMOVAL_MESSAGE, removed: true };
  }

  const bid = new Bid({
    auction_id: room_id,
    user_id,
    bid_amount: parsedBidAmount
  });

  await bid.save();

  participant.last_bid_amount = parsedBidAmount;
  currentProduct.current_price = parsedBidAmount;
  currentProduct.highest_bidder_id = user_id;
  currentProduct.highest_bidder_name = identity.original_name;
  currentProduct.highest_bidder_nickname = identity.display_name;
  auction.current_price = parsedBidAmount;
  auction.highest_bidder_id = user_id;
  auction.highest_bidder_name = identity.display_name;
  const currentEndTime = getTurnEndTime(auction) || new Date();
  const extensionBase = Math.max(currentEndTime.getTime(), Date.now());
  auction.end_time = new Date(extensionBase + BID_EXTENSION_SECONDS * 1000);

  const removedParticipants = await foldParticipantsWhoCannotAfford(auction);

  syncLegacyProductFields(auction);
  await auction.save();
  await ensureAuctionTimer(room_id);

  const payload = await serializeAuctionState(auction, user_id);

  return {
    success: true,
    message: "Bid placed successfully",
    data: {
      bid,
      room: payload.data,
      removed_participants: removedParticipants
    }
  };
};

exports.foldBidderService = async (user_id, room_id) => {
  await ensurePlatinumAccess(user_id);

  const auction = await syncTimerSensitiveAuction(room_id);

  if (!auction) {
    return { success: false, message: "Auction not found" };
  }

  const participant = await syncParticipantWallet(auction, user_id);

  if (!participant) {
    return { success: false, message: "Participant not found" };
  }

  if (participant.status === "FOLDED") {
    return {
      success: true,
      message: "You are already folded for this product.",
      data: (await serializeAuctionState(auction, user_id)).data
    };
  }

  participant.status = "FOLDED";
  participant.folded_reason = "You folded from the current product";
  participant.folded_at = new Date();

  syncLegacyProductFields(auction);
  await auction.save();

  const payload = await serializeAuctionState(auction, user_id);

  return {
    success: true,
    message: "You folded successfully.",
    data: payload.data
  };
};

exports.finalizeCurrentProductService = async (room_id, options = {}) => {
  const auction = await Auction.findById(room_id);

  if (!auction) {
    return {
      success: false,
      message: "Auction not found"
    };
  }

  if (auction.status === "ENDED" && options.forceRoomClose !== true) {
    return {
      success: true,
      message: "Auction already ended"
    };
  }

  const currentProduct = getCurrentAuctionProduct(auction);

  if (!currentProduct) {
    auction.status = "ENDED";
    clearAuctionTimer(room_id);
    await auction.save();
    await emitAuctionState(room_id);
    return {
      success: true,
      message: "Auction ended"
    };
  }

  if (currentProduct.status === "SOLD" || currentProduct.status === "UNSOLD") {
    if (auction.current_product_index >= auction.products.length - 1 || options.forceRoomClose) {
      auction.status = "ENDED";
      clearAuctionTimer(room_id);
      await auction.save();
      await emitAuctionState(room_id);
      return { success: true, message: "Auction ended" };
    }

    auction.current_product_index += 1;
    setCurrentProductLive(auction, new Date());
    syncLegacyProductFields(auction);
    await auction.save();
    await ensureAuctionTimer(room_id);
    await emitAuctionState(room_id);
    return { success: true, message: "Next product started" };
  }

  const sold = Boolean(currentProduct.highest_bidder_id);
  currentProduct.status = sold ? "SOLD" : "UNSOLD";
  currentProduct.sold_at = new Date();
  currentProduct.winner_id = sold ? currentProduct.highest_bidder_id : null;
  currentProduct.winner_name = sold ? currentProduct.highest_bidder_name : "";
  currentProduct.winner_nickname = sold ? currentProduct.highest_bidder_nickname : "";

  const winnerRecord = await persistWinner(await buildWinnerPayload(auction, currentProduct, sold ? "SOLD" : "UNSOLD"));

  if (sold) {
    await persistWonProduct(auction, currentProduct);
    await settleWinnerWallet(winnerRecord);
    await notifyAuctionWinner(auction, currentProduct);
  }

  await Product.findByIdAndUpdate(currentProduct.product_id, {
    $set: {
      auction_room_id: auction._id,
      auction_availability: sold ? "SOLD" : "AVAILABLE",
      is_auction_exclusive: false
    }
  });

  const shouldCloseRoom = options.forceRoomClose === true || auction.current_product_index >= auction.products.length - 1;

  if (shouldCloseRoom) {
    const remainingProducts = auction.products.filter((product, index) => (
      index > auction.current_product_index && product.status === "PENDING"
    ));

    if (remainingProducts.length) {
      await Product.updateMany(
        { _id: { $in: remainingProducts.map((product) => product.product_id) } },
        {
          $set: {
            auction_room_id: auction._id,
            auction_availability: "AVAILABLE",
            is_auction_exclusive: false
          }
        }
      );
    }

    auction.status = "ENDED";
    auction.end_time = new Date();
    clearAuctionTimer(room_id);
  } else {
    auction.current_product_index += 1;
    setCurrentProductLive(auction, new Date());
  }

  syncLegacyProductFields(auction);
  await auction.save();

  if (auction.status === "LIVE") {
    await ensureAuctionTimer(room_id);
  }

  await emitAuctionState(room_id);

  return {
    success: true,
    message: sold ? "Product sold successfully" : "Product closed without bids",
    data: {
      result_type: sold ? "SOLD" : "UNSOLD",
      auction_status: auction.status
    }
  };
};

exports.closeRoomService = async (room_id) => {
  const result = await exports.finalizeCurrentProductService(room_id, { forceRoomClose: true, reason: "manual-close" });

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    message: "Room closed successfully"
  };
};

exports.getBidBoardService = async (room_id) => {
  const bids = await Bid.find({ auction_id: room_id })
    .sort({ time: -1 })
    .limit(10)
    .populate("user_id", "username nickname");

  return {
    success: true,
    bids: bids.map((bid) => ({
      _id: bid._id,
      auction_id: bid.auction_id,
      bid_amount: normalizeMoney(bid.bid_amount),
      time: bid.time,
      bidder: {
        user_id: bid.user_id?._id || null,
          nickname: bid.user_id?.nickname || bid.user_id?.username || "Bidder"
        }
      }))
  };
};

exports.getRoomStateService = async (auction_id, viewerId = null) => {
  const auction = await syncTimerSensitiveAuction(auction_id);

  if (!auction) {
    return {
      success: false,
      message: "Auction not found"
    };
  }

  if (viewerId) {
    const customer = await Customer.findById(viewerId).select("_id");

    if (customer) {
      await syncParticipantWallet(auction, viewerId);
      syncLegacyProductFields(auction);
      await auction.save();
    }
  }

  return serializeAuctionState(auction, viewerId);
};

exports.addChatMessageService = async (user_id, auction_id, message) => {
  const trimmedMessage = String(message || "").trim();

  if (!trimmedMessage) {
    throw new Error("Message is required.");
  }

  const auction = await syncTimerSensitiveAuction(auction_id);

  if (!auction) {
    throw new Error("Auction not found");
  }

  const identity = await getCustomerIdentity(user_id);

  auction.chat_messages.push({
    user_id,
    username: identity.display_name,
    message: trimmedMessage
  });

  if (auction.chat_messages.length > DEFAULT_CHAT_LIMIT) {
    auction.chat_messages = auction.chat_messages.slice(-DEFAULT_CHAT_LIMIT);
  }

  await auction.save();

  return {
    success: true,
    message: "Message sent",
    data: auction.chat_messages[auction.chat_messages.length - 1]
  };
};

exports.emitAuctionState = emitAuctionState;
exports.serializeAuctionState = serializeAuctionState;
exports.roomPrefix = ROOM_PREFIX;
exports.ensureAuctionTimer = ensureAuctionTimer;
exports.getCurrentAuctionProduct = getCurrentAuctionProduct;
