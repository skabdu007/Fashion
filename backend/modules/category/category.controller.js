const Category = require("./category.model");

const normalizeParentId = (value) => {
  const normalized = String(value || "").trim();
  return normalized ? normalized : null;
};

// CREATE
exports.create = async (req, res) => {
  try {
    const normalizedName = String(req.body.name || "").trim();
    const parent_id = normalizeParentId(req.body.parent_id);

    if (!normalizedName) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    const existing = await Category.findOne({
      name: { $regex: `^${normalizedName}$`, $options: "i" }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists"
      });
    }

    if (parent_id) {
      const parentCategory = await Category.findById(parent_id);

      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: "Selected parent category does not exist"
        });
      }
    }

    const category = new Category({
      ...req.body,
      name: normalizedName,
      parent_id
    });

    await category.save();
    await category.populate("parent_id", "name");

    res.status(201).json({
      success: true,
      message: "Category Created Successfully",
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET ALL
exports.getAll = async (req, res) => {
  try {
    const filters = {};

    if (req.query.status) {
      filters.status = String(req.query.status).toUpperCase();
    }

    const categories = await Category.find(filters)
      .populate("parent_id", "name")
      .sort({ name: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET ONE
exports.getOne = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category Not Found" });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// UPDATE
exports.update = async (req, res) => {
  try {
    const normalizedName = String(req.body.name || "").trim();
    const parent_id = normalizeParentId(req.body.parent_id);

    if (!normalizedName) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    const existing = await Category.findOne({
      _id: { $ne: req.params.id },
      name: { $regex: `^${normalizedName}$`, $options: "i" }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists"
      });
    }

    if (parent_id && String(parent_id) === String(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Category cannot be its own parent"
      });
    }

    if (parent_id) {
      const parentCategory = await Category.findById(parent_id);

      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: "Selected parent category does not exist"
        });
      }
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        name: normalizedName,
        parent_id
      },
      { new: true }
    ).populate("parent_id", "name");

    if (!category) {
      return res.status(404).json({ success: false, message: "Category Not Found" });
    }

    res.json({
      success: true,
      message: "Category Updated Successfully",
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// DELETE
exports.delete = async (req, res) => {
  try {
    const childCategory = await Category.findOne({ parent_id: req.params.id });

    if (childCategory) {
      return res.status(400).json({
        success: false,
        message: "Delete child subcategories first before deleting this parent category"
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category Not Found" });
    }

    res.json({
      success: true,
      message: "Category Deleted Successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
