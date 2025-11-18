const express = require('express');
const router = express.Router();
const carModels = require('../data/carModels');

/**
 * Helper function to normalize make name for case-insensitive matching
 */
const normalizeMakeName = (make) => {
  // Try exact match first (case-insensitive)
  const makeKeys = Object.keys(carModels);
  const found = makeKeys.find(key => key.toLowerCase() === make.toLowerCase());
  return found || make;
};

/**
 * Get all car models (all makes)
 * GET /api/v1/car-models
 */
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: carModels,
      makes_count: Object.keys(carModels).length
    });
  } catch (error) {
    console.error('Error fetching car models:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Get models for a specific car make
 * GET /api/v1/car-models/:make
 */
router.get('/:make', (req, res) => {
  try {
    const { make } = req.params;
    const normalizedMake = normalizeMakeName(make);

    if (!carModels[normalizedMake]) {
      return res.status(404).json({
        success: false,
        message: `No models found for make: ${make}`,
        data: []
      });
    }

    res.json({
      success: true,
      make: normalizedMake,
      data: carModels[normalizedMake],
      count: carModels[normalizedMake].length
    });
  } catch (error) {
    console.error('Error fetching models for make:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Search models for a specific make
 * GET /api/v1/car-models/:make/search?q=land
 */
router.get('/:make/search', (req, res) => {
  try {
    const { make } = req.params;
    const query = req.query.q || '';
    const normalizedMake = normalizeMakeName(make);

    if (!carModels[normalizedMake]) {
      return res.status(404).json({
        success: false,
        message: `No models found for make: ${make}`,
        data: []
      });
    }

    // If no query, return all models for this make
    if (!query.trim()) {
      return res.json({
        success: true,
        make: normalizedMake,
        data: carModels[normalizedMake],
        count: carModels[normalizedMake].length
      });
    }

    // Filter models that contain the query (case-insensitive)
    const filtered = carModels[normalizedMake].filter(model => 
      model.toLowerCase().includes(query.toLowerCase())
    );

    res.json({
      success: true,
      make: normalizedMake,
      data: filtered,
      count: filtered.length,
      query: query.trim()
    });
  } catch (error) {
    console.error('Error searching models:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
