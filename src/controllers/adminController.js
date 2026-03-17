const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Favorite = require('../models/Favorite');
const Inquiry = require('../models/Inquiry');

// ─── ADMIN DASHBOARD ────────────────────────────────────────────

// @desc   Admin overview stats
// @route  GET /api/v1/dashboard/admin/stats
exports.adminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalProperties, totalBookings, totalRevenue] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Booking.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalProperties,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Recent users
// @route  GET /api/v1/dashboard/admin/users
exports.recentUsers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const users = await User.find().sort('-createdAt').limit(limit).select('name email role createdAt');
    res.status(200).json({ status: 'success', results: users.length, data: { users } });
  } catch (err) {
    next(err);
  }
};

// @desc   Recent bookings (admin)
// @route  GET /api/v1/dashboard/admin/bookings
exports.recentBookings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const bookings = await Booking.find()
      .sort('-createdAt')
      .limit(limit)
      .populate('user_id', 'name email')
      .populate('property_id', 'title price');

    res.status(200).json({ status: 'success', results: bookings.length, data: { bookings } });
  } catch (err) {
    next(err);
  }
};

// @desc   Recent payments (admin)
// @route  GET /api/v1/dashboard/admin/payments
exports.recentPayments = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const payments = await Payment.find()
      .sort('-createdAt')
      .limit(limit)
      .populate('user_id', 'name email')
      .populate('booking_id', 'start_date end_date amount');

    res.status(200).json({ status: 'success', results: payments.length, data: { payments } });
  } catch (err) {
    next(err);
  }
};

// ─── OWNER DASHBOARD ────────────────────────────────────────────

// @desc   Owner overview stats
// @route  GET /api/v1/dashboard/owner/stats
exports.ownerStats = async (req, res, next) => {
  try {
    const myProperties = await Property.find({ owner: req.user._id }).select('_id');
    const propertyIds = myProperties.map((p) => p._id);

    const [totalProperties, totalBookings, pendingBookings, revenue] = await Promise.all([
      Property.countDocuments({ owner: req.user._id }),
      Booking.countDocuments({ property_id: { $in: propertyIds } }),
      Booking.countDocuments({ property_id: { $in: propertyIds }, pending: true }),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        {
          $lookup: {
            from: 'bookings',
            localField: 'booking_id',
            foreignField: '_id',
            as: 'booking',
          },
        },
        { $unwind: '$booking' },
        { $match: { 'booking.property_id': { $in: propertyIds } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.status(200).json({
      status: 'success',
      data: { totalProperties, totalBookings, pendingBookings, revenue: revenue[0]?.total || 0 },
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Owner's properties
// @route  GET /api/v1/dashboard/owner/properties
exports.ownerProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort('-createdAt');
    res.status(200).json({ status: 'success', results: properties.length, data: { properties } });
  } catch (err) {
    next(err);
  }
};

// @desc   Owner's bookings (on their properties)
// @route  GET /api/v1/dashboard/owner/bookings
exports.ownerBookings = async (req, res, next) => {
  try {
    const myProperties = await Property.find({ owner: req.user._id }).select('_id');
    const propertyIds = myProperties.map((p) => p._id);

    const bookings = await Booking.find({ property_id: { $in: propertyIds } })
      .populate('user_id', 'name email phone')
      .populate('property_id', 'title price location')
      .sort('-createdAt');

    res.status(200).json({ status: 'success', results: bookings.length, data: { bookings } });
  } catch (err) {
    next(err);
  }
};

// ─── BUYER DASHBOARD ────────────────────────────────────────────

// @desc   Buyer bookings
// @route  GET /api/v1/dashboard/buyer/bookings
exports.buyerBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user_id: req.user._id })
      .populate('property_id', 'title price location images')
      .sort('-createdAt');

    res.status(200).json({ status: 'success', results: bookings.length, data: { bookings } });
  } catch (err) {
    next(err);
  }
};

// @desc   Buyer payments
// @route  GET /api/v1/dashboard/buyer/payments
exports.buyerPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user_id: req.user._id })
      .populate('booking_id', 'start_date end_date property_id')
      .sort('-createdAt');

    res.status(200).json({ status: 'success', results: payments.length, data: { payments } });
  } catch (err) {
    next(err);
  }
};

// @desc   Buyer favorites
// @route  GET /api/v1/dashboard/buyer/favorites
exports.buyerFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user_id: req.user._id })
      .populate('property_id', 'title price location images avgRating')
      .sort('-created_at');

    res.status(200).json({ status: 'success', results: favorites.length, data: { favorites } });
  } catch (err) {
    next(err);
  }
};

// @desc   Activity feed (mixed recent activities)
// @route  GET /api/v1/dashboard/activity
exports.activityFeed = async (req, res, next) => {
  try {
    const limit = 5;
    const userId = req.user._id;

    const [recentBookings, recentPayments, recentInquiries] = await Promise.all([
      Booking.find({ user_id: userId })
        .sort('-createdAt')
        .limit(limit)
        .populate('property_id', 'title'),
      Payment.find({ user_id: userId }).sort('-createdAt').limit(limit),
      Inquiry.find({ $or: [{ sender: userId }, { receiver: userId }] })
        .sort('-createdAt')
        .limit(limit)
        .populate('property', 'title'),
    ]);

    res.status(200).json({
      status: 'success',
      data: { recentBookings, recentPayments, recentInquiries },
    });
  } catch (err) {
    next(err);
  }
};
