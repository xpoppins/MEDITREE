const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    name: { type: String, required: true },
    dose: { type: String, default: '1 tablet' },
    times: [{ type: String }],
    days: [{ type: String }],
    instructions: { type: String, default: '' },
    condition: { type: String, default: '' },
    use: { type: String, default: '' },
    usageTiming: { type: String, default: '' },
    precautions: [{ type: String }],
    genericName: { type: String, default: '' },
    dosageForm: { type: String, default: '' },
    strength: { type: String, default: '' },
    manufacturer: { type: String, default: '' },
    composition: {
      salts: [
        {
          name: String,
          amount: String,
        },
      ],
    },
    prescriptionRequired: { type: Boolean, default: true },
    prescribedBy: { type: String, default: '' },
    takenToday: { type: Boolean, default: false },
  },
  { timestamps: true }
);

medicineSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Medicine', medicineSchema);