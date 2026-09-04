const Wishlist = require("./wishlist.model");

/* ADD TO WISHLIST */
exports.add = async (req, res) => {

  try {

    const { user_id, product_id } = req.body;

    const existing = await Wishlist.findOne({
      user_id,
      product_id
    });

    if (existing) {
      return res.json({
        success: false,
        message: "Already in wishlist"
      });
    }

    const wishlist = new Wishlist({
      user_id,
      product_id
    });

    await wishlist.save();

    res.json({
      success: true,
      message: "Added to wishlist",
      data: wishlist
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


/* GET USER WISHLIST */
exports.getUserWishlist = async (req, res) => {

  try {

    const data = await Wishlist.find({
      user_id: req.params.user_id
    }).populate("product_id");

    res.json({
      success: true,
      data
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


/* REMOVE FROM WISHLIST */
exports.remove = async (req, res) => {

  try {

    await Wishlist.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Removed from wishlist"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};