const Medicine = require('../models/Medicine');

exports.getMedicines = async (req, res, next) => {
  try {
    const filter = { familyId: req.user.familyId };
    if (req.query.memberId) filter.memberId = req.query.memberId;
    const medicines = await Medicine.find(filter);
    res.json(medicines);
  } catch (err) { next(err); }
};

exports.addMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.create({ ...req.body, familyId: req.user.familyId });
    res.status(201).json(medicine);
  } catch (err) { next(err); }
};

exports.updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!medicine) return res.status(404).json({ message: 'Not found' });
    res.json(medicine);
  } catch (err) { next(err); }
};

exports.deleteMedicine = async (req, res, next) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.toggleTaken = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Not found' });
    medicine.takenToday = !medicine.takenToday;
    await medicine.save();
    res.json(medicine);
  } catch (err) { next(err); }
};