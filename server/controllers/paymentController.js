const Razorpay = require('razorpay');
const crypto = require('crypto');
const Family = require('../models/Family');
const Payment = require('../models/Payment');
const Reading = require('../models/Reading');
const { FREE_READINGS, PLAN_MONTHS, currentPrice } = require('../config/plans');

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const addMonths = (date, n) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
};

async function activate(orderId, paymentId) {
  const pay = await Payment.findOneAndUpdate(
    { orderId, status: { $ne: 'paid' } },
    { status: 'paid', paymentId, paidAt: new Date() },
    { new: true }
  );
  if (!pay) return false;
  const family = await Family.findById(pay.familyId);
  const base = family.premiumUntil && family.premiumUntil > new Date() ? family.premiumUntil : new Date();
  family.premiumUntil = addMonths(base, PLAN_MONTHS);
  await family.save();
  return true;
}

exports.status = async (req, res, next) => {
  try {
    const family = await Family.findById(req.user.familyId);
    const used = await Reading.countDocuments({ familyId: req.user.familyId });
    const lastPayment = await Payment.findOne({ familyId: req.user.familyId, status: 'paid' })
      .sort({ paidAt: -1 })
      .select('amount paymentId paidAt orderId');
    res.json({
      isPremium: !!(family.premiumUntil && family.premiumUntil > new Date()),
      premiumUntil: family.premiumUntil,
      used,
      freeLimit: FREE_READINGS,
      price: currentPrice(),
      lastPayment: lastPayment ? {
        amount: lastPayment.amount,
        paymentId: lastPayment.paymentId,
        paidAt: lastPayment.paidAt,
        orderId: lastPayment.orderId,
      } : null,
      memberSince: family.createdAt,
    });
  } catch (err) { next(err); }
};

exports.createOrder = async (req, res, next) => {
  try {
    const price = currentPrice();
    const order = await rzp.orders.create({
      amount: price.amount,
      currency: 'INR',
      receipt: 'rcpt_' + crypto.randomBytes(8).toString('hex'),
      notes: { familyId: String(req.user.familyId), userId: String(req.user._id) },
    });
    await Payment.create({
      familyId: req.user.familyId,
      userId: req.user._id,
      orderId: order.id,
      amount: price.amount,
    });
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      offer: price.offer,
    });
  } catch (err) {
    console.error('Razorpay create-order error:', err?.statusCode, JSON.stringify(err?.error || err?.message || err));
    const msg = err?.error?.description || err?.message || 'Could not start the payment';
    return res.status(err?.statusCode >= 400 && err?.statusCode < 600 ? err.statusCode : 500)
      .json({ message: msg });
  }
};

exports.verify = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment details' });
    }
    const mine = await Payment.findOne({ orderId: razorpay_order_id, familyId: req.user.familyId });
    if (!mine) return res.status(404).json({ message: 'Order not found' });

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }
    await activate(razorpay_order_id, razorpay_payment_id);
    res.json({ ok: true });
  } catch (err) { next(err); }
};

exports.webhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest('hex');
    if (signature !== expected) return res.status(400).send('Invalid signature');

    const event = JSON.parse(req.body.toString());
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const p = event.payload.payment.entity;
      await activate(p.order_id, p.id);
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).send('error');
  }
};