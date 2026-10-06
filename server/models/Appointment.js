const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    doctorName: { type: String, required: true },
    specialty: { type: String, default: '' },
    clinic: { type: String, default: '' },
    date: { type: String, required: true },
    time: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

appointmentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Appointment', appointmentSchema);