const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const paginate = require('../middlewares/paginate');
const bookingValidators = require('../validators/bookingValidators');

// جميع مسارات الحجز محمية وتحتاج تسجيل دخول
router.use(protect);

// ─── Booking Endpoints ───────────────────────

// إنشاء حجز جديد - [تعديل: وضع الـ validator في مكانه الصحيح]
router.post('/', validate(bookingValidators.createBookingSchema), bookingController.createBooking);

// جلب حجوزات المستخدم (المشتري)
router.get('/', paginate, bookingController.getUserBookings);

// جلب الحجوزات الخاصة بمالك العقار
router.get('/owner', paginate, bookingController.getOwnerBookings);

// جلب تفاصيل حجز معين
router.get('/:id', bookingController.getBooking);

// عمليات التحكم في الحجز
router.patch('/:id/cancel', bookingController.cancelBooking);
router.patch('/:id/approve', bookingController.approveBooking);
router.patch('/:id/reject', bookingController.rejectBooking);

module.exports = router;