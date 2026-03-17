const Joi = require('joi');

// 1. فحص بيانات التسجيل
const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.empty': 'الاسم مطلوب',
    'string.min': 'الاسم يجب أن يكون 3 حروف على الأقل'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'يرجى إدخال بريد إلكتروني صحيح',
    'any.required': 'البريد الإلكتروني مطلوب'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'كلمة المرور يجب أن لا تقل عن 6 رموز'
  }),
  phone: Joi.string().optional(),
  role: Joi.string().valid('user', 'owner', 'agent', 'admin').default('user')
});

// 2. فحص بيانات تسجيل الدخول
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'البريد الإلكتروني غير صحيح',
    'any.required': 'البريد الإلكتروني مطلوب'
  }),
  password: Joi.string().required().messages({
    'any.required': 'كلمة المرور مطلوبة'
  })
});

// 3. فحص بيانات تغيير كلمة المرور (اللي كانت مسببة الخطأ)
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'يجب إدخال كلمة المرور الحالية'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'كلمة المرور الجديدة يجب أن تكون 6 رموز على الأقل'
  })
});

// 4. تصدير الـ Schemas كـ Object واحد
module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema
};