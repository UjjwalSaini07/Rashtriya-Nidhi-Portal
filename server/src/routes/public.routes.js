const router = require('express').Router();
const Bill = require('../models/Bill');

// No auth — public citizen transparency portal
router.get('/projects', async (req, res) => {
  const { stateCode, category, page = '1' } = req.query;
  const filter = { status: { $in: ['SANCTIONED','DISBURSING','DISBURSED'] } };
  if (stateCode) filter.stateCode = stateCode;
  if (category) filter.projectCategory = category;
  const skip = (parseInt(page) - 1) * 20;
  const [projects, total] = await Promise.all([
    Bill.find(filter, 'billNumber stateName projectTitle projectCategory totalAmount status sanctionedAt department').sort({ sanctionedAt: -1 }).skip(skip).limit(20),
    Bill.countDocuments(filter),
  ]);
  res.json({ success: true, projects, total, page: parseInt(page), pages: Math.ceil(total / 20) });
});

module.exports = router;
