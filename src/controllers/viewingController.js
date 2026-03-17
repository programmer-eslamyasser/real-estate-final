const ViewingRequest = require('../models/ViewingRequest');
const Property = require('../models/Property');

// @desc   Create viewing request
// @route  POST /api/v1/viewing-requests
// @access Private
exports.createViewingRequest = async (req, res, next) => {
  try {
    const { propertyId, preferredDate, preferredTime, message } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ status: 'fail', message: 'Property not found' });
    }

    if (property.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ status: 'fail', message: 'لا يمكنك طلب معاينة عقارك الخاص' });
    }

    const viewingRequest = await ViewingRequest.create({
      property: propertyId,
      requester: req.user._id,
      owner: property.owner,
      preferredDate,
      preferredTime,
      message,
    });

    await viewingRequest.populate([
      { path: 'property', select: 'title location images' },
      { path: 'owner', select: 'name email phone' },
    ]);

    res.status(201).json({ status: 'success', message: 'Viewing request sent', data: { viewingRequest } });
  } catch (err) {
    next(err);
  }
};

// @desc   Get my viewing requests (as requester)
// @route  GET /api/v1/viewing-requests/my
// @access Private
exports.getMyViewingRequests = async (req, res, next) => {
  try {
    const requests = await ViewingRequest.find({ requester: req.user._id })
      .populate('property', 'title location images price')
      .populate('owner', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({ status: 'success', results: requests.length, data: { requests } });
  } catch (err) {
    next(err);
  }
};

// @desc   Get viewing requests for owner's properties
// @route  GET /api/v1/viewing-requests/owner
// @access Private
exports.getOwnerViewingRequests = async (req, res, next) => {
  try {
    const requests = await ViewingRequest.find({ owner: req.user._id })
      .populate('property', 'title location images price')
      .populate('requester', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({ status: 'success', results: requests.length, data: { requests } });
  } catch (err) {
    next(err);
  }
};

// @desc   Update viewing request status (owner approves/rejects)
// @route  PATCH /api/v1/viewing-requests/:id/status
// @access Private (Owner)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Status must be approved or rejected' });
    }

    const viewingRequest = await ViewingRequest.findById(req.params.id);
    if (!viewingRequest) {
      return res.status(404).json({ status: 'fail', message: 'Viewing request not found' });
    }

    if (viewingRequest.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized' });
    }

    viewingRequest.status = status;
    await viewingRequest.save();

    res.status(200).json({ status: 'success', message: `Request ${status}`, data: { viewingRequest } });
  } catch (err) {
    next(err);
  }
};

// @desc   Cancel viewing request (requester)
// @route  PATCH /api/v1/viewing-requests/:id/cancel
// @access Private
exports.cancelViewingRequest = async (req, res, next) => {
  try {
    const viewingRequest = await ViewingRequest.findById(req.params.id);
    if (!viewingRequest) {
      return res.status(404).json({ status: 'fail', message: 'Viewing request not found' });
    }

    if (viewingRequest.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized' });
    }

    if (viewingRequest.status !== 'pending') {
      return res.status(400).json({ status: 'fail', message: 'Can only cancel pending requests' });
    }

    viewingRequest.status = 'cancelled';
    await viewingRequest.save();

    res.status(200).json({ status: 'success', message: 'Request cancelled', data: { viewingRequest } });
  } catch (err) {
    next(err);
  }
};
