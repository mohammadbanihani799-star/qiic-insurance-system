const express = require('express');
const router = express.Router();
const Policy = require('../../models/Policy');

// Get all policies with pagination and filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {};
    
    if (req.query.status) filters.status = req.query.status;
    if (req.query.type) filters.type = req.query.type;
    
    const result = await Policy.findAll(page, limit, filters);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get active policies
router.get('/active', async (req, res) => {
  try {
    const policies = await Policy.findActive();
    
    res.json({
      success: true,
      count: policies.length,
      data: policies
    });
  } catch (error) {
    console.error('Error fetching active policies:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get expiring policies
router.get('/expiring', async (req, res) => {
  try {
    const daysAhead = parseInt(req.query.days) || 30;
    const policies = await Policy.findExpiring(daysAhead);
    
    res.json({
      success: true,
      count: policies.length,
      data: policies,
      daysAhead
    });
  } catch (error) {
    console.error('Error fetching expiring policies:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get policy by policy number
router.get('/number/:policyNumber', async (req, res) => {
  try {
    const { policyNumber } = req.params;
    const policy = await Policy.findByPolicyNumber(policyNumber);

    if (!policy) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }

    res.json({ success: true, data: policy });
  } catch (error) {
    console.error('Error fetching policy by number:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get policies by customer ID
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const policies = await Policy.findByCustomerId(parseInt(customerId));

    res.json({
      success: true,
      count: policies.length,
      data: policies
    });
  } catch (error) {
    console.error('Error fetching customer policies:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get policy with full details
router.get('/:id/details', async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await Policy.findWithDetails(parseInt(id));

    if (!policy) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }

    res.json({ success: true, data: policy });
  } catch (error) {
    console.error('Error fetching policy details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get policy by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await Policy.findById(parseInt(id));

    if (!policy) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }

    res.json({ success: true, data: policy });
  } catch (error) {
    console.error('Error fetching policy:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new policy
router.post('/', async (req, res) => {
  try {
    const { customerId, vehicleId, type, premium, startDate, endDate } = req.body;

    // Basic validation
    if (!customerId || !vehicleId || !type || !premium || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Customer ID, vehicle ID, type, premium, start date, and end date are required' 
      });
    }

    const policyData = { 
      customerId: parseInt(customerId), 
      vehicleId: parseInt(vehicleId), 
      type, 
      premium: parseFloat(premium), 
      startDate, 
      endDate 
    };
    
    const newPolicy = await Policy.create(policyData);

    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      data: newPolicy
    });
  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update policy status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    // Validate status
    const validStatuses = ['active', 'expired', 'cancelled', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const updated = await Policy.updateStatus(parseInt(id), status);

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }

    res.json({
      success: true,
      message: 'Policy status updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating policy status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel policy
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    
    const cancelled = await Policy.cancel(parseInt(id));

    if (!cancelled) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }

    res.json({
      success: true,
      message: 'Policy cancelled successfully',
      data: cancelled
    });
  } catch (error) {
    console.error('Error cancelling policy:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
