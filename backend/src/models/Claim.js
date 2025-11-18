const Joi = require('joi');

const claimSchema = Joi.object({
  claimId: Joi.string().required(),
  claimNumber: Joi.string().required(),
  policyId: Joi.string().required(),
  customerId: Joi.string().required(),
  vehicleId: Joi.string().required(),
  incidentDate: Joi.date().required(),
  reportDate: Joi.date().default(Date.now),
  incidentType: Joi.string().valid(
    'accident',
    'theft',
    'fire',
    'natural-disaster',
    'vandalism',
    'other'
  ).required(),
  description: Joi.string().min(10).required(),
  descriptionArabic: Joi.string(),
  location: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().default('Doha'),
    coordinates: Joi.object({
      latitude: Joi.number(),
      longitude: Joi.number()
    })
  }).required(),
  policeReportNumber: Joi.string(),
  policeReportDate: Joi.date(),
  estimatedDamage: Joi.number().positive().required(), // in QAR
  approvedAmount: Joi.number().positive(),
  deductibleAmount: Joi.number().min(0).default(0),
  status: Joi.string().valid(
    'submitted',
    'under-review',
    'approved',
    'rejected',
    'settled',
    'closed'
  ).default('submitted'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  assignedTo: Joi.string(),
  witnesses: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().required(),
      statement: Joi.string()
    })
  ).default([]),
  attachments: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('photo', 'document', 'video').required(),
      name: Joi.string().required(),
      url: Joi.string().uri(),
      uploadDate: Joi.date().default(Date.now)
    })
  ).default([]),
  notes: Joi.array().items(
    Joi.object({
      author: Joi.string().required(),
      content: Joi.string().required(),
      date: Joi.date().default(Date.now)
    })
  ).default([]),
  settlementDate: Joi.date(),
  createdAt: Joi.date().default(Date.now),
  updatedAt: Joi.date().default(Date.now)
});

class Claim {
  static validate(data) {
    return claimSchema.validate(data);
  }

  static create(data) {
    const { error, value } = this.validate(data);
    if (error) {
      throw new Error(error.details[0].message);
    }
    return value;
  }

  static generateClaimNumber() {
    const prefix = 'CLM';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `${prefix}-${year}-${random}`;
  }

  static calculateSettlement(estimatedDamage, deductible, coverageLimit) {
    const settlementAmount = Math.min(
      estimatedDamage - deductible,
      coverageLimit
    );
    return Math.max(0, settlementAmount);
  }
}

module.exports = Claim;
