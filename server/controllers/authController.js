const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Family = require('../models/Family');
const User = require('../models/User');
const Member = require('../models/Member');

const makeToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const makeInviteCode = () => crypto.randomBytes(3).toString('hex').toUpperCase();

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  familyId: user.familyId,
  memberId: user.memberId,
  onboardingCompleted: user.onboardingCompleted,
});

exports.registerManager = async (req, res, next) => {
  try {
    const { name, email, password, familyName } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already used' });
    }
    const family = await Family.create({ name: familyName, inviteCode: makeInviteCode() });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, passwordHash, role: 'manager', familyId: family._id,
    });
    const member = await Member.create({
      familyId: family._id, userId: user._id, name, relation: 'Self / Manager', hasLogin: true,
    });
    user.memberId = member._id;
    await user.save();

    res.status(201).json({ token: makeToken(user._id), user: userPayload(user), family });
  } catch (err) { next(err); }
};

exports.joinFamily = async (req, res, next) => {
  try {
    const { name, email, password, inviteCode } = req.body;
    const family = await Family.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
    if (!family) return res.status(400).json({ message: 'Invalid invite code' });
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already used' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, passwordHash, role: 'member', familyId: family._id,
    });
    const member = await Member.create({ familyId: family._id, userId: user._id, name, hasLogin: true });
    user.memberId = member._id;
    await user.save();

    res.status(201).json({ token: makeToken(user._id), user: userPayload(user) });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(400).json({ message: 'Wrong email or password' });
    }
    res.json({ token: makeToken(user._id), user: userPayload(user) });
  } catch (err) { next(err); }
};

exports.googleLogin = async (req, res, next) => {
  try {
    const { email, name, googleId } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No account found. Please register first.' });
    }
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
    res.json({ token: makeToken(user._id), user: userPayload(user) });
  } catch (err) { next(err); }
};

exports.me = (req, res) => res.json({ user: userPayload(req.user) });