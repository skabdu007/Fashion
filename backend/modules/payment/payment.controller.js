const Payment = require("./payment.model");
const Order = require("../order/order.model");

// DIRECT PAYMENT
exports.payDirect = async (req, res, next) => {

  try {

    const { order_id, amount } = req.body;

    if (!order_id || !amount) {
      return res.status(400).json({
        success: false,
        message: "order_id and amount required"
      });
    }

    const reference = "TXN_" + Date.now();

    const payment = new Payment({
      order_id,
      payment_type: "DIRECT",
      amount,
      payment_status: "SUCCESS",
      transaction_reference: reference
    });

    await payment.save();

    await Order.findByIdAndUpdate(order_id, {
      status: "PAID"
    });

    res.json({
      success: true,
      message: "Payment Successful",
      data: payment
    });

  } catch (error) {
    next(error);
  }

};


// GENERIC PAYMENT
exports.pay = async (req, res, next) => {

  try {

    const { order_id, amount, payment_type } = req.body;

    if (!order_id || !amount || !payment_type) {
      return res.status(400).json({
        success: false,
        message: "order_id, amount and payment_type required"
      });
    }

    const reference = payment_type + "_" + Date.now();

    const payment = new Payment({
      order_id,
      payment_type,
      amount,
      payment_status: "SUCCESS",
      transaction_reference: reference
    });

    await payment.save();

    await Order.findByIdAndUpdate(order_id, {
      status: "PAID"
    });

    res.json({
      success: true,
      message: "Payment Successful",
      data: payment
    });

  } catch (error) {
    next(error);
  }

};


// GET PAYMENT BY ORDER
exports.getPayment = async (req, res, next) => {

  try {

    const payment = await Payment.findOne({
      order_id: req.params.order_id
    });

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    next(error);
  }

};