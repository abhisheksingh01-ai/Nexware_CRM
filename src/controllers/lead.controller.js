const Lead = require('../models/Lead');

exports.createLead = async (req, res) => {
  try {
    const data = req.body;
    data.createdBy = req.user._id;
    const lead = await Lead.create(data);
    res.status(201).json(lead);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.getLeads = async (req, res) => {
  try {
    // role-based filtering: agents see only their leads
    let filter = {};
    if (req.user.role === 'agent') filter.assignedTo = req.user._id;
    else if (req.user.role === 'teamhead') filter.teamHeadId = req.user._id; // optional relation
    const leads = await Lead.find(filter).populate('assignedTo', 'name email');
    res.json(leads);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.remark) {
      // push remark
      await Lead.findByIdAndUpdate(id, { $push: { remarks: { text: updates.remark, by: req.user._id } } });
    }
    const lead = await Lead.findByIdAndUpdate(id, updates, { new: true });
    res.json(lead);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};
