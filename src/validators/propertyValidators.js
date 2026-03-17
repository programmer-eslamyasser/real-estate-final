const Joi = require('joi');

// 1. فحص بيانات إنشاء عقار جديد
const createPropertySchema = Joi.object({
  title: Joi.string().min(3).max(150).required().messages({
    'string.empty': 'عنوان العقار مطلوب',
    'string.min': 'العنوان يجب أن يكون 3 حروف على الأقل'
  }),
  description: Joi.string().max(2000).optional(),
  price: Joi.number().min(0).required().messages({
    'number.base': 'السعر يجب أن يكون رقماً',
    'any.required': 'السعر مطلوب'
  }),
  type: Joi.string()
    .valid('apartment', 'villa', 'house', 'office', 'land', 'commercial')
    .required()
    .messages({
      'any.only': 'نوع العقار غير مدعوم'
    }),
  listingType: Joi.string().valid('sale', 'rent').required().messages({
    'any.only': 'يجب اختيار (للبيع) أو (للإيجار)'
  }),
  location: Joi.object({
    city: Joi.string().required().messages({ 'string.empty': 'المدينة مطلوبة' }),
    district: Joi.string().optional(),
    address: Joi.string().optional(),
    coordinates: Joi.object({
      lat: Joi.number().optional(),
      lng: Joi.number().optional(),
    }).optional(),
  }).required(),
  area: Joi.number().min(0).optional(),
  bedrooms: Joi.number().integer().min(0).optional(),
  bathrooms: Joi.number().integer().min(0).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  isAvailable: Joi.boolean().optional().default(true),
});

// 2. فحص بيانات تحديث عقار (كل الحقول Optional)
const updatePropertySchema = Joi.object({
  title: Joi.string().min(3).max(150).optional(),
  description: Joi.string().max(2000).optional(),
  price: Joi.number().min(0).optional(),
  type: Joi.string()
    .valid('apartment', 'villa', 'house', 'office', 'land', 'commercial')
    .optional(),
  listingType: Joi.string().valid('sale', 'rent').optional(),
  location: Joi.object({
    city: Joi.string().optional(),
    district: Joi.string().optional(),
    address: Joi.string().optional(),
    coordinates: Joi.object({
      lat: Joi.number().optional(),
      lng: Joi.number().optional(),
    }).optional(),
  }).optional(),
  area: Joi.number().min(0).optional(),
  bedrooms: Joi.number().integer().min(0).optional(),
  bathrooms: Joi.number().integer().min(0).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  isAvailable: Joi.boolean().optional(),
});

//  التصدير الموحد ليتوافق مع الـ require في الـ Routes
module.exports = {
  createPropertySchema,
  updatePropertySchema
};