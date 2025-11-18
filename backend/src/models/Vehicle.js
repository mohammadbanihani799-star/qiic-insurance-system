const Joi = require('joi');

const vehicleSchema = Joi.object({
  vehicleId: Joi.string().required(),
  customerId: Joi.string().required(),
  plateNumber: Joi.string().required(),
  plateCode: Joi.number().integer().min(1).max(999).required(), // Qatar plate code
  plateType: Joi.string().valid('private', 'transport', 'government', 'temporary').required(),
  chassisNumber: Joi.string().length(17).required(), // VIN is 17 characters
  make: Joi.string().required(), // Toyota, Nissan, etc.
  model: Joi.string().required(),
  year: Joi.number().integer().min(1990).max(new Date().getFullYear() + 1).required(),
  color: Joi.string().required(),
  colorArabic: Joi.string(),
  engineCapacity: Joi.number().positive(),
  vehicleType: Joi.string().valid('sedan', 'suv', 'truck', 'motorcycle', 'bus', 'van').required(),
  seatingCapacity: Joi.number().integer().positive().required(),
  registrationDate: Joi.date().required(),
  registrationExpiry: Joi.date().required(),
  purchaseDate: Joi.date(),
  estimatedValue: Joi.number().positive().required(), // in QAR
  currentValue: Joi.number().positive(),
  usage: Joi.string().valid('personal', 'commercial', 'taxi', 'rental').default('personal'),
  createdAt: Joi.date().default(Date.now),
  updatedAt: Joi.date().default(Date.now)
});

class Vehicle {
  static validate(data) {
    return vehicleSchema.validate(data);
  }

  static create(data) {
    const { error, value } = this.validate(data);
    if (error) {
      throw new Error(error.details[0].message);
    }
    return value;
  }

  static calculateDepreciation(purchaseValue, years, usageType = 'personal') {
    // Qatar insurance depreciation rates
    const depreciationRates = {
      personal: 0.15,  // 15% per year
      commercial: 0.20, // 20% per year
      taxi: 0.25,      // 25% per year
      rental: 0.22     // 22% per year
    };
    
    const rate = depreciationRates[usageType] || 0.15;
    return purchaseValue * Math.pow(1 - rate, years);
  }
}

module.exports = Vehicle;
