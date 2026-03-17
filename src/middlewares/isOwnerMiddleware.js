const Property = require('../models/Property'); // تأكد إن الاسم Property.js مش property.model
const Booking = require('../models/Booking'); 
const asyncHandler = require('../utils/asyncHandler');

// دالة التأكد من الملكية
const isOwner = asyncHandler(async (req, res, next) => {
  const propertyId = req.params.id || req.params.propertyId;
  const property = await Property.findById(propertyId);

  if (!property) {
    return res.status(404).json({ status: 'fail', message: 'Property not found' });
  }

  if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ status: 'fail', message: 'Not authorized' });
  }

  req.property = property;
  next();
});

// تصدير كـ Object
module.exports = { isOwner };