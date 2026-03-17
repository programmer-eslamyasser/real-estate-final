const express = require('express');
const router = express.Router();

// 1. استدعاء الـ Controller من مكانه الجديد (المجلد الرئيسي) وباسم CamelCase
const favoriteController = require('../controllers/favoriteController'); // 

// 2. استدعاء الميدل ويرز بالأسماء الجديدة الموحدة (CamelCase)
const { protect } = require('../middlewares/authMiddleware'); // 
const validate = require('../middlewares/validationMiddleware'); // 
const paginate = require('../middlewares/paginate'); // [جديد - مهمة خلف] [cite: 30, 73]

// 3. استدعاء الـ Validators بالأسماء الجديدة (شغل مينا)
const favoriteValidators = require('../validators/validators'); // [cite: 47]

// جميع مسارات المفضلة محمية وتحتاج تسجيل دخول
router.use(protect);

// ─── Favorite Endpoints ───────────────────────

// إضافة عقار للمفضلة
router.post('/', validate(favoriteValidators.addFavoriteSchema), favoriteController.addFavorite);

// جلب قائمة المفضلات مع إضافة التقسيم (Pagination)
router.get('/', paginate, favoriteController.getFavorites); // [cite: 31]

// حذف عقار من المفضلة
router.delete('/:propertyId', favoriteController.removeFavorite);

module.exports = router;