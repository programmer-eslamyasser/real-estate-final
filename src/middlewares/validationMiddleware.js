/**
 * Validation Middleware
 * @param {Object} schema - Joi validation schema
 * @param {String} source - The source of data in req (body, query, params)
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    // تنفيذ التحقق
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,   // لجلب كل الأخطاء مش أول واحد بس
      stripUnknown: true,  // لحذف أي حقول زيادة مش موجودة في الـ Schema
    });

    if (error) {
      // تنسيق الأخطاء بشكل أنظف
      const errorMessages = error.details.map((e) => e.message.replace(/"/g, ''));

      return res.status(400).json({
        status: 'fail',
        message: 'خطأ في البيانات المدخلة - Validation Error',
        errors: errorMessages,
      });
    }

    // استبدال البيانات الأصلية بالبيانات المنظفة (المهمة جداً لـ stripUnknown)
    req[source] = value;
    
    next();
  };
};

module.exports = validate;