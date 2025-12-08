const Lead = require("../models/Lead");
const { createLeadSchema, updateLeadSchema } = require("../validations/lead.validation");

// Create a new lead
exports.createLead = async (req, res) => {
    try {
        const { error } = createLeadSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const messages = error.details.map(d => d.message);
            return res.status(400).json({ success: false, errors: messages });
        }

        const { name, phone, service, address, assignedTo } = req.body;

        const lead = new Lead({
            name,
            phone,
            service,
            address,
            assignedTo,
            createdBy: req.user._id,
        });

        const savedLead = await lead.save();
        res.status(201).json({ success: true, data: savedLead });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get all leads
exports.getLeads = async (req, res) => {
    try {
        const leads = await Lead.find()
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: leads });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


// Get lead by ID from request body
exports.getLeadById = async (req, res) => {
    try {
        const { leadId } = req.body; 
        if (!leadId) return res.status(400).json({ success: false, message: "Lead ID required" });

        const lead = await Lead.findById(leadId)
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");

        if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Update lead (status, remarks, assignment)
exports.updateLead = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ success: false, message: "Lead ID required" });
        }
        const { error } = updateLeadSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const messages = error.details.map(d => d.message);
            return res.status(400).json({ success: false, errors: messages });
        }

        // Extract fields
        const { status, remarks, assignedTo } = req.body;

        // Update lead
        const updatedLead = await Lead.findByIdAndUpdate(
            id,
            { status, remarks, assignedTo, updatedAt: Date.now() },
            { new: true }
        )
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");

        if (!updatedLead) {
            return res.status(404).json({ success: false, message: "Lead not found" });
        }

        res.status(200).json({
            success: true,
            message: "Lead updated successfully",
            data: updatedLead
        });

    } catch (error) {
        console.error("Update Lead Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};




// Delete lead (Admin only)
exports.deleteLead = async (req, res) => {
    try {
        const { leadId } = req.body;  

        if (!leadId) {
            return res.status(400).json({ success: false, message: "Lead ID required" });
        }

        const deletedLead = await Lead.findByIdAndDelete(leadId);

        if (!deletedLead) {
            return res.status(404).json({ success: false, message: "Lead not found" });
        }

        res.status(200).json({ 
            success: true, 
            message: "Lead deleted successfully" 
        });

    } catch (error) {
        console.error("Delete Lead Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

