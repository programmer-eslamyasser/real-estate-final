const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ status: 'success', data: { user } });
});

const getAllUsers = asyncHandler(async (req, res, next) => {
  const { limit, skip, page } = req.pagination;
  const total = await User.countDocuments();
  const users = await User.find().skip(skip).limit(limit).sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: users.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: { users }
  });
});

const updateMe = asyncHandler(async (req, res, next) => {
  const { password, role, ...updateData } = req.body;
  if (req.file) updateData.photo = req.file.filename;

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ status: 'success', data: { user } });
});

const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ status: 'fail', message: 'الباسورد الحالي غير صحيح' });
  }

  user.password = newPassword;
  await user.save();
  res.status(200).json({ status: 'success', message: 'Password changed successfully' });
});

const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });
  res.status(200).json({ status: 'success', data: { user } });
});

const deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).json({ status: 'success', data: null });
});

// ✅ التصدير الموحد اللي هيحل الـ TypeError
module.exports = {
  getMe,
  getAllUsers,
  updateMe,
  changePassword,
  getUser,
  deleteUser
};