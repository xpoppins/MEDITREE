const Reading = require('../models/Reading');
const { checkMemberAccess } = require('../utils/access');
const { bpStatus, sugarStatus } = require('../utils/healthRules');
const Alert = require('../models/Alert');
const Member = require('../models/Member');

exports.addReading = async (req, res, next) => {
  try {
    const { memberId, type, takenAt, note } = req.body;
    const access = await checkMemberAccess(req.user, memberId);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const data = {
      memberId, familyId: req.user.familyId, type, note, takenAt: takenAt || new Date(), addedBy: req.user._id,
    };

    if (type === 'bp') {
      const { systolic, diastolic, pulse } = req.body;
      if (!systolic || !diastolic) return res.status(400).json({ message: 'Enter both BP numbers' });
      const s = bpStatus(systolic, diastolic);
      Object.assign(data, { systolic, diastolic, pulse, status: s.status, statusText: s.text });
    } else if (type === 'sugar') {
      const { sugar, sugarContext } = req.body;
      if (!sugar) return res.status(400).json({ message: 'Enter sugar value' });
      const s = sugarStatus(sugar, sugarContext);
      Object.assign(data, { sugar, sugarContext, status: s.status, statusText: s.text });
    } else if (type === 'weight') {
      if (!req.body.weightKg) return res.status(400).json({ message: 'Enter weight' });
      data.weightKg = req.body.weightKg;
      data.status = 'green';
      data.statusText = 'Weight recorded';
    } else if (type === 'pulse') {
      if (!req.body.pulse) return res.status(400).json({ message: 'Enter pulse' });
      data.pulse = req.body.pulse;
      data.status = data.pulse >= 50 && data.pulse <= 100 ? 'green' : 'amber';
      data.statusText = data.status === 'green' ? 'Resting heart rate healthy' : 'Resting pulse irregular';
    } else {
      return res.status(400).json({ message: 'Unknown reading type' });
    }

    const reading = await Reading.create(data);

    if (data.status === 'amber' || data.status === 'red') {
      const member = await Member.findById(memberId);
      await Alert.create({
        familyId: data.familyId,
        memberId,
        memberName: member?.name || 'Member',
        type,
        status: data.status,
        valueText: type === 'bp' ? `${data.systolic}/${data.diastolic} mmHg` : type === 'sugar' ? `${data.sugar} mg/dL` : `${data.weightKg} kg`,
        message: `${member?.name || 'Member'}'s ${type.toUpperCase()} is in ${data.status.toUpperCase()} range`,
      });
    }

    res.status(201).json(reading);
  } catch (err) { next(err); }
};

exports.listReadings = async (req, res, next) => {
  try {
    const { memberId, type, days = 30 } = req.query;
    const access = await checkMemberAccess(req.user, memberId);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
    const filter = { memberId, takenAt: { $gte: since } };
    if (type) filter.type = type;

    const readings = await Reading.find(filter).sort({ takenAt: -1 });
    res.json(readings);
  } catch (err) { next(err); }
};

exports.updateReading = async (req, res, next) => {
  try {
    const reading = await Reading.findById(req.params.id);
    if (!reading) return res.status(404).json({ message: 'Not found' });
    const access = await checkMemberAccess(req.user, reading.memberId);
    if (!access.ok) return res.status(access.status).json({ message: access.message });

    const updated = await Reading.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { next(err); }
};

exports.deleteReading = async (req, res, next) => {
  try {
    const reading = await Reading.findById(req.params.id);
    if (!reading) return res.status(404).json({ message: 'Not found' });
    const access = await checkMemberAccess(req.user, reading.memberId);
    if (!access.ok) return res.status(access.status).json({ message: access.message });
    await Reading.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};