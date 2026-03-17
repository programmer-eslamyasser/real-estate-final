const User = require('../models/User'); // التأكد من المسار الجديد (PascalCase)
const { signToken } = require('../utils/jwt');
const AppError = require('../utils/AppError'); // يفضل استخدامه بدل الـ res.status اليدوي

// ─── دالة التسجيل ────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'الإيميل مستخدم بالفعل - Email already exists',
      });
    }

    const user = await User.create({ name, email, password, phone, role });
    const token = signToken(user._id);
    
    // إخفاء الباسورد من النتيجة
    user.password = undefined;

    return res.status(201).json({
      status: 'success',
      token,
      data: { user },
    });
  } catch (err) {
    return next(err);
  }
};

// ─── دالة تسجيل الدخول ───────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'ادخل الإيميل والباسورد' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ status: 'fail', message: 'الإيميل أو الباسورد غير صحيح' });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      status: 'success',
      token,
      data: { 
        user: { 
          _id: user._id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        } 
      },
    });
  } catch (err) {
    return next(err);
  }
};

// ─── دالة الحصول على بياناتي ──────────────────
const getMe = async (req, res, next) => {
  try {
    // التأكد من أن الـ User متاح من ميدل وير الـ protect
    const user = await User.findById(req.user._id);
    return res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    return next(err);
  }
};

//  التعديل الأهم: تصدير الدوال كـ Object ليتوافق مع الـ require في الـ routes
module.exports = {
  register,
  login,
  getMe
};