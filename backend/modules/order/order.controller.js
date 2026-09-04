const Order = require("./order.model");
const Product = require("../product/product.model");
const Customer = require("../customer/customer.model");
const Wallet = require("../wallet/wallet.model");
const WalletTransaction = require("../wallet/walletTransaction.model");
const Subscription = require("../Subscription/subscription.model");
const Notification = require("../notification/notification.model");

const WALLET_PAYMENT_METHOD = "WALLET";
const SUPPORTED_PAYMENT_METHODS = ["WALLET", "UPI", "COD", "CARD", "BANKING"];

const buildEligibilityPayload = async (userId, orderTotal = 0) => {
  const [wallet, subscription] = await Promise.all([
    Wallet.findOne({ user_id: userId }),
    Subscription.findOne({
      user_id: userId,
      status: "ACTIVE",
      end_date: { $gte: new Date() }
    }).sort({ end_date: -1 })
  ]);

  const walletBalance = Number(wallet?.cash_balance || 0);
  const hasOrderFunds = orderTotal <= 0 || walletBalance >= orderTotal;

  const reasons = [];

  if (!wallet) {
    reasons.push("Wallet not found for this account.");
  }

  if (!hasOrderFunds) {
    reasons.push("Your wallet does not have enough balance for this order total.");
  }

  return {
    eligible: true,
    walletRequired: false,
    walletEligible: Boolean(wallet) && hasOrderFunds,
    walletBalance,
    minimumRequiredBalance: Number(orderTotal || 0),
    activeSubscription: subscription,
    reasons
  };
};

const rollbackProductStock = async (updatedProducts) => {
  await Promise.all(
    updatedProducts.map(({ productId, quantity }) =>
      Product.findByIdAndUpdate(productId, {
        $inc: {
          stock: quantity,
          sold_count: -quantity
        }
      })
    )
  );
};

exports.getOrderEligibility = async (req, res) => {
  try {
    const { user_id } = req.params;
    const requestedTotal = Number(req.query.total_amount || 0);

    if (req.user.role === "CUSTOMER" && req.user.id !== user_id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this eligibility"
      });
    }

    const eligibility = await buildEligibilityPayload(user_id, requestedTotal);

    res.json({
      success: true,
      data: eligibility
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.createOrder = async (req, res) => {
  const updatedProducts = [];
  let walletDeducted = false;
  let deductedAmount = 0;

  try {
    let { user_id, items, total_amount, payment_method } = req.body;

    if (!user_id || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order data"
      });
    }

    if (req.user.role === "CUSTOMER" && String(req.user.id) !== String(user_id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to place this order"
      });
    }

    if (!user_id || String(user_id).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Invalid user_id"
      });
    }

    const formattedItems = items.map((item) => {
      if (!item.product_id || String(item.product_id).trim() === "") {
        const error = new Error("Invalid product_id");
        error.statusCode = 400;
        throw error;
      }

      const quantity = Number(item.quantity);
      const price = Number(item.price);

      if (quantity <= 0 || price < 0) {
        const error = new Error("Invalid item quantity or price");
        error.statusCode = 400;
        throw error;
      }

      return {
        product_id: item.product_id,
        quantity,
        price
      };
    });

    const computedTotal = formattedItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    total_amount = Number(total_amount) === computedTotal
      ? Number(total_amount)
      : computedTotal;

    payment_method = String(payment_method || WALLET_PAYMENT_METHOD).toUpperCase();

    if (!SUPPORTED_PAYMENT_METHODS.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported payment method"
      });
    }

    const eligibility = await buildEligibilityPayload(user_id, total_amount);

    if (payment_method === WALLET_PAYMENT_METHOD && !eligibility.walletEligible) {
      return res.status(403).json({
        success: false,
        message: eligibility.reasons[0] || "You are not eligible to place this order.",
        data: eligibility
      });
    }

    for (const item of formattedItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product_id,
          stock: { $gte: item.quantity }
        },
        {
          $inc: {
            stock: -item.quantity,
            sold_count: item.quantity
          }
        },
        { new: true }
      );

      if (!updatedProduct) {
        const error = new Error("One or more products are out of stock.");
        error.statusCode = 400;
        throw error;
      }

      updatedProducts.push({
        productId: item.product_id,
        quantity: item.quantity
      });
    }

    let updatedWallet = null;

    if (payment_method === WALLET_PAYMENT_METHOD) {
      updatedWallet = await Wallet.findOneAndUpdate(
        {
          user_id,
          cash_balance: { $gte: total_amount }
        },
        {
          $inc: {
            cash_balance: -total_amount
          },
          $push: {
            transactions: {
              type: "DEBIT",
              amount: total_amount,
              description: "Order payment deducted"
            }
          }
        },
        { new: true }
      );

      if (!updatedWallet) {
        const error = new Error("Wallet deduction failed due to insufficient balance.");
        error.statusCode = 400;
        throw error;
      }

      walletDeducted = true;
      deductedAmount = total_amount;

      await WalletTransaction.create({
        wallet_id: updatedWallet._id,
        user_id,
        type: "DEBIT",
        category: "ORDER",
        amount: total_amount,
        description: "Order payment deducted",
        metadata: {
          source: "order.create"
        }
      });
    }

    const order = await Order.create({
      user_id,
      items: formattedItems,
      total_amount,
      payment_method,
      status: payment_method === WALLET_PAYMENT_METHOD ? "PAID" : "PENDING",
      delivery_deadline: new Date(Date.now() + 60 * 60 * 1000)
    });

    await Customer.findByIdAndUpdate(user_id, {
      $inc: {
        orders_count: 1,
        total_spent: total_amount
      }
    });

    await Notification.insertMany([
      {
        user_id,
        type: "ORDER",
        title: "Order placed successfully",
        message: `Your order for Rs. ${total_amount.toLocaleString()} has been placed.`,
        link: `/order/${order._id}`,
        metadata: {
          order_id: order._id
        }
      },
      ...(payment_method === WALLET_PAYMENT_METHOD
        ? [{
            user_id,
            type: "PAYMENT",
            title: "Wallet payment completed",
            message: `Rs. ${total_amount.toLocaleString()} was deducted from your wallet for order payment.`,
            link: `/order/${order._id}`,
            metadata: {
              order_id: order._id,
              amount: total_amount
            }
          }]
        : [{
            user_id,
            type: "PAYMENT",
            title: `${payment_method} payment selected`,
            message: `Your order is waiting for ${payment_method} payment confirmation.`,
            link: `/order/${order._id}`,
            metadata: {
              order_id: order._id,
              amount: total_amount,
              payment_method
            }
          }])
    ]);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: {
        order,
        wallet_balance: updatedWallet?.cash_balance
      }
    });
  } catch (err) {
    if (updatedProducts.length > 0) {
      await rollbackProductStock(updatedProducts);
    }

    if (walletDeducted) {
      await Wallet.findOneAndUpdate(
        { user_id: req.body.user_id },
        {
          $inc: { cash_balance: deductedAmount },
          $push: {
            transactions: {
              type: "CREDIT",
              amount: deductedAmount,
              description: "Order rollback refund"
            }
          }
        }
      );

      const rollbackWallet = await Wallet.findOne({ user_id: req.body.user_id });
      if (rollbackWallet) {
        await WalletTransaction.create({
          wallet_id: rollbackWallet._id,
          user_id: req.body.user_id,
          type: "CREDIT",
          category: "REFUND",
          amount: deductedAmount,
          description: "Order rollback refund",
          metadata: {
            source: "order.create.rollback"
          }
        });
      }
    }

    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (req.user.role === "CUSTOMER" && req.user.id !== user_id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view these orders"
      });
    }

    const orders = await Order.find({ user_id })
      .populate("items.product_id", "product_name price image")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const { order_id } = req.params;

    const order = await Order.findById(order_id)
      .populate("user_id", "username email")
      .populate("items.product_id", "product_name price image");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { order_id } = req.params;

    const order = await Order.findByIdAndUpdate(order_id, req.body, { new: true });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order updated successfully",
      data: order
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body;

    const allowedFlow = [
      "PENDING",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED"
    ];

    if (!allowedFlow.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const order = await Order.findById(order_id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.status === "DELIVERED") {
      return res.status(400).json({
        success: false,
        message: "Cannot update delivered order"
      });
    }

    order.status = status;
    order.delivered_at = status === "DELIVERED" ? new Date() : order.delivered_at;
    await order.save();

    res.json({
      success: true,
      message: "Status updated",
      data: order
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { order_id } = req.params;

    const order = await Order.findById(order_id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.status === "DELIVERED") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel delivered order"
      });
    }

    if (order.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled"
      });
    }

    if (order.status === "PAID" && order.payment_method === WALLET_PAYMENT_METHOD) {
      const refundedWallet = await Wallet.findOneAndUpdate(
        { user_id: order.user_id },
        {
          $inc: { cash_balance: order.total_amount },
          $push: {
            transactions: {
              type: "CREDIT",
              amount: order.total_amount,
              description: "Refund for cancelled order"
            }
          }
        }
      );

      if (refundedWallet) {
        await WalletTransaction.create({
          wallet_id: refundedWallet._id,
          user_id: order.user_id,
          type: "CREDIT",
          category: "REFUND",
          amount: order.total_amount,
          description: "Refund for cancelled order",
          metadata: {
            order_id: order._id
          }
        });
      }

      await Notification.create({
        user_id: order.user_id,
        type: "PAYMENT",
        title: "Wallet refund processed",
        message: `Rs. ${order.total_amount.toLocaleString()} has been refunded for your cancelled order.`,
        link: `/order/${order._id}`,
        metadata: {
          order_id: order._id,
          amount: order.total_amount
        }
      });
    }

    order.status = "CANCELLED";
    await order.save();

    await Notification.create({
      user_id: order.user_id,
      type: "ORDER",
      title: "Order cancelled",
      message: `Your order #${String(order._id).slice(-8)} was cancelled.`,
      link: `/order/${order._id}`,
      metadata: {
        order_id: order._id
      }
    });

    res.json({
      success: true,
      message: "Order cancelled",
      data: order
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { order_id } = req.params;

    const order = await Order.findByIdAndDelete(order_id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Order deleted"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user_id", "username email")
      .populate("items.product_id", "product_name price image")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.orderAnalytics = async (req, res) => {
  try {
    const [total, pending, delivered, cancelled] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "PENDING" }),
      Order.countDocuments({ status: "DELIVERED" }),
      Order.countDocuments({ status: "CANCELLED" })
    ]);

    res.json({
      success: true,
      data: {
        totalOrders: total,
        pending,
        delivered,
        cancelled
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
