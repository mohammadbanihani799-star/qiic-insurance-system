const express = require('express');
const router = express.Router();
const Customer = require('../../models/Customer');

// Get all customers with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await Customer.findAll(page, limit);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search customers
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search term is required' 
      });
    }
    
    const customers = await Customer.search(q.trim());
    
    res.json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get customer by Qatar ID
router.get('/qatarid/:qatarId', async (req, res) => {
  try {
    const { qatarId } = req.params;
    const customer = await Customer.findByQatarId(qatarId);

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error fetching customer by Qatar ID:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get customer by email
router.get('/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const customer = await Customer.findByEmail(email);

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error fetching customer by email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get customer by phone
router.get('/phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const customer = await Customer.findByPhone(phone);

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error fetching customer by phone:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get customer with vehicles
router.get('/:id/vehicles', async (req, res) => {
  try {
    const { id } = req.params;
    const customerWithVehicles = await Customer.findWithVehicles(parseInt(id));

    if (!customerWithVehicles) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.json({ success: true, data: customerWithVehicles });
  } catch (error) {
    console.error('Error fetching customer with vehicles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get customer with policies
router.get('/:id/policies', async (req, res) => {
  try {
    const { id } = req.params;
    const customerWithPolicies = await Customer.findWithPolicies(parseInt(id));

    if (!customerWithPolicies) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.json({ success: true, data: customerWithPolicies });
  } catch (error) {
    console.error('Error fetching customer with policies:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(parseInt(id));

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, qatarId, address } = req.body;

    // Basic validation
    if (!name || !email || !phone || !qatarId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, email, phone, and Qatar ID are required' 
      });
    }

    // Check if customer already exists
    const existingByEmail = await Customer.findByEmail(email);
    if (existingByEmail) {
      return res.status(400).json({ 
        success: false, 
        error: 'Customer with this email already exists' 
      });
    }

    const existingByQatarId = await Customer.findByQatarId(qatarId);
    if (existingByQatarId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Customer with this Qatar ID already exists' 
      });
    }

    const customerData = { name, email, phone, qatarId, address };
    const newCustomer = await Customer.create(customerData);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: newCustomer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, qatarId, address } = req.body;
    
    // Check if customer exists
    const existingCustomer = await Customer.findById(parseInt(id));
    if (!existingCustomer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    // Check for duplicate email (excluding current customer)
    if (email && email !== existingCustomer.email) {
      const existingByEmail = await Customer.findByEmail(email);
      if (existingByEmail && existingByEmail.id !== parseInt(id)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email already in use by another customer' 
        });
      }
    }

    // Check for duplicate Qatar ID (excluding current customer)
    if (qatarId && qatarId !== existingCustomer.qatarId) {
      const existingByQatarId = await Customer.findByQatarId(qatarId);
      if (existingByQatarId && existingByQatarId.id !== parseInt(id)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Qatar ID already in use by another customer' 
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (qatarId !== undefined) updateData.qatarId = qatarId;
    if (address !== undefined) updateData.address = address;

    const updated = await Customer.update(parseInt(id), updateData);

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if customer exists
    const existingCustomer = await Customer.findById(parseInt(id));
    if (!existingCustomer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    
    await Customer.delete(parseInt(id));
    
    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
