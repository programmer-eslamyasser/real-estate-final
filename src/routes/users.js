const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const restrictTo = require('../middlewares/restrictToMiddleware');
const validate = require('../middlewares/validationMiddleware');
const paginate = require('../middlewares/paginate');
const authValidators = require('../validators/authValidators');

router.use(protect);

router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
router.patch('/change-password', 
  validate(authValidators.changePasswordSchema), 
  userController.changePassword
);
// Admin only
router.get('/', restrictTo('admin'), paginate, userController.getAllUsers);
router.get('/:id', restrictTo('admin'), userController.getUser);
router.delete('/:id', restrictTo('admin'), userController.deleteUser);

module.exports = router;