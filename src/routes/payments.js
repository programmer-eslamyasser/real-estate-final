const express = require('express');
const router = express.Router();

// 1. استدعاء الـ Controller من مكانه الجديد (المجلد الرئيسي) وباسم CamelCase
const paymentController = require('../controllers/paymentController'); // [cite: 51]

// 2. استدعاء الميدل ويرز بالأسماء الجديدة الموحدة (CamelCase)
const { protect } = require('../middlewares/authMiddleware'); 
const restrictTo = require('../middlewares/restrictToMiddleware'); 
const validate = require('../middlewares/validationMiddleware'); 
const paginate = require('../middlewares/paginate'); // [جديد - مهمة خلف] [cite: 30, 31]

// 3. استدعاء الـ Validators بالأسماء الجديدة
const paymentValidators = require('../validators/validators'); // [cite: 46, 47]

// جميع مسارات المدفوعات محمية وتحتاج تسجيل دخول
router.use(protect);

// ─── Payment Endpoints ───────────────────────

// إنشاء عملية دفع جديدة
router.post('/', validate(paymentValidators.createPaymentSchema), paymentController.createPayment);

// جلب مدفوعات المستخدم الحالي مع إضافة التقسيم (Pagination)
router.get('/', paginate, paymentController.getUserPayments); // [cite: 31]

// جلب كل المدفوعات (خاص بالأدمن فقط) مع إضافة التقسيم
router.get('/all', restrictTo('admin'), paginate, paymentController.getAllPayments); // [cite: 31, 35]

// تحديث حالة الدفع (للأدمن أو النظام)
router.put('/:id/status', validate(paymentValidators.updatePaymentStatusSchema), paymentController.updatePaymentStatus);

// حذف سجل دفع
router.delete('/:id', paymentController.deletePayment);

module.exports = router;