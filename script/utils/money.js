export const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD"});
export const moneyStr = (n) => money.format(Number(n || 0));