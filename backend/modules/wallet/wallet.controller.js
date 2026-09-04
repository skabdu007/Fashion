const WalletTransaction = require("./walletTransaction.model");
const {
  CHIP_FIELDS,
  normalizeWallet,
  validateUserId,
  validateAmount,
  getChipField,
  getOrCreateWallet,
  ensureSufficientCashBalance,
  applyWalletChanges
} = require("./wallet.service");

const ensureWalletAccess = (req, user_id) => {
  const requesterId = String(req.user?.id || "");
  const requesterRole = String(req.user?.role || "").toUpperCase();
  const targetUserId = String(user_id || "");

  if (["ADMIN", "SUPER_ADMIN"].includes(requesterRole)) {
    return;
  }

  if (requesterRole === "CUSTOMER" && requesterId === targetUserId) {
    return;
  }

  const error = new Error("Not authorized to access this wallet");
  error.statusCode = 403;
  throw error;
};

exports.buyChips = async (req, res) => {
  try {
    const { user_id, chip_type, amount } = req.body;
    console.log("[wallet] buyChips request", req.body);

    ensureWalletAccess(req, user_id);
    validateUserId(user_id);
    const parsedAmount = validateAmount(amount);
    const chipField = getChipField(chip_type);

    if (!Object.values(CHIP_FIELDS).includes(chipField)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chip_type"
      });
    }

    const wallet = await getOrCreateWallet(user_id);
    ensureSufficientCashBalance(wallet, parsedAmount);
    const updatedWallet = await applyWalletChanges({
      wallet,
      user_id,
      increments: {
        cash_balance: -parsedAmount,
        [chipField]: parsedAmount
      },
      transactions: [
        {
          type: "DEBIT",
          category: "CASH",
          amount: parsedAmount,
          description: `Cash used to buy ${String(chip_type).toUpperCase()} chips`,
          metadata: {
            chip_type: String(chip_type).toUpperCase()
          }
        },
        {
          type: "CREDIT",
          category: "CHIP",
          chip_type: String(chip_type).toUpperCase(),
          amount: parsedAmount,
          description: `${String(chip_type).toUpperCase()} chips purchased with cash`
        }
      ]
    });
    const normalizedWallet = normalizeWallet(updatedWallet);
    console.log("[wallet] buyChips success", { user_id: String(user_id), chipField, parsedAmount, wallet: normalizedWallet });

    res.json({
      success: true,
      message: "Chips purchased successfully",
      data: normalizedWallet
    });
  } catch (error) {
    console.error("[wallet] buyChips error", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

exports.addChips = exports.buyChips;

exports.deductChips = async (req, res) => {
  try {
    const { user_id, chip_type, amount } = req.body;
    console.log("[wallet] deductChips request", req.body);

    ensureWalletAccess(req, user_id);
    validateUserId(user_id);
    const parsedAmount = validateAmount(amount);
    const chipField = getChipField(chip_type);

    if (!Object.values(CHIP_FIELDS).includes(chipField)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chip_type"
      });
    }

    const wallet = await getOrCreateWallet(user_id);

    if (Number(wallet[chipField] || 0) < parsedAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient chips"
      });
    }

    const updatedWallet = await applyWalletChanges({
      wallet,
      user_id,
      increments: {
        [chipField]: -parsedAmount
      },
      transactions: [
        {
          type: "DEBIT",
          category: "CHIP",
          chip_type: String(chip_type).toUpperCase(),
          amount: parsedAmount,
          description: `${String(chip_type).toUpperCase()} chips deducted`
        }
      ]
    });

    res.json({
      success: true,
      message: "Chips Deducted Successfully",
      data: normalizeWallet(updatedWallet)
    });
  } catch (error) {
    console.error("[wallet] deductChips error", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

exports.addMoney = async (req, res) => {
  try {
    const { user_id, amount } = req.body;
    console.log("[wallet] addMoney request", req.body);

    ensureWalletAccess(req, user_id);
    validateUserId(user_id);
    const parsedAmount = validateAmount(amount, "amount");

    const wallet = await getOrCreateWallet(user_id);
    const updatedWallet = await applyWalletChanges({
      wallet,
      user_id,
      increments: {
        cash_balance: parsedAmount
      },
      transactions: [
        {
          type: "CREDIT",
          category: "CASH",
          amount: parsedAmount,
          description: "Cash balance added"
        }
      ]
    });
    const normalizedWallet = normalizeWallet(updatedWallet);
    console.log("[wallet] addMoney success", { user_id: String(user_id), parsedAmount, wallet: normalizedWallet });

    res.json({
      success: true,
      message: "Money added successfully",
      data: normalizedWallet
    });
  } catch (error) {
    console.error("[wallet] addMoney error", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { user_id } = req.params;
    console.log("[wallet] getHistory request", { user_id });
    ensureWalletAccess(req, user_id);
    validateUserId(user_id);

    const wallet = await getOrCreateWallet(user_id);
    const transactions = await WalletTransaction.find({ user_id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: transactions.length
        ? transactions
        : [...wallet.transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    });
  } catch (error) {
    console.error("[wallet] getHistory error", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

exports.viewWallet = async (req, res) => {
  try {
    const { user_id } = req.params;
    console.log("[wallet] viewWallet request", { user_id });
    ensureWalletAccess(req, user_id);
    validateUserId(user_id);

    const wallet = await getOrCreateWallet(user_id);

    res.json({
      success: true,
      data: normalizeWallet(wallet)
    });
  } catch (error) {
    console.error("[wallet] viewWallet error", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};
