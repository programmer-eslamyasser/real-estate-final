const express = require('express');
const router = express.Router();

// استدعاء الـ Controller بالاسم الجديد ونقلناه للمجلد الرئيسي
const adminController = require('../controllers/adminController'); // 

// استدعاء الميدل ويرز بالأسماء الجديدة (CamelCase)
const { protect } = require('../middlewares/authMiddleware'); // 
const restrictTo = require('../middlewares/restrictToMiddleware'); // 
const paginate = require('../middlewares/paginate'); // [جديد - مهمة خلف] [cite: 31]

// كل المسارات هنا محمية وتحتاج تسجيل دخول
router.use(protect);

// ─── Admin Endpoints ─────────────────────────
// ملحوظة: خلف هيضيف هنا مسارات الموافقة على العقارات والمزادات [cite: 33]
router.get('/stats', restrictTo('admin'), adminController.adminStats);
router.get('/users', restrictTo('admin'), paginate, adminController.recentUsers); // إضافة التقسيم [cite: 35]
router.get('/bookings', restrictTo('admin'), paginate, adminController.recentBookings);
router.get('/payments', restrictTo('admin'), paginate, adminController.recentPayments);

// ─── Owner / Agent Endpoints ─────────────────
router.get('/owner/stats', restrictTo('owner', 'agent', 'admin'), adminController.ownerStats);
router.get('/owner/properties', restrictTo('owner', 'agent', 'admin'), paginate, adminController.ownerProperties);
router.get('/owner/bookings', restrictTo('owner', 'agent', 'admin'), paginate, adminController.ownerBookings);

// ─── Buyer Endpoints ─────────────────────────
router.get('/buyer/bookings', paginate, adminController.buyerBookings);
router.get('/buyer/payments', paginate, adminController.buyerPayments);
router.get('/buyer/favorites', paginate, adminController.buyerFavorites);

// ─── Shared Endpoints ────────────────────────
router.get('/activity', adminController.activityFeed);

module.exports = router;