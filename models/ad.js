const mongoose = require('mongoose');

const CATEGORIES = ['Үл хөдлөх', 'Автомашин', 'Электрон бараа', 'Хувцас', 'Үйлчилгээ'];
const VIP_PLANS = [
  { days: 7, price: 5000 },
  { days: 14, price: 9000 },
  { days: 30, price: 18000 }
];

const adSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category:    { type: String, enum: CATEGORIES, required: true },
  title:       { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true },
  price:       { type: Number, default: 0, min: 0 },
  location:    { type: String, trim: true },
  image:       { type: String },
  vipUntil:    { type: Date },
  vipPlanDays: { type: Number, enum: VIP_PLANS.map(plan => plan.days) },
  vipPrice:    { type: Number, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Ad', adSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.VIP_PLANS = VIP_PLANS;