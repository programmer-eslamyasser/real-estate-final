const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const {
  approveBookingService,
  rejectBookingService,
  getOwnerBookingsService,
} = require('../services/bookingService');

// إنشاء حجز جديد
const createBooking = asyncHandler(async (req, res, next) => {
  const { propertyId, amount, start_date, end_date } = req.body;

  const parsedStart = new Date(start_date);
  const parsedEnd = new Date(end_date);

  if (parsedStart >= parsedEnd) {
    return next(new AppError('تاريخ البداية يجب أن يكون قبل تاريخ النهاية', 400));
  }

  // فحص الحجوزات المتداخلة
  const existingBooking = await Booking.findOne({
    property_id: propertyId,
    rejected: false,
    start_date: { $lt: parsedEnd },
    end_date: { $gt: parsedStart },
  });

  if (existingBooking) {
    return next(new AppError('هذا العقار محجوز بالفعل في هذه الفترة', 409));
  }

  const booking = await Booking.create({
    user_id: req.user._id,
    property_id: propertyId,
    amount,
    start_date: parsedStart,
    end_date: parsedEnd,
  });

  res.status(201).json({ status: 'success', data: { booking } });
});

// جلب حجوزات المستخدم
const getUserBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find({ user_id: req.user._id })
    .populate('property_id', 'title price location images')
    .sort({ start_date: 1 });

  res.status(200).json({ status: 'success', count: bookings.length, data: { bookings } });
});

// إلغاء حجز
const cancelBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findOne({ _id: req.params.id, user_id: req.user._id });

  if (!booking) return next(new AppError('الحجز غير موجود', 404));
  if (booking.applied) return next(new AppError('لا يمكن إلغاء حجز تم تطبيقه بالفعل', 400));

  booking.pending = false;
  booking.rejected = true;
  await booking.save();

  res.status(200).json({ status: 'success', message: 'تم إلغاء الحجز بنجاح', data: { booking } });
});

// جلب حجوزات المالك
const getOwnerBookings = asyncHandler(async (req, res, next) => {
  const bookings = await getOwnerBookingsService(req.user._id);
  res.status(200).json({ status: 'success', count: bookings.length, data: { bookings } });
});

// الموافقة على حجز
const approveBooking = asyncHandler(async (req, res, next) => {
  const booking = await approveBookingService(req.params.id);
  res.status(200).json({ status: 'success', data: { booking } });
});

// رفض حجز
const rejectBooking = asyncHandler(async (req, res, next) => {
  const booking = await rejectBookingService(req.params.id);
  res.status(200).json({ status: 'success', data: { booking } });
});

// جلب حجز واحد
const getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('property_id', 'title price location images owner')
    .populate('user_id', 'name email phone');

  if (!booking) return next(new AppError('الحجز غير موجود', 404));

  const isUser = booking.user_id._id.toString() === req.user._id.toString();
  const isOwner = booking.property_id?.owner?.toString() === req.user._id.toString();
  
  if (!isUser && !isOwner && req.user.role !== 'admin') {
    return next(new AppError('غير مسموح لك بعرض هذا الحجز', 403));
  }

  res.status(200).json({ status: 'success', data: { booking } });
});

// ✅ التصدير الموحد والنهائي
module.exports = {
  createBooking,
  getUserBookings,
  cancelBooking,
  getOwnerBookings,
  approveBooking,
  rejectBooking,
  getBooking
};