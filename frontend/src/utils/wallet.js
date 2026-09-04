export const numericValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const normalizeWallet = (wallet) => {
  if (!wallet) {
    return {
      blue_chips: 0,
      green_chips: 0,
      yellow_chips: 0,
      red_chips: 0,
      black_chips: 0,
      cash_balance: 0,
      total_chips: 0,
      total_wallet_value: 0
    };
  }

  const normalized = {
    ...wallet,
    blue_chips: numericValue(wallet.blue_chips),
    green_chips: numericValue(wallet.green_chips),
    yellow_chips: numericValue(wallet.yellow_chips),
    red_chips: numericValue(wallet.red_chips),
    black_chips: numericValue(wallet.black_chips),
    cash_balance: numericValue(wallet.cash_balance)
  };

  normalized.total_chips =
    normalized.blue_chips +
    normalized.green_chips +
    normalized.yellow_chips +
    normalized.red_chips +
    normalized.black_chips;
  normalized.total_wallet_value = normalized.total_chips + normalized.cash_balance;

  return normalized;
};
