const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

// التأكد من وجود المجلدات بشكل ديناميكي
const createDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadDir = 'uploads/properties';
    
    // لو بنرفع صورة بروفايل للمستخدم، نغير المسار
    if (file.fieldname === 'photo') {
      uploadDir = 'uploads/users';
    }
    
    createDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // تسمية الملف: النوع-ID-الوقت.الامتداد
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    // استخدام AppError لتوحيد شكل الـ Errors في الفرونت إند
    cb(new AppError('يرجى رفع صور فقط (JPG, PNG, JPEG)', 400), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // حد أقصى 5 ميجا للصورة
});

module.exports = {
  // للصور الكتير في العقارات
  uploadPropertyImages: upload.array('images', 10),
  // لصورة البروفايل (تأكد إن الـ field اسمه 'photo' في الفرونت إند)
  uploadSingleImage: upload.single('photo'),
};