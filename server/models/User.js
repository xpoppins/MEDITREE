const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String },
    googleId: { type: String, sparse: true },
    role: { type: String, enum: ['manager', 'member'], default: 'member' },
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    avatarUrl: { type: String },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);