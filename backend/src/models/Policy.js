const Joi = require('joi');

const policySchema = Joi.object({
  policyId: Joi.string().required(),
  policyNumber: Joi.string().required(),
  customerId: Joi.string().required(),
  vehicleId: Joi.string().required(),
  coverageType: Joi.string().valid('comprehensive', 'third-party', 'third-party-plus').required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  premiumAmount: Joi.number().positive().required(), // in QAR
  coverageAmount: Joi.number().positive().required(), // in QAR
  deductible: Joi.number().min(0).default(0), // in QAR
  status: Joi.string().valid('active', 'expired', 'cancelled', 'pending').default('pending'),
  paymentStatus: Joi.string().valid('paid', 'pending', 'partial', 'overdue').default('pending'),
  paymentMethod: Joi.string().valid('cash', 'card', 'bank-transfer', 'installment'),
  additionalCoverage: Joi.array().items(
    Joi.object({
      type: Joi.string().required(),
      coverage: Joi.string().required(),
      premium: Joi.number().positive().required()
    })
  ).default([]),
  benefits: Joi.array().items(Joi.string()).default([
    'Emergency roadside assistance',
    'Replacement vehicle',
    'Natural disaster coverage',
    'Theft protection'
  ]),
  exclusions: Joi.array().items(Joi.string()).default([
    'Intentional damage',
    'Racing or competitions',
    'Driving under influence'
  ]),
  documents: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      url: Joi.string().uri(),
      uploadDate: Joi.date().default(Date.now)
    })
  ).default([]),
  createdAt: Joi.date().default(Date.now),
  updatedAt: Joi.date().default(Date.now)
});

class Policy {
  static validate(data) {
    return policySchema.validate(data);
  }

  static create(data) {
    const { error, value } = this.validate(data);
    if (error) {
      throw new Error(error.details[0].message);
    }
    return value;
  }

  static calculatePremium(vehicleValue, coverageType, driverAge, vehicleAge, hasAccidents = false) {
    // Base premium calculation for Qatar market
    let basePremium = 0;
    
    switch (coverageType) {
      case 'comprehensive':
        basePremium = vehicleValue * 0.03; // 3% of vehicle value
        break;
      case 'third-party-plus':
        basePremium = vehicleValue * 0.015; // 1.5% of vehicle value
        break;
      case 'third-party':
        basePremium = 500; // Fixed minimum QAR
        break;
    }

    // Age factor adjustments
    if (driverAge < 25) basePremium *= 1.3;
    else if (driverAge > 65) basePremium *= 1.2;

    // Vehicle age factor
    if (vehicleAge > 10) basePremium *= 1.15;
    else if (vehicleAge < 2) basePremium *= 0.95;

    // Accident history
    if (hasAccidents) basePremium *= 1.25;

    return Math.round(basePremium);
  }

  static generatePolicyNumber() {
    const prefix = 'QIIC';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${prefix}-${year}-${random}`;
  }
}

module.exports = Policy;
