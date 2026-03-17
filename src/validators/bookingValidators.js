const Joi = require('joi');

const createBookingSchema = Joi.object({
  property_id: Joi.string().required(),
  date: Joi.date().required(),
  message: Joi.string().optional()
});

const updateBookingStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected', 'cancelled').required()
});

module.exports = {
  createBookingSchema,
  updateBookingStatusSchema
};