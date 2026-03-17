const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');

// @desc   Send inquiry about a property
// @route  POST /api/v1/inquiries
// @access Private
exports.sendInquiry = async (req, res, next) => {
  try {
    const { propertyId, message } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ status: 'fail', message: 'Property not found' });
    }

    if (property.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ status: 'fail', message: 'لا يمكنك إرسال استفسار عن عقارك الخاص' });
    }

    const inquiry = await Inquiry.create({
      sender: req.user._id,
      receiver: property.owner,
      property: propertyId,
      message,
    });

    await inquiry.populate([
      { path: 'sender', select: 'name email photo' },
      { path: 'property', select: 'title price location' },
    ]);

    res.status(201).json({ status: 'success', message: 'Inquiry sent successfully', data: { inquiry } });
  } catch (err) {
    next(err);
  }
};

// @desc   Get inquiries for a property (owner only)
// @route  GET /api/v1/inquiries/property/:propertyId
// @access Private
exports.getInquiriesByProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) {
      return res.status(404).json({ status: 'fail', message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'Not authorized' });
    }

    const inquiries = await Inquiry.find({ property: req.params.propertyId })
      .populate('sender', 'name email photo')
      .sort('-createdAt');

    res.status(200).json({ status: 'success', results: inquiries.length, data: { inquiries } });
  } catch (err) {
    next(err);
  }
};

// @desc   Get my inbox (inquiries received as owner)
// @route  GET /api/v1/inquiries/inbox
// @access Private
exports.getMyInbox = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({ receiver: req.user._id })
      .populate('sender', 'name email photo')
      .populate('property', 'title price location images')
      .sort('-createdAt');

    res.status(200).json({ status: 'success', results: inquiries.length, data: { inquiries } });
  } catch (err) {
    next(err);
  }
};

// @desc   Get my sent inquiries
// @route  GET /api/v1/inquiries/sent
// @access Private
exports.getMySentInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({ sender: req.user._id })
      .populate('receiver', 'name email')
      .populate('property', 'title price location images')
      .sort('-createdAt');

    res.status(200).json({ status: 'success', results: inquiries.length, data: { inquiries } });
  } catch (err) {
    next(err);
  }
};

// @desc   Mark inquiry as read
// @route  PATCH /api/v1/inquiries/:id/read
// @access Private (Receiver only)
exports.markAsRead = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ status: 'fail', message: 'Inquiry not found' });
    }

    if (inquiry.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized' });
    }

    inquiry.isRead = true;
    await inquiry.save();

    res.status(200).json({ status: 'success', message: 'Marked as read', data: { inquiry } });
  } catch (err) {
    next(err);
  }
};

// @desc   Delete inquiry
// @route  DELETE /api/v1/inquiries/:id
// @access Private (Sender or Admin)
exports.deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ status: 'fail', message: 'Inquiry not found' });
    }

    if (inquiry.sender.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'Not authorized' });
    }

    await inquiry.deleteOne();
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};
