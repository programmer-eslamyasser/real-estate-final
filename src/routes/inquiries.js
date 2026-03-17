const express = require('express');
const router = express.Router();

// 1. استدعاء الـ Controller من مكانه الجديد (المجلد الرئيسي) وباسم CamelCase [cite: 50, 51]
const inquiryController = require('../controllers/inquiryController'); 

// 2. استدعاء الميدل ويرز بالأسماء الجديدة الموحدة (CamelCase)
const { protect } = require('../middlewares/authMiddleware'); 
const validate = require('../middlewares/validationMiddleware'); 
const paginate = require('../middlewares/paginate'); // [جديد - مهمة خلف] 

// 3. استدعاء الـ Validators بالأسماء الجديدة (شغل مينا) [cite: 46, 47]
const inquiryValidators = require('../validators/validators'); 

// جميع مسارات الاستفسارات محمية وتحتاج تسجيل دخول
router.use(protect);

// ─── Inquiry Endpoints ───────────────────────

// إرسال استفسار جديد
router.post('/', validate(inquiryValidators.sendInquirySchema), inquiryController.sendInquiry);

// جلب الرسائل الواردة مع إضافة التقسيم (Pagination) [cite: 31]
router.get('/inbox', paginate, inquiryController.getMyInbox); 

// جلب الرسائل المرسلة مع إضافة التقسيم [cite: 31]
router.get('/sent', paginate, inquiryController.getMySentInquiries); 

// جلب الاستفسارات الخاصة بعقار معين (للمالك)
router.get('/property/:propertyId', paginate, inquiryController.getInquiriesByProperty);

// تحديث حالة الرسالة كمقروءة
router.patch('/:id/read', inquiryController.markAsRead);

// حذف استفسار
router.delete('/:id', inquiryController.deleteInquiry);

module.exports = router;