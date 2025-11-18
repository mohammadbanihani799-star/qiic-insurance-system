const express = require('express');
const router = express.Router();
const Claim = require('../../models/Claim');

// Get all claims with pagination and filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {};
    
    if (req.query.status) filters.status = req.query.status;
    if (req.query.type) filters.type = req.query.type;
    
    const result = await Claim.findAll(page, limit, filters);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get claims statistics
router.get('/statistics', async (req, res) => {
  try {
    const stats = await Claim.getStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching claim statistics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get claims summary
router.get('/summary', async (req, res) => {
  try {
    const summary = await Claim.getSummary();
    
    res.json({
      success: true,
      count: summary.length,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching claim summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get claim by claim number
router.get('/number/:claimNumber', async (req, res) => {
  try {
    const { claimNumber } = req.params;
    const claim = await Claim.findByClaimNumber(claimNumber);

    if (!claim) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    res.json({ success: true, data: claim });
  } catch (error) {
    console.error('Error fetching claim by number:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get claims by policy ID
router.get('/policy/:policyId', async (req, res) => {
  try {
    const { policyId } = req.params;
    const claims = await Claim.findByPolicyId(parseInt(policyId));

    res.json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (error) {
    console.error('Error fetching policy claims:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get claims by customer ID
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const claims = await Claim.findByCustomerId(parseInt(customerId));

    res.json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (error) {
    console.error('Error fetching customer claims:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get claim with full details
router.get('/:id/details', async (req, res) => {
  try {
    const { id } = req.params;
    const claim = await Claim.findWithDetails(parseInt(id));

    if (!claim) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    res.json({ success: true, data: claim });
  } catch (error) {
    console.error('Error fetching claim details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get claim by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const claim = await Claim.findById(parseInt(id));

    if (!claim) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    res.json({ success: true, data: claim });
  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new claim
router.post('/', async (req, res) => {
  try {
    const { policyId, customerId, type, description, amount, incidentDate } = req.body;

    // Basic validation
    if (!policyId || !customerId || !type || !description || !incidentDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Policy ID, customer ID, type, description, and incident date are required' 
      });
    }

    const claimData = { 
      policyId: parseInt(policyId), 
      customerId: parseInt(customerId), 
      type, 
      description, 
      amount: amount ? parseFloat(amount) : null,
      incidentDate 
    };
    
    const newClaim = await Claim.create(claimData);

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully',
      data: newClaim
    });
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update claim status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const updated = await Claim.updateStatus(parseInt(id), status, notes);

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    res.json({
      success: true,
      message: 'Claim status updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating claim status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Approve claim
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const approved = await Claim.approve(parseInt(id), notes);

    if (!approved) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    res.json({
      success: true,
      message: 'Claim approved successfully',
      data: approved
    });
  } catch (error) {
    console.error('Error approving claim:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reject claim
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({ 
        success: false, 
        error: 'Notes are required when rejecting a claim' 
      });
    }
    
    const rejected = await Claim.reject(parseInt(id), notes);

    if (!rejected) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    res.json({
      success: true,
      message: 'Claim rejected',
      data: rejected
    });
  } catch (error) {
    console.error('Error rejecting claim:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update claim amount
router.patch('/:id/amount', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (amount === undefined || amount === null) {
      return res.status(400).json({ success: false, error: 'Amount is required' });
    }

    const updated = await Claim.updateAmount(parseInt(id), parseFloat(amount));

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    res.json({
      success: true,
      message: 'Claim amount updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating claim amount:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
