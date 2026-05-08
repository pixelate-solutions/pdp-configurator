export const DEFAULT_ADMIN_MARGIN = 0.34;

export function marginFromCostSell(cost: number, sellPrice: number) {
  if (sellPrice <= 0) return 0;
  return (sellPrice - cost) / sellPrice;
}

export function sellPriceFromCost(cost: number, margin = DEFAULT_ADMIN_MARGIN) {
  if (margin >= 1) return cost;
  return cost / (1 - margin);
}
