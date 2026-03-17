const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'عنوان العقار مطلوب'],
      trim: true,
      minlength: [10, 'العنوان قصير جداً (10 حروف على الأقل)'],
      maxlength: [100, 'العنوان طويل جداً (بحد أقصى 100 حرف)'],
    },
    description: {
      type: String,
      required: [true, 'وصف العقار مطلوب'],
      minlength: [20, 'الوصف قصير جداً'],
    },
    price: {
      type: Number,
      required: [true, 'سعر العقار مطلوب'],
      min: [0, 'السعر لا يمكن أن يكون بالسالب'],
    },
    type: {
      type: String,
      required: [true, 'نوع العقار مطلوب'],
      enum: {
        values: ['apartment', 'villa', 'house', 'studio', 'office', 'shop', 'land', 'commercial'],
        message: '{VALUE} نوع غير مدعوم حالياً',
      },
    },
    listingType: {
      type: String,
      enum: { values: ['sale', 'rent'], message: 'القيمة يجب أن تكون sale أو rent' },
      default: 'sale',
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold'],
      default: 'available',
    },
    location: {
      city: { type: String, required: [true, 'المدينة مطلوبة'] },
      district: { type: String, required: [true, 'الحي مطلوب'] },
      street: { type: String },
    },
    area: {
      type: Number,
      min: [0, 'المساحة لا يمكن أن تكون بالسالب'],
    },
    bedrooms: { type: Number, default: 0, min: 0 },
    bathrooms: { type: Number, default: 0, min: 0 },
    images: {
      type: [String],
      default: [],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'العقار يجب أن يتبع مستخدم'],
    },
    avgRating: {
      type: Number,
      default: 0,
      min: [0, 'أقل تقييم هو 0'],
      max: [5, 'أعلى تقييم هو 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    reviewCount: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better search performance
propertySchema.index({ price: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ listingType: 1 });
propertySchema.index({ 'location.city': 1 });
propertySchema.index({ owner: 1 });

// Virtual populate for reviews
propertySchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'propertyId',
  localField: '_id',
});

module.exports = mongoose.model('Property', propertySchema);
