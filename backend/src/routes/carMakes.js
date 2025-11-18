const express = require('express');
const router = express.Router();
const carMakes = require('../data/carMakes');

/**
 * Get all car makes
 * GET /api/v1/car-makes
 */
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: carMakes,
      count: carMakes.length
    });
  } catch (error) {
    console.error('Error fetching car makes:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Search car makes
 * GET /api/v1/car-makes/search?q=toyota
 */
router.get('/search', (req, res) => {
  try {
    const query = req.query.q || '';

    // If no query, return all makes
    if (!query.trim()) {
      return res.json({
        success: true,
        data: carMakes,
        count: carMakes.length
      });
    }

    // Filter makes that contain the query (case-insensitive)
    const filtered = carMakes.filter(make => 
      make.toLowerCase().includes(query.toLowerCase())
    );

    res.json({
      success: true,
      data: filtered,
      count: filtered.length,
      query: query.trim()
    });
  } catch (error) {
    console.error('Error searching car makes:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Get car make by name
 * GET /api/v1/car-makes/:make
 */
router.get('/:make', (req, res) => {
  try {
    const { make } = req.params;

    // Find exact match (case-insensitive)
    const found = carMakes.find(item => 
      item.toLowerCase() === make.toLowerCase()
    );

    if (!found) {
      return res.status(404).json({
        success: false,
        message: 'Car make not found'
      });
    }

    res.json({
      success: true,
      data: found
    });
  } catch (error) {
    console.error('Error fetching car make:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
