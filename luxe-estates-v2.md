REAL-ESTATE-FINAL/
├── node_modules/
├── src/
│   ├── config/
│   │   ├── db.js                # (كما هو) إعدادات قاعدة البيانات
│   │   ├── socket.js            # [جديد - أريني] إعدادات Socket.IO للمزادات [cite: 24]
│   │   └── multer.js            # [منقول - خلف] كان "middlewares/upload.middleware.js" [cite: 36, 37]
│   │
│   ├── controllers/             # (مهمتك: تجميع كل الملفات هنا وحذف المجلدات الفرعية) [cite: 50, 51]
│   │   ├── adminController.js   # كان "dashboard/dashboard.controller.js" [cite: 51]
│   │   ├── authController.js    # كان "auth/auth.controller.js" [cite: 51]
│   │   ├── auctionController.js # [جديد - يوسف] التحكم في عمليات المزاد [cite: 14]
│   │   ├── bidController.js     # [جديد - أريني] التحكم في نظام المزايدة [cite: 20]
│   │   ├── bookingController.js # كان "booking/booking.controller.js" [cite: 51]
│   │   ├── favoriteController.js# كان "property/favorite.controller.js" [cite: 51]
│   │   ├── inquiryController.js # كان "inquiry/inquiry.controller.js" [cite: 51]
│   │   ├── paymentController.js # كان "booking/payment.controller.js" [cite: 51]
│   │   ├── propertyController.js# كان "property/property.controller.js" [cite: 51]
│   │   ├── reviewController.js  # كان "property/review.controller.js" [cite: 51]
│   │   ├── userController.js    # كان "user.controller.js" (توحيد تسمية) [cite: 51]
│   │   └── viewingController.js # كان "viewingRequest/viewingRequest.controller.js" [cite: 51]
│   │
│   ├── middlewares/             # (مهمتك: توحيد التسمية لـ CamelCase)
│   │   ├── authMiddleware.js    # كان "auth.middleware.js"
│   │   ├── errorMiddleware.js   # كان "error.middleware.js"
│   │   ├── isOwnerMiddleware.js # كان "isOwner.middleware.js"
│   │   ├── restrictToMiddleware.js # كان "restrictTo.middleware.js"
│   │   ├── validationMiddleware.js # كان "validation.middleware.js"
│   │   └── paginate.js          # [جديد - خلف] ميدل وير للتقسيم (Pagination) [cite: 30]
│   │
│   ├── models/                  # (مهمتك: تحويل لـ PascalCase وحذف .model) [cite: 54, 55]
│   │   ├── Auction.js           # [جديد - يوسف] موديل بيانات المزادات [cite: 10]
│   │   ├── Bid.js               # [جديد - يوسف] موديل بيانات المزايدات [cite: 12]
│   │   ├── Booking.js           # كان "booking.model.js" [cite: 55]
│   │   ├── Favorite.js          # كان "favorite.model.js" [cite: 55]
│   │   ├── Inquiry.js           # كان "inquiry.model.js" [cite: 55]
│   │   ├── Payment.js           # كان "payment.model.js" [cite: 55]
│   │   ├── Property.js          # كان "property.model.js" [cite: 55]
│   │   ├── Review.js            # كان "review.model.js" [cite: 55]
│   │   ├── User.js              # كان "user.model.js" [cite: 55]
│   │   └── ViewingRequest.js    # كان "viewingRequest.model.js" [cite: 55]
│   │
│   ├── routes/                  # (مهمتك: تبسيط الأسامي وحذف .routes) [cite: 52, 53]
│   │   ├── admin.js             # كان "dashboard.routes.js" [cite: 53]
│   │   ├── auctions.js          # [جديد - يوسف] مسارات المزادات [cite: 16]
│   │   ├── auth.js              # كان "auth.routes.js" [cite: 53]
│   │   ├── bids.js              # [جديد - أريني] مسارات المزايدات [cite: 22]
│   │   ├── bookings.js          # كان "booking.routes.js" [cite: 53]
│   │   ├── properties.js        # كان "property.routes.js" [cite: 53]
│   │   ├── reviews.js           # كان "review.routes.js" [cite: 53]
│   │   ├── users.js             # كان "user.routes.js" [cite: 53]
│   │   └── ... (بقية المسارات بنفس النمط)
│   │
│   ├── services/
│   │   └── bookingService.js    # كان "booking.service.js" (توحيد تسمية)
│   │
│   ├── utils/
│   │   ├── apiFeatures.js       # (كما هو)
│   │   ├── AppError.js          # كان "appError.js" (تحويل لـ PascalCase لأنه Class)
│   │   ├── asyncHandler.js      # (كما هو)
│   │   └── jwt.js               # (كما هو)
│   │
│   ├── validators/              # [مهمة مينا: التحويل لـ express-validator] [cite: 42, 43]
│   │   ├── authValidators.js    # كان "auth.validators.js" [cite: 42]
│   │   ├── propertyValidators.js# كان "property.validators.js" [cite: 44]
│   │   ├── auctionValidators.js # [جديد - مينا] فحص بيانات المزادات [cite: 40]
│   │   └── validators.js        # (كما هو) ملف التصدير العام
│   │
│   └── server.js                # (مهمتك: تحديث كافة الاستدعاءات والربط الجديد) [cite: 60, 61]
│
├── uploads/                     # مجلد الصور المرفوعة
│   ├── properties/              # صور العقارات
│   └── auctions/                # [جديد - خلف] صور المزادات
│
├── .env                         # متغيرات البيئة
├── package.json                 # (مهمتك: تعديل الاسم لـ "luxe-estates-v2") [cite: 56, 57]
└── README.md                    # [جديد - عمر] توثيق المشروع بالكامل [cite: 64, 65]