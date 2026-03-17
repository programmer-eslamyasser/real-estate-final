const express = require('express');
const router = express.Router();

// 1. استدعاء الـ Controller من مكانه الجديد (المجلد الرئيسي) وباسم CamelCase
const viewingController = require('../controllers/viewingController'); // 

// 2. استدعاء الميدل ويرز بالأسماء الجديدة الموحدة (CamelCase)
const { protect } = require('../middlewares/authMiddleware'); // [cite: 71]
const validate = require('../middlewares/validationMiddleware'); // [cite: 71]
const paginate = require('../middlewares/paginate'); // [cite: 30, 73]

// 3. استدعاء الـ Validators بالأسماء الجديدة
const viewingValidators = require('../validators/validators'); // [cite: 46, 47]

// جميع مسارات طلبات المعاينة محمية وتحتاج تسجيل دخول
router.use(protect);

// ─── Viewing Request Endpoints ────────────────

// إنشاء طلب معاينة جديد
router.post('/', validate(viewingValidators.createViewingRequestSchema), viewingController.createViewingRequest);

// جلب طلبات المعاينة الخاصة بي (كمشتري) مع إضافة التقسيم (Pagination)
router.get('/my', paginate, viewingController.getMyViewingRequests); // [cite: 31]

// جلب طلبات المعاينة الخاصة بالعقارات التي أملكها (كمالك/وكيل)
router.get('/owner', paginate, viewingController.getOwnerViewingRequests); // [cite: 31]

// تحديث حالة الطلب (قبول/رفض)
router.patch('/:id/status', validate(viewingValidators.updateViewingStatusSchema), viewingController.updateStatus);

// إلغاء طلب المعاينة
router.patch('/:id/cancel', viewingController.cancelViewingRequest);

module.exports = router;