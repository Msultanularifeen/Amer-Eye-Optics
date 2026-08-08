export function formatPrice(value: number, currency = 'PKR') {
  const num = Number(value);
  if (Number.isNaN(num)) return `${currency} 0`;
  return `${currency} ${num.toLocaleString('en-US')}`;
}

export function discountedPrice(price: number, discount: number | null) {
  if (discount && discount > 0 && discount < price) return discount;
  return price;
}

export function discountPercent(price: number, discount: number | null) {
  if (discount && discount > 0 && discount < price) {
    return Math.round(((price - discount) / price) * 100);
  }
  return 0;
}
