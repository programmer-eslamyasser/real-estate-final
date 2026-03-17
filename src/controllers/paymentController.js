const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { v4: uuidv4 } = require('uuid');

// @desc   Create payment for a booking
// @route  POST /api/v1/payments
// @access Private
exports.createPayment = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { bookingId, amount, method } = req.body;

    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ status: 'fail', message: 'Booking not found' });
    }

    if (booking.user_id.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ status: 'fail', message: 'Not authorized to pay for this booking' });
    }

    const existingPayment = await Payment.findOne({ booking_id: bookingId, status: 'completed' }).session(session);
    if (existingPayment) {
      await session.abortTransaction();
      return res.status(409).json({ status: 'fail', message: 'This booking has already been paid' });
    }

    const payment = await Payment.create(
      [
        {
          user_id: req.user._id,
          booking_id: bookingId,
          amount: amount || booking.amount,
          method: method || 'cash',
          transactionId: uuidv4(),
          status: 'pending',
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ status: 'success', message: 'Payment created successfully', data: { payment: payment[0] } });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// @desc   Update payment status
// @route  PUT /api/v1/payments/:id/status
// @access Private
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ status: 'fail', message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ status: 'fail', message: 'Payment not found' });
    }

    // Only admin or the user who made the payment can update it
    if (payment.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'Not authorized' });
    }

    payment.status = status;
    await payment.save();

    res.status(200).json({ status: 'success', message: 'Payment status updated', data: { payment } });
  } catch (err) {
    next(err);
  }
};

// @desc   Delete payment
// @route  DELETE /api/v1/payments/:id
// @access Private/Admin
exports.deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ status: 'fail', message: 'Payment not found' });
    }

    if (payment.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'Not authorized' });
    }

    await payment.deleteOne();
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};

// @desc   Get current user's payments
// @route  GET /api/v1/payments
// @access Private
exports.getUserPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Payment.countDocuments({ user_id: req.user._id });
    const payments = await Payment.find({ user_id: req.user._id })
      .populate('booking_id', 'start_date end_date amount')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      results: payments.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: { payments },
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get all payments (Admin only)
// @route  GET /api/v1/payments/all
// @access Private/Admin
exports.getAllPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Payment.countDocuments();
    const payments = await Payment.find()
      .populate('user_id', 'name email')
      .populate('booking_id', 'start_date end_date amount property_id')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      results: payments.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: { payments },
    });
  } catch (err) {
    next(err);
  }
};
