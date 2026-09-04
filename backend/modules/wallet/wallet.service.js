const Wallet = require("./wallet.model");
const WalletTransaction = require("./walletTransaction.model");

const CHIP_FIELDS = Object.freeze({
  blue: "blue_chips",
  green: "green_chips",
  yellow: "yellow_chips",
  red: "red_chips",
  black: "black_chips"
});

const CHIP_SPEND_ORDER = Object.freeze([
  "black_chips",
  "red_chips",
  "yellow_chips",
  "green_chips",
  "blue_chips"
]);

const numericValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeWallet = (wallet) => {
  if (!wallet) return null;

  const normalized = wallet.toObject ? wallet.toObject() : { ...wallet };
  normalized.blue_chips = numericValue(normalized.blue_chips);
  normalized.green_chips = numericValue(normalized.green_chips);
  normalized.yellow_chips = numericValue(normalized.yellow_chips);
  normalized.red_chips = numericValue(normalized.red_chips);
  normalized.black_chips = numericValue(normalized.black_chips);
  normalized.cash_balance = numericValue(normalized.cash_balance);
  normalized.total_chips =
    normalized.blue_chips +
    normalized.green_chips +
    normalized.yellow_chips +
    normalized.red_chips +
    normalized.black_chips;
  normalized.total_wallet_value = normalized.total_chips + normalized.cash_balance;

  return normalized;
};

const validateUserId = (user_id) => {
  if (!user_id || String(user_id).trim() === "") {
    const error = new Error("Valid user_id is required");
    error.statusCode = 400;
    throw error;
  }
};

const validateAmount = (amount, label = "amount") => {
  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    const error = new Error(`${label} must be a valid number greater than 0`);
    error.statusCode = 400;
    throw error;
  }

  return parsedAmount;
};

const getChipField = (chipType = "") => CHIP_FIELDS[String(chipType || "").toLowerCase()] || "";

const ensureSufficientCashBalance = (wallet, requiredAmount) => {
  const availableBalance = numericValue(wallet?.cash_balance);
  const normalizedRequiredAmount = numericValue(requiredAmount);

  if (availableBalance < normalizedRequiredAmount) {
    const error = new Error("Insufficient cash balance to buy chips. Add money first.");
    error.statusCode = 400;
    throw error;
  }
};

const getAvailableChipBalance = (wallet) =>
  Object.values(CHIP_FIELDS).reduce((total, field) => total + numericValue(wallet?.[field]), 0);

const ensureSufficientChipBalance = (wallet, requiredAmount) => {
  const availableBalance = getAvailableChipBalance(wallet);
  const normalizedRequiredAmount = numericValue(requiredAmount);

  if (availableBalance < normalizedRequiredAmount) {
    const error = new Error("Insufficient chips to complete this auction settlement.");
    error.statusCode = 400;
    throw error;
  }
};

const reconcileWalletBalances = async (wallet) => {
  if (!wallet) {
    return wallet;
  }

  const transactions = await WalletTransaction.find({ wallet_id: wallet._id }).lean();

  if (!transactions.length) {
    return wallet;
  }

  const reconciled = {
    blue_chips: 0,
    green_chips: 0,
    yellow_chips: 0,
    red_chips: 0,
    black_chips: 0,
    cash_balance: 0
  };

  for (const transaction of transactions) {
    const signedAmount = transaction.type === "DEBIT"
      ? -numericValue(transaction.amount)
      : numericValue(transaction.amount);

    if (transaction.category === "CHIP") {
      const chipField = getChipField(transaction.chip_type);

      if (chipField) {
        reconciled[chipField] += signedAmount;
      }
      continue;
    }

    reconciled.cash_balance += signedAmount;
  }

  const hasMismatch = Object.entries(reconciled).some(([field, value]) => (
    numericValue(wallet[field]) !== numericValue(value)
  ));

  if (!hasMismatch) {
    return wallet;
  }

  const updatedWallet = await Wallet.findByIdAndUpdate(
    wallet._id,
    {
      $set: reconciled
    },
    { new: true }
  );

  return updatedWallet || wallet;
};

const getOrCreateWallet = async (user_id) => {
  validateUserId(user_id);

  let wallet = await Wallet.findOne({ user_id });

  if (!wallet) {
    wallet = await Wallet.create({
      user_id,
      blue_chips: 0,
      green_chips: 0,
      yellow_chips: 0,
      red_chips: 0,
      black_chips: 0,
      cash_balance: 0,
      transactions: []
    });
    console.log("[wallet] auto-created wallet", { user_id: String(user_id), wallet_id: String(wallet._id) });
  }

  return reconcileWalletBalances(wallet);
};

const createWalletTransaction = async ({
  wallet,
  user_id,
  type,
  category = "SYSTEM",
  chip_type = null,
  amount,
  description,
  metadata = {}
}) => {
  const parsedAmount = validateAmount(amount);

  wallet.transactions.push({
    type,
    amount: parsedAmount,
    description,
    createdAt: new Date()
  });

  await WalletTransaction.create({
    wallet_id: wallet._id,
    user_id,
    type,
    category,
    chip_type,
    amount: parsedAmount,
    description,
    metadata
  });
};

const buildEmbeddedTransaction = ({
  type,
  amount,
  description
}) => ({
  type,
  amount: validateAmount(amount),
  description,
  createdAt: new Date()
});

const applyWalletChanges = async ({
  wallet,
  user_id,
  increments = {},
  transactions = []
}) => {
  const normalizedIncrements = Object.entries(increments).reduce((accumulator, [field, value]) => {
    const numeric = numericValue(value);

    if (numeric !== 0) {
      accumulator[field] = numeric;
    }

    return accumulator;
  }, {});

  const embeddedTransactions = transactions.map(buildEmbeddedTransaction);
  const update = {};

  if (Object.keys(normalizedIncrements).length) {
    update.$inc = normalizedIncrements;
  }

  if (embeddedTransactions.length) {
    update.$push = {
      transactions: {
        $each: embeddedTransactions
      }
    };
  }

  if (!Object.keys(update).length) {
    return wallet;
  }

  const updatedWallet = await Wallet.findByIdAndUpdate(
    wallet._id,
    update,
    { returnDocument: "after" }
  );

  if (transactions.length) {
    await WalletTransaction.insertMany(
      transactions.map((transaction) => ({
        wallet_id: wallet._id,
        user_id,
        type: transaction.type,
        category: transaction.category || "SYSTEM",
        chip_type: transaction.chip_type || null,
        amount: validateAmount(transaction.amount),
        description: transaction.description,
        metadata: transaction.metadata || {}
      }))
    );
  }

  return updatedWallet;
};

const deductAuctionChips = async ({
  wallet,
  user_id,
  amount,
  description = "Auction settlement",
  metadata = {}
}) => {
  const parsedAmount = validateAmount(amount);
  ensureSufficientChipBalance(wallet, parsedAmount);

  let remaining = parsedAmount;
  const increments = {};
  const transactions = [];

  for (const chipField of CHIP_SPEND_ORDER) {
    if (remaining <= 0) {
      break;
    }

    const available = numericValue(wallet?.[chipField]);

    if (available <= 0) {
      continue;
    }

    const deduction = Math.min(available, remaining);
    const chipType = chipField.replace("_chips", "").toUpperCase();

    increments[chipField] = -deduction;
    transactions.push({
      type: "DEBIT",
      category: "CHIP",
      chip_type: chipType,
      amount: deduction,
      description: `${description} (${chipType} chips)`,
      metadata
    });

    remaining -= deduction;
  }

  if (remaining > 0) {
    const error = new Error("Unable to complete chip deduction for this auction settlement.");
    error.statusCode = 500;
    throw error;
  }

  return applyWalletChanges({
    wallet,
    user_id,
    increments,
    transactions
  });
};

module.exports = {
  CHIP_FIELDS,
  CHIP_SPEND_ORDER,
  numericValue,
  normalizeWallet,
  validateUserId,
  validateAmount,
  getChipField,
  ensureSufficientCashBalance,
  getAvailableChipBalance,
  ensureSufficientChipBalance,
  reconcileWalletBalances,
  getOrCreateWallet,
  createWalletTransaction,
  applyWalletChanges,
  deductAuctionChips
};
