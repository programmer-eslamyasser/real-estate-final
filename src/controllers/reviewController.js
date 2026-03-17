const Review = require('../models/Review');
const Property = require('../models/Property');

// @desc   Create review
// @route  POST /api/v1/reviews
// @access Private
exports.createReview = async (req, res, next) => {
  try {
    const { propertyId, rating, comment } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ status: 'fail', message: 'Property not found' });
    }

    // Cannot review own property
    if (property.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ status: 'fail', message: 'لا يمكنك تقييم عقارك الخاص' });
    }

    const review = await Review.create({
      propertyId,
      userId: req.user._id,
      rating,
      comment,
    });

    await review.populate('userId', 'name photo');

    res.status(201).json({ status: 'success', data: { review } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ status: 'fail', message: 'لقد قمت بتقييم هذا العقار مسبقاً' });
    }
    next(err);
  }
};

// @desc   Get reviews for a property
// @route  GET /api/v1/reviews/property/:propertyId
// @access Public
exports.getPropertyReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Review.countDocuments({ propertyId: req.params.propertyId });
    const reviews = await Review.find({ propertyId: req.params.propertyId })
      .populate('userId', 'name photo')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: { reviews },
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Update review
// @route  PATCH /api/v1/reviews/:id
// @access Private (Review owner only)
exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ status: 'fail', message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized' });
    }

    const { rating, comment } = req.body;
    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;
    await review.save();

    res.status(200).json({ status: 'success', data: { review } });
  } catch (err) {
    next(err);
  }
};

// @desc   Delete review
// @route  DELETE /api/v1/reviews/:id
// @access Private (Review owner or Admin)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ status: 'fail', message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'Not authorized' });
    }

    await review.deleteOne();
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};
