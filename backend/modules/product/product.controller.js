const Product = require("./product.model");

const productPopulate = [
  { path: "vendor_id", select: "shop_name owner_name" },
  { path: "category_id", select: "name description" }
];

exports.create = async (req, res) => {
  try {
    const {
      vendor_id,
      category_id,
      product_name,
      description,
      price,
      stock,
      status,
      is_auction_exclusive,
      auction_availability
    } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const normalizedAuctionExclusive =
      String(is_auction_exclusive || "false").toLowerCase() === "true";

    const product = await Product.create({
      vendor_id,
      category_id: category_id || null,
      product_name,
      description,
      price,
      stock,
      image,
      status: status || "ACTIVE",
      is_auction_exclusive: normalizedAuctionExclusive,
      auction_availability: normalizedAuctionExclusive
        ? auction_availability || "AVAILABLE"
        : "AVAILABLE"
    });

    const populated = await Product.findById(product._id).populate(productPopulate);

    res.status(201).json({
      success: true,
      message: "Product Created Successfully",
      data: populated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const filters = {};

    if (req.query.category_id) {
      filters.category_id = req.query.category_id;
    }

    const products = await Product.find(filters).populate(productPopulate);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getOne = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(productPopulate);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found"
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate(productPopulate);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found"
      });
    }

    res.json({
      success: true,
      message: "Product Updated Successfully",
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found"
      });
    }

    res.json({
      success: true,
      message: "Product Deleted Successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.search = async (req, res) => {
  try {
    const keyword = req.query.q || "";

    const products = await Product.find({
      product_name: {
        $regex: keyword,
        $options: "i"
      }
    }).populate(productPopulate);

    res.json({
      success: true,
      data: products
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.topRated = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ rating: -1 })
      .limit(10)
      .populate(productPopulate);

    res.json({
      success: true,
      data: products
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.lowStock = async (req, res) => {
  try {
    const products = await Product.find({
      stock: { $lt: 10 }
    }).populate(productPopulate);

    res.json({
      success: true,
      data: products
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.analytics = async (req, res) => {
  try {
    const [totalProducts, lowStock, topSelling] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ stock: { $lt: 10 } }),
      Product.findOne().sort({ sold_count: -1 }).populate(productPopulate)
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        lowStock,
        topSelling
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.topSelling = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ sold_count: -1 })
      .limit(10)
      .populate(productPopulate);

    res.json({
      success: true,
      data: products
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
