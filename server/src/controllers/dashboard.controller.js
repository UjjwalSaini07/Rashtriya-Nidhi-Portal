const Bill = require('../models/Bill');
const Entity = require('../models/Entity');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

async function getStats(req, res) {
  const user = req.user;
  const stateFilter = ['STATE_OFFICER','STATE_ADMIN'].includes(user.role) ? { stateCode: user.stateCode } : {};

  const [totalBills, pendingBills, sanctionedBills, disbursedBills, flaggedBills, totalEntities, totalUsers, recentActivity, amountStats] = await Promise.all([
    Bill.countDocuments(stateFilter),
    Bill.countDocuments({ ...stateFilter, status: { $in: ['SUBMITTED','LEVEL1_REVIEW','LEVEL2_REVIEW','AWAITING_STATE_SIGN','AWAITING_CENTRAL_SIGN'] } }),
    Bill.countDocuments({ ...stateFilter, status: 'SANCTIONED' }),
    Bill.countDocuments({ ...stateFilter, status: 'DISBURSED' }),
    Bill.countDocuments({ ...stateFilter, status: 'FLAGGED' }),
    Entity.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: true }),
    AuditLog.find({}, {}, { sort: { createdAt: -1 }, limit: 10 }).populate('performedBy', 'name nicId'),
    Bill.aggregate([
      { $match: { ...stateFilter, status: { $in: ['SANCTIONED','DISBURSING','DISBURSED'] } } },
      { $group: { _id: null, totalSanctioned: { $sum: '$totalAmount' }, avgAmount: { $avg: '$totalAmount' } } },
    ]),
  ]);

  const stats = amountStats[0] || { totalSanctioned: 0, avgAmount: 0 };
  res.json({ success: true, stats: { totalBills, pendingBills, sanctionedBills, disbursedBills, flaggedBills, totalEntities, totalUsers, ...stats }, recentActivity });
}

async function getStatsByState(req, res) {
  const data = await Bill.aggregate([
    { $group: { _id: '$stateCode', stateName: { $first: '$stateName' }, totalBills: { $sum: 1 }, totalAmount: { $sum: '$totalAmount' }, sanctioned: { $sum: { $cond: [{ $eq: ['$status','SANCTIONED'] }, 1, 0] } } } },
    { $sort: { totalAmount: -1 } },
  ]);
  res.json({ success: true, data });
}

module.exports = { getStats, getStatsByState };
