const mongoose = require('mongoose');

const moreDetailsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ip: { type: String, required: true },
    bodyType: { type: String }, // نوع الهيكل (سيدان، SUV، إلخ)
    engineSize: { type: String }, // حجم المحرك
    color: { type: String }, // اللون
    registrationYear: { type: String }, // سنة التسجيل
    time: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MoreDetails', moreDetailsSchema);
