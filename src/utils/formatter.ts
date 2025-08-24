export const normalizeString = (s?: string | null): string =>
  (s ?? "").trim().toLowerCase();

export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null) return "N/A";

  return amount.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};
