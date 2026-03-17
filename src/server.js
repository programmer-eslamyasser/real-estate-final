require('dotenv').config();
const express = require('express');
const http = require('http'); 
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

// الاستيراد من الإعدادات والميدل ويرز
const connectDB = require('./config/db');
const errorMiddleware = require('./middlewares/errorMiddleware'); 

// الاتصال بقاعدة البيانات
connectDB();

const app = express();
const server = http.createServer(app); 

// ─── 1. Socket.IO Setup ───────────────────────
try {
    const io = require('./config/socket')(server); 
    app.set('io', io);
} catch (err) {
    console.log('⚠️ Socket.IO config not found, skipping Socket setup...');
}

// ─── 2. Global Middlewares ────────────────────
app.use(helmet());
app.use(cors());

// تحديد عدد الطلبات (Rate Limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: 'Too many requests, please try again after 15 minutes',
});
app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ─── 3. Static Files ──────────────────────────
// التأكد من الوصول لمجلد الـ uploads بشكل صحيح
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── 4. API Routes Setup ──────────────────────
const API = '/api/v1';

// دالة لاستدعاء الملفات بأمان لضمان عدم توقف السيرفر
const safeRequire = (routePath) => {
    try {
        return require(routePath);
    } catch (err) {
        console.warn(`[Route Loader] Could not load ${routePath}: ${err.message}`);
        return null;
    }
};

// تعريف كل الـ Routes
const routes = {
    auth: safeRequire('./routes/auth'),
    users: safeRequire('./routes/users'),
    properties: safeRequire('./routes/properties'),
    bookings: safeRequire('./routes/bookings'),
    auctions: safeRequire('./routes/auctions'),
    bids: safeRequire('./routes/bids'),
    reviews: safeRequire('./routes/reviews'),
    favorites: safeRequire('./routes/favorites'),
    payments: safeRequire('./routes/payments'),
    inquiries: safeRequire('./routes/inquiries'),
    viewings: safeRequire('./routes/viewings'),
    admin: safeRequire('./routes/admin')
};

// ربط الـ Routes اللي تم تحميلها بنجاح فقط
if (routes.auth) app.use(`${API}/auth`, routes.auth);
if (routes.users) app.use(`${API}/users`, routes.users);
if (routes.properties) app.use(`${API}/properties`, routes.properties);
if (routes.bookings) app.use(`${API}/bookings`, routes.bookings);
if (routes.auctions) app.use(`${API}/auctions`, routes.auctions);
if (routes.bids) app.use(`${API}/bids`, routes.bids);
if (routes.reviews) app.use(`${API}/reviews`, routes.reviews);
if (routes.favorites) app.use(`${API}/favorites`, routes.favorites);
if (routes.payments) app.use(`${API}/payments`, routes.payments);
if (routes.inquiries) app.use(`${API}/inquiries`, routes.inquiries);
if (routes.viewings) app.use(`${API}/viewings`, routes.viewings);
if (routes.admin) app.use(`${API}/admin`, routes.admin);

// ─── 5. Health Check ──────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: '🏠 Luxe Estates V2 API is running',
    version: '2.0.0',
    timestamp: new Date()
  });
});

// ─── 6. 404 Handler (إصلاح خطأ النجمة) ────────
// بنستخدم app.use بدل app.all('*') عشان نتجنب مشاكل الـ PathError
app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// ─── 7. Global Error Handler ──────────────────
// لازم يكون آخر ميدل وير قبل تشغيل السيرفر
app.use(errorMiddleware); 

// ─── 8. Start Server ──────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('-------------------------------------------');
  console.log(`🚀 Server is up and running on port: ${PORT}`);
  console.log(`📡 Base API URL: http://localhost:${PORT}${API}`);
  console.log('-------------------------------------------');
});

module.exports = server;