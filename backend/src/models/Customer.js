const Joi = require('joi');

const customerSchema = Joi.object({
  customerId: Joi.string().required(),
  qatarId: Joi.string().length(11).required(), // Qatar ID is 11 digits
  fullName: Joi.string().min(3).max(100).required(),
  fullNameArabic: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{8}$/).required(), // Qatar phone: 8 digits
  mobilePrefix: Joi.string().valid('+974').default('+974'),
  address: Joi.object({
    street: Joi.string().required(),
    zone: Joi.string().required(),
    building: Joi.string(),
    city: Joi.string().default('Doha')
  }).required(),
  dateOfBirth: Joi.date().required(),
  gender: Joi.string().valid('male', 'female').required(),
  nationality: Joi.string().required(),
  licenseNumber: Joi.string().required(),
  licenseIssueDate: Joi.date().required(),
  licenseExpiryDate: Joi.date().required(),
  createdAt: Joi.date().default(Date.now),
  updatedAt: Joi.date().default(Date.now)
});

class Customer {
  static validate(data) {
    return customerSchema.validate(data);
  }

  static create(data) {
    const { error, value } = this.validate(data);
    if (error) {
      throw new Error(error.details[0].message);
    }
    return value;
  }
}

module.exports = Customer;
