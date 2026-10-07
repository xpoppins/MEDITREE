const FREE_READINGS = 5;
const PLAN_MONTHS = 6;
const REGULAR_PAISE = 9900;
const OFFER_PAISE = 1100;
const OFFER_ENDS_AT = new Date(process.env.OFFER_ENDS_AT || '2026-12-31T23:59:59+05:30');

function currentPrice() {
  const offer = new Date() < OFFER_ENDS_AT;
  return { amount: offer ? OFFER_PAISE : REGULAR_PAISE, offer, regular: REGULAR_PAISE };
}

module.exports = { FREE_READINGS, PLAN_MONTHS, currentPrice };