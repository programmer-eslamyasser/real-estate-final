const express = require('express');
const router = express.Router();

// 1. استدعاء الـ Controller من مكانه الجديد وباسم CamelCase
const reviewController = require('../controllers/reviewController'); // 

// 2. استدعاء الميدل ويرز بالأسماء الجديدة الموحدة (CamelCase)
const { protect } = require('../middlewares/authMiddleware'); 
const validate = require('../middlewares/validationMiddleware'); 
const paginate = require('../middlewares/paginate'); // [cite: 30, 31]

// 3. استدعاء الـ Validators بالأسماء الجديدة (شغل مينا)
const reviewValidators = require('../validators/validators'); // 

// ─── Review Endpoints ────────────────────────

// جلب تقييمات عقار معين مع إضافة التقسيم (Pagination)
router.get('/property/:propertyId', paginate, reviewController.getPropertyReviews); // [cite: 31]

// إضافة تقييم جديد (محمية وتحتاج تسجيل دخول وفحص بيانات)
router.post('/', 
  protect, 
  validate(reviewValidators.createReviewSchema), 
  reviewController.createReview
);

// تحديث تقييم موجود (لصاحب التقييم فقط)
router.patch('/:id', 
  protect, 
  validate(reviewValidators.updateReviewSchema), 
  reviewController.updateReview
);

// حذف تقييم (للمستخدم أو الأدمن)
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;