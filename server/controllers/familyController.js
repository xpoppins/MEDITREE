const Family = require('../models/Family');
const Member = require('../models/Member');
const User = require('../models/User');
const Reading = require('../models/Reading');
const Medicine = require('../models/Medicine');
const Appointment = require('../models/Appointment');
const Alert = require('../models/Alert');

exports.getFamily = async (req, res, next) => {
  try {
    const family = await Family.findById(req.user.familyId);
    res.json(family);
  } catch (err) { next(err); }
};

exports.regenerateCode = async (req, res, next) => {
  try {
    const family = await Family.findById(req.user.familyId);
    family.inviteCode = require('crypto').randomBytes(3).toString('hex').toUpperCase();
    await family.save();
    res.json(family);
  } catch (err) { next(err); }
};

exports.getMembers = async (req, res, next) => {
  try {
    const members = await Member.find({ familyId: req.user.familyId });
    res.json(members);
  } catch (err) { next(err); }
};

exports.addMember = async (req, res, next) => {
  try {
    const member = await Member.create({ ...req.body, familyId: req.user.familyId, hasLogin: false });
    res.status(201).json(member);
  } catch (err) { next(err); }
};

exports.updateMember = async (req, res, next) => {
  try {
    const { checkMemberAccess } = require('../utils/access');
    const access = await checkMemberAccess(req.user, req.params.id);
    if (!access.ok) return res.status(access.status).json({ message: access.message });
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(member);
  } catch (err) { next(err); }
};

exports.deleteMember = async (req, res, next) => {
  try {
    const { checkMemberAccess } = require('../utils/access');
    const access = await checkMemberAccess(req.user, req.params.id);
    if (!access.ok) return res.status(access.status).json({ message: access.message });
    await Reading.deleteMany({ memberId: req.params.id });
    await Medicine.deleteMany({ memberId: req.params.id });
    await Appointment.deleteMany({ memberId: req.params.id });
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.createMemberLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    const passwordHash = await require('bcryptjs').hash(password, 10);
    const user = await User.create({
      name: member.name, email, passwordHash, role: 'member', familyId: member.familyId, memberId: member._id,
    });
    member.userId = user._id;
    member.hasLogin = true;
    await member.save();
    res.status(201).json(user);
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const member = await Member.findById(req.params.id);
    if (!member || !member.userId) return res.status(404).json({ message: 'Member not found' });
    const user = await User.findById(member.userId);
    user.passwordHash = await require('bcryptjs').hash(password, 10);
    await user.save();
    res.json({ message: 'Password reset' });
  } catch (err) { next(err); }
};

exports.getAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ familyId: req.user.familyId }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) { next(err); }
};

exports.dismissAlert = async (req, res, next) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ message: 'Dismissed' });
  } catch (err) { next(err); }
};