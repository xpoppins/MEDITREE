const Appointment = require('../models/Appointment');

exports.getAppointments = async (req, res, next) => {
  try {
    const filter = { familyId: req.user.familyId };
    if (req.query.memberId) filter.memberId = req.query.memberId;
    const appointments = await Appointment.find(filter).sort({ date: 1 });
    res.json(appointments);
  } catch (err) { next(err); }
};

exports.addAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.create({ ...req.body, familyId: req.user.familyId });
    res.status(201).json(appointment);
  } catch (err) { next(err); }
};

exports.deleteAppointment = async (req, res, next) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};