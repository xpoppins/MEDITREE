const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    relation: { type: String, default: '' },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
    dob: { type: Date },
    heightCm: { type: Number },
    conditions: [{ type: String }],
    goals: [{ type: String }],
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    hasLogin: { type: Boolean, default: false },
    notes: { type: String, default: '' },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

memberSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Member', memberSchema);