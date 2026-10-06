const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true },
    type: { type: String, enum: ['bp', 'sugar', 'weight', 'pulse'], required: true },
    systolic: Number,
    diastolic: Number,
    pulse: Number,
    sugar: Number,
    sugarContext: { type: String, enum: ['fasting', 'after_meal', 'random'] },
    weightKg: Number,
    status: { type: String, enum: ['green', 'amber', 'yellow', 'red'] },
    statusText: String,
    note: { type: String, default: '' },
    takenAt: { type: Date, default: Date.now },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

readingSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Reading', readingSchema);