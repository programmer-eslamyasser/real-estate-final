const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const authValidators = require('../validators/authValidators');

// ─── Auth Endpoints ──────────────────────────

// استخدمنا validate(schema) عشان نبعت function لـ Express
router.post('/register', validate(authValidators.registerSchema), authController.register);

router.post('/login', validate(authValidators.loginSchema), authController.login);

router.get('/me', protect, authController.getMe);

module.exports = router;