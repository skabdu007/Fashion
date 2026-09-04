const Cart = require("./cart.model");

// Add to cart
exports.addToCart = async (req, res, next) => {

  try {

    const { user_id, product_id, quantity, price } = req.body;

    if (!user_id || !product_id) {
      return res.status(400).json({
        success: false,
        message: "user_id and product_id required"
      });
    }

    let cart = await Cart.findOne({
      user_id,
      status: "ACTIVE"
    });

    if (!cart) {
      cart = new Cart({ user_id, items: [] });
    }

    const existingItem = cart.items.find(
      item => item.product_id.toString() === product_id
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({
        product_id,
        quantity: quantity || 1,
        price
      });
    }

    await cart.save();

    res.json({
      success: true,
      message: "Product added to cart",
      data: cart
    });

  } catch (error) {
    next(error);
  }

};


// View cart
exports.viewCart = async (req, res, next) => {

  try {

    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id required"
      });
    }

    const cart = await Cart.findOne({ user_id })
      .populate("items.product_id", "product_name price");

    res.json({
      success: true,
      data: cart ? cart.items : []
    });

  } catch (error) {
    next(error);
  }

};


// Update quantity
exports.updateItem = async (req, res, next) => {

  try {

    const { user_id, quantity } = req.body;

    const cart = await Cart.findOne({ user_id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.quantity = quantity;

    await cart.save();

    res.json({
      success: true,
      message: "Cart updated"
    });

  } catch (error) {
    next(error);
  }

};


// Remove item
exports.removeItem = async (req, res, next) => {

  try {

    const { user_id } = req.body;

    const cart = await Cart.findOne({ user_id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    cart.items.pull(req.params.id);

    await cart.save();

    res.json({
      success: true,
      message: "Item removed"
    });

  } catch (error) {
    next(error);
  }

};