const express = require('express');
const router = express.Router();

const propertyController = require('../controllers/propertyController');
const { protect } = require('../middlewares/authMiddleware');
const { isOwner } = require('../middlewares/isOwnerMiddleware');
const { uploadPropertyImages } = require('../middlewares/uploadMiddleware');
const validate = require('../middlewares/validationMiddleware');
const paginate = require('../middlewares/paginate');
const propertyValidators = require('../validators/propertyValidators');

// المسارات العامة
router.get('/', paginate, propertyController.getAllProperties);
router.get('/:id', propertyController.getProperty);

// المسارات المحمية
router.use(protect);

router.get('/my', paginate, propertyController.getMyProperties);

router.post('/', 
  uploadPropertyImages, 
  validate(propertyValidators.createPropertySchema), // ✅ تم الإصلاح
  propertyController.createProperty
);

router.patch('/:id', 
  isOwner, 
  uploadPropertyImages, 
  validate(propertyValidators.updatePropertySchema), // ✅ تم الإصلاح
  propertyController.updateProperty
);

router.delete('/:id', isOwner, propertyController.deleteProperty);

module.exports = router;