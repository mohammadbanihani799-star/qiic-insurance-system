const express = require('express');
const router = express.Router();
const Vehicle = require('../../models/Vehicle');

// Get all vehicles with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await Vehicle.findAll(page, limit);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search vehicles
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search term is required' 
      });
    }
    
    const vehicles = await Vehicle.search(q.trim());
    
    res.json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    console.error('Error searching vehicles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get vehicle by plate number
router.get('/plate/:plateNumber', async (req, res) => {
  try {
    const { plateNumber } = req.params;
    const vehicle = await Vehicle.findByPlateNumber(plateNumber);

    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    res.json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Error fetching vehicle by plate:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get vehicle by chassis number
router.get('/chassis/:chassisNumber', async (req, res) => {
  try {
    const { chassisNumber } = req.params;
    const vehicle = await Vehicle.findByChassisNumber(chassisNumber);

    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    res.json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Error fetching vehicle by chassis:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get vehicles by customer ID
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const vehicles = await Vehicle.findByCustomerId(parseInt(customerId));

    res.json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    console.error('Error fetching customer vehicles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get vehicle by ID with customer details
router.get('/:id/details', async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findWithCustomer(parseInt(id));

    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    res.json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Error fetching vehicle details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(parseInt(id));

    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    res.json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new vehicle
router.post('/', async (req, res) => {
  try {
    const { customerId, plateNumber, make, model, year, chassisNumber, engineNumber } = req.body;

    // Basic validation
    if (!customerId || !plateNumber || !make || !model || !year) {
      return res.status(400).json({ 
        success: false, 
        error: 'Customer ID, plate number, make, model, and year are required' 
      });
    }

    // Check for duplicate plate number
    const existingByPlate = await Vehicle.findByPlateNumber(plateNumber);
    if (existingByPlate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Vehicle with this plate number already exists' 
      });
    }

    // Check for duplicate chassis number if provided
    if (chassisNumber) {
      const existingByChassis = await Vehicle.findByChassisNumber(chassisNumber);
      if (existingByChassis) {
        return res.status(400).json({ 
          success: false, 
          error: 'Vehicle with this chassis number already exists' 
        });
      }
    }

    const vehicleData = { customerId: parseInt(customerId), plateNumber, make, model, year: parseInt(year), chassisNumber, engineNumber };
    const newVehicle = await Vehicle.create(vehicleData);

    res.status(201).json({
      success: true,
      message: 'Vehicle registered successfully',
      data: newVehicle
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update vehicle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { plateNumber, make, model, year, chassisNumber, engineNumber } = req.body;
    
    // Check if vehicle exists
    const existingVehicle = await Vehicle.findById(parseInt(id));
    if (!existingVehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    // Check for duplicate plate (excluding current vehicle)
    if (plateNumber && plateNumber !== existingVehicle.plateNumber) {
      const existingByPlate = await Vehicle.findByPlateNumber(plateNumber);
      if (existingByPlate && existingByPlate.id !== parseInt(id)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Plate number already in use by another vehicle' 
        });
      }
    }

    // Check for duplicate chassis (excluding current vehicle)
    if (chassisNumber && chassisNumber !== existingVehicle.chassisNumber) {
      const existingByChassis = await Vehicle.findByChassisNumber(chassisNumber);
      if (existingByChassis && existingByChassis.id !== parseInt(id)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Chassis number already in use by another vehicle' 
        });
      }
    }

    const updateData = {};
    if (plateNumber !== undefined) updateData.plateNumber = plateNumber;
    if (make !== undefined) updateData.make = make;
    if (model !== undefined) updateData.model = model;
    if (year !== undefined) updateData.year = parseInt(year);
    if (chassisNumber !== undefined) updateData.chassisNumber = chassisNumber;
    if (engineNumber !== undefined) updateData.engineNumber = engineNumber;

    const updated = await Vehicle.update(parseInt(id), updateData);

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete vehicle
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if vehicle exists
    const existingVehicle = await Vehicle.findById(parseInt(id));
    if (!existingVehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }
    
    await Vehicle.delete(parseInt(id));
    
    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

module.exports = router;
