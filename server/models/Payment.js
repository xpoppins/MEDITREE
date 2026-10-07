const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String, required: true, unique: true },
    paymentId: String,
    amount: Number,
    status: { type: String, enum: ['created', 'paid'], default: 'created' },
    paidAt: Date,
  },
  { timestamps: true }
);

paymentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Payment', paymentSchema);