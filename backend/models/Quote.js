const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ip: { type: String, required: true },
    quotedPrice: { type: Number }, // السعر المعروض
    discountApplied: { type: Number, default: 0 }, // الخصم المطبق
    finalPrice: { type: Number }, // السعر النهائي
    accepted: { type: Boolean, default: false }, // قبول العرض
    time: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Quote', quoteSchema);
