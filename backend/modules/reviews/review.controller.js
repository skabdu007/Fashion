const Review = require("./review.model");

/* CREATE REVIEW */
exports.create = async (req, res) => {
  try {
    const { product_id, user_id, rating, comment } = req.body;
    const review = await Review.findOneAndUpdate(
      { product_id, user_id },
      {
        $set: {
          rating,
          comment
        }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


/* GET PRODUCT REVIEWS */
exports.getByProduct = async (req, res) => {
  try {
    const data = await Review.find({
      product_id: req.params.product_id
    })
      .populate("user_id", "username nickname")
      .sort({ created_at: -1 });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
