const FREE_READINGS = 5;
const PLAN_MONTHS = 6;
const REGULAR_PAISE = 59900; // ₹599/month
const OFFER_PAISE = 11100; // ₹111 for 6 months
const OFFER_ENDS_AT = new Date(process.env.OFFER_ENDS_AT || '2026-12-31T23:59:59+05:30');

function currentPrice() {
  const offer = new Date() < OFFER_ENDS_AT;
  return {
    amount: offer ? OFFER_PAISE : REGULAR_PAISE,
    offer,
    regular: REGULAR_PAISE,
    display: '₹599/month',
    period: '6 months',
    offerTitle: 'Special Family Discount',
  };
}

module.exports = { FREE_READINGS, PLAN_MONTHS, currentPrice, OFFER_PAISE, REGULAR_PAISE };