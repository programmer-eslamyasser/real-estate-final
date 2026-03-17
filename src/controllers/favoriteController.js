const Favorite = require('../models/Favorite');
const Property = require('../models/Property');

// @desc   Add to favorites
// @route  POST /api/v1/favorites
// @access Private
exports.addFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ status: 'fail', message: 'Property not found' });
    }

    const favorite = await Favorite.create({ user_id: req.user._id, property_id: propertyId });
    await favorite.populate('property_id');

    res.status(201).json({ status: 'success', message: 'Property added to favorites', data: favorite });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ status: 'fail', message: 'Property already in favorites' });
    }
    next(err);
  }
};

// @desc   Get my favorites
// @route  GET /api/v1/favorites
// @access Private
exports.getFavorites = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Favorite.countDocuments({ user_id: req.user._id });
    const favorites = await Favorite.find({ user_id: req.user._id })
      .populate('property_id')
      .limit(limit)
      .skip(skip)
      .sort({ created_at: -1 });

    res.status(200).json({
      status: 'success',
      count: favorites.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: favorites,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Remove from favorites
// @route  DELETE /api/v1/favorites/:propertyId
// @access Private
exports.removeFavorite = async (req, res, next) => {
  try {
    const deleted = await Favorite.findOneAndDelete({
      user_id: req.user._id,
      property_id: req.params.propertyId,
    });

    if (!deleted) {
      return res.status(404).json({ status: 'fail', message: 'Favorite not found' });
    }

    res.status(200).json({ status: 'success', message: 'Property removed from favorites' });
  } catch (err) {
    next(err);
  }
};
