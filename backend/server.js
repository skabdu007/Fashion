require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db");
const auctionService = require("./modules/auction/auction.service");
const Auction = require("./modules/auction/auction.model");
const { setIo } = require("./socket/socketStore");
const { normalizeDecodedUser } = require("./middleware/auth");

const app = express();
const server = http.createServer(app);

connectDB();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim().replace(/\/$/, ""))
  : [];

const corsOriginHandler = (origin, callback) => {
  if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin) || allowedOrigins.includes("*") || process.env.NODE_ENV !== "production") {
    return callback(null, true);
  }
  return callback(null, true); // Permissive fallback to prevent breaking cloud deployments
};

app.use(cors({
  origin: corsOriginHandler,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/admin", require("./modules/admin/admin.routes"));
app.use("/api/customer", require("./modules/customer/customer.routes"));
app.use("/api/vendor", require("./modules/vendor/vendor.routes"));
app.use("/api/product", require("./modules/product/product.routes"));
app.use("/api/category", require("./modules/category/category.routes"));
app.use("/api/cart", require("./modules/cart/cart.routes"));
app.use("/api/order", require("./modules/order/order.routes"));
app.use("/api/payment", require("./modules/payment/payment.routes"));
app.use("/api/wallet", require("./modules/wallet/wallet.routes"));
app.use("/api/auction", require("./modules/auction/auction.routes"));
app.use("/api/bidding", require("./modules/bidding/bidding.routes"));
app.use("/api/winner", require("./modules/winner/winner.routes"));
app.use("/api/hosting", require("./modules/hosting/hosting.routes"));
app.use("/api/subscription", require("./modules/Subscription/subscription.routes"));
app.use("/api/notification", require("./modules/notification/notification.routes"));
app.use("/api/notifications", require("./modules/notification/notification.routes"));
app.use("/api/reviews", require("./modules/reviews/review.routes"));
app.use("/api/wishlist", require("./modules/wishlist/wishlist.routes"));
app.use("/api/dashboard", require("./modules/dashboard/dashboard.routes"));
app.use("/api/upload", require("./modules/upload/upload.routes"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Fashion Auction API Running"
  });
});

app.use(require("./middleware/errorHandler"));

const PORT = process.env.PORT || 5001;
const io = new Server(server, {
  cors: {
    origin: corsOriginHandler,
    credentials: true
  }
});

setIo(io);

Auction.find({ status: "LIVE" })
  .select("_id")
  .then((auctions) => Promise.all(auctions.map((auction) => auctionService.ensureAuctionTimer(auction._id))))
  .catch(() => {});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "");

  if (!token) {
    socket.user = null;
    return next();
  }

  const secrets = [
    process.env.JWT_SECRET_ADMIN,
    process.env.JWT_SECRET_CUSTOMER,
    process.env.JWT_SECRET_VENDOR
  ];

  for (const secret of secrets) {
    try {
      socket.user = normalizeDecodedUser(jwt.verify(token, secret));
      return next();
    } catch (error) {}
  }

  return next(new Error("Invalid token"));
});

io.on("connection", (socket) => {
  socket.on("auction:join", async ({ auctionId }, callback = () => {}) => {
    try {
      socket.join(`${auctionService.roomPrefix}${auctionId}`);

      let result;
      if (socket.user?.role === "CUSTOMER") {
        result = await auctionService.enterAuctionService(socket.user.id, auctionId);
      } else {
        result = await auctionService.getRoomStateService(auctionId, socket.user?.id || null);
      }

      if (!result.success) {
        callback(result);
        return;
      }

      callback({ success: true, data: result.data });
      await auctionService.emitAuctionState(auctionId, socket.user?.id || null);
    } catch (error) {
      callback({ success: false, message: error.message });
    }
  });

  socket.on("auction:bid", async ({ auctionId, bidAmount }, callback = () => {}) => {
    try {
      if (!socket.user?.id || socket.user?.role !== "CUSTOMER") {
        callback({ success: false, message: "Only customers can bid." });
        return;
      }

      const result = await auctionService.placeBidService(socket.user.id, auctionId, bidAmount);
      callback(result);

      if (result.success) {
        io.to(`${auctionService.roomPrefix}${auctionId}`).emit("auction:bid-placed", {
          bidder_name: result.data.room.highest_bidder_name,
          current_price: result.data.room.current_price
        });
        await auctionService.emitAuctionState(auctionId, socket.user.id);
      }
    } catch (error) {
      callback({ success: false, message: error.message });
    }
  });

  socket.on("auction:fold", async ({ auctionId }, callback = () => {}) => {
    try {
      if (!socket.user?.id || socket.user?.role !== "CUSTOMER") {
        callback({ success: false, message: "Only customers can fold." });
        return;
      }

      const result = await auctionService.foldBidderService(socket.user.id, auctionId);
      callback(result);

      if (result.success) {
        await auctionService.emitAuctionState(auctionId, socket.user.id);
      }
    } catch (error) {
      callback({ success: false, message: error.message });
    }
  });

  socket.on("auction:chat", async ({ auctionId, message }, callback = () => {}) => {
    try {
      if (!socket.user?.id || socket.user?.role !== "CUSTOMER") {
        callback({ success: false, message: "Only customers can chat." });
        return;
      }

      const result = await auctionService.addChatMessageService(socket.user.id, auctionId, message);
      callback(result);

      if (result.success) {
        io.to(`${auctionService.roomPrefix}${auctionId}`).emit("auction:chat-message", result.data);
        await auctionService.emitAuctionState(auctionId, socket.user.id);
      }
    } catch (error) {
      callback({ success: false, message: error.message });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
