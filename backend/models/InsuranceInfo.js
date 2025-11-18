const mongoose = require('mongoose');

const insuranceInfoSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ip: { type: String, required: true },
    fullName: { type: String }, // الاسم الكامل
    qid: { type: String }, // رقم البطاقة
    phone: { type: String }, // رقم الهاتف
    email: { type: String }, // البريد الإلكتروني
    address: { type: String }, // العنوان
    time: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('InsuranceInfo', insuranceInfoSchema);
