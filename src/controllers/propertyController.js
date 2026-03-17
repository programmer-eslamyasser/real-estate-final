const Property = require('../models/Property');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// 1. جلب كل العقارات
const getAllProperties = asyncHandler(async (req, res, next) => {
  const { limit, skip, page } = req.pagination;
  const properties = await Property.find().skip(skip).limit(limit).sort('-createdAt');
  const total = await Property.countDocuments();

  res.status(200).json({
    status: 'success',
    results: properties.length,
    total,
    page,
    data: { properties }
  });
});

// 2. جلب عقار واحد
const getProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);
  if (!property) return next(new AppError('العقار غير موجود', 404));
  res.status(200).json({ status: 'success', data: { property } });
});

// 3. جلب عقاراتي (للمالك)
const getMyProperties = asyncHandler(async (req, res, next) => {
  const properties = await Property.find({ owner: req.user._id });
  res.status(200).json({ status: 'success', data: { properties } });
});

// 4. إنشاء عقار
const createProperty = asyncHandler(async (req, res, next) => {
  req.body.owner = req.user._id;
  const property = await Property.create(req.body);
  res.status(201).json({ status: 'success', data: { property } });
});

// 5. تحديث عقار
const updateProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({ status: 'success', data: { property } });
});

// 6. حذف عقار
const deleteProperty = asyncHandler(async (req, res, next) => {
  await Property.findByIdAndDelete(req.params.id);
  res.status(204).json({ status: 'success', data: null });
});

// ✅ التصدير الموحد (تأكد من وجود كل الأسماء هنا)
module.exports = {
  getAllProperties,
  getProperty,
  getMyProperties,
  createProperty,
  updateProperty,
  deleteProperty
};