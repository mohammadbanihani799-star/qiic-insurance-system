const mongoose = require('mongoose');

const carDetailsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ip: { type: String, required: true },
    vehicleType: { type: String }, // سيارة/دراجة نارية
    brand: { type: String }, // العلامة التجارية
    model: { type: String }, // الموديل
    year: { type: String }, // سنة الصنع
    seats: { type: String }, // عدد المقاعد
    cylinders: { type: String }, // عدد الاسطوانات
    time: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('CarDetails', carDetailsSchema);
