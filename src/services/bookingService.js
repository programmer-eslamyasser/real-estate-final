const Booking = require('../models/Booking');

const approveBookingService = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error('Booking not found');
  if (booking.rejected) throw new Error('Rejected booking cannot be approved');

  booking.pending = false;
  booking.applied = true;
  await booking.save();
  return booking;
};

const rejectBookingService = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error('Booking not found');

  booking.pending = false;
  booking.rejected = true;
  await booking.save();
  return booking;
};

const getOwnerBookingsService = async (ownerId) => {
  const bookings = await Booking.find()
    .populate({ path: 'property_id', match: { owner: ownerId } })
    .populate('user_id', 'name email phone');

  return bookings.filter((b) => b.property_id !== null);
};

module.exports = { approveBookingService, rejectBookingService, getOwnerBookingsService };
