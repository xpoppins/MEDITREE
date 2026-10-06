const Member = require('../models/Member');

async function checkMemberAccess(user, memberId) {
  const member = await Member.findById(memberId);
  if (!member) return { ok: false, status: 404, message: 'Member not found' };

  const sameFamily = String(member.familyId) === String(user.familyId);
  if (!sameFamily) return { ok: false, status: 403, message: 'Not allowed' };

  const isManager = user.role === 'manager';
  const isSelf = user.memberId && String(user.memberId) === String(member._id);
  if (isManager || isSelf) return { ok: true, member };

  return { ok: false, status: 403, message: 'Not allowed' };
}

module.exports = { checkMemberAccess };