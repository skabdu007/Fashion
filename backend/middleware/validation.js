/* COMMON EMAIL CHECK */

const isValidEmail = (email) => {
  return email && email.includes("@");
};


/* ADMIN REGISTER */

const validateAdminRegister = (req, res, next) => {

  const { email, password } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Valid email required"
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters"
    });
  }

  next();

};


/* CUSTOMER REGISTER */

const validateCustomerRegister = (req, res, next) => {

  const { username, email, password, dob } = req.body;

  if (!username || username.length < 3) {
    return res.status(400).json({
      success: false,
      message: "Username must be at least 3 characters"
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Valid email required"
    });
  }

  if (!dob) {
    return res.status(400).json({
      success: false,
      message: "Date of birth required"
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters"
    });
  }

  next();

};


/* VENDOR REGISTER */

const validateVendorRegister = (req, res, next) => {

  const { shop_name, email, password, phone } = req.body;

  if (!shop_name || shop_name.length < 3) {
    return res.status(400).json({
      success: false,
      message: "Shop name must be at least 3 characters"
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Valid email required"
    });
  }

  if (!phone || phone.length < 10) {
    return res.status(400).json({
      success: false,
      message: "Valid phone number required"
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters"
    });
  }

  next();

};


/* LOGIN */

const validateLogin = (req, res, next) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password required"
    });
  }

  next();

};


module.exports = {
  validateAdminRegister,
  validateCustomerRegister,
  validateVendorRegister,
  validateLogin
};