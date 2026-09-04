const Customer = require("../customer/customer.model");
const Vendor = require("../vendor/vendor.model");
const Product = require("../product/product.model");
const Order = require("../order/order.model");
const Auction = require("../auction/auction.model");

exports.getAdminDashboard = async (req, res) => {

  try {

    const totalCustomers = await Customer.countDocuments();

    const totalVendors = await Vendor.countDocuments();

    const totalProducts = await Product.countDocuments();

    const totalAuctions = await Auction.countDocuments();

    const totalOrders = await Order.countDocuments();

    // revenue calculation
    const revenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$total_amount" }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalVendors,
        totalProducts,
        totalAuctions,
        totalOrders,
        totalRevenue: revenue[0]?.total || 0
      }
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};