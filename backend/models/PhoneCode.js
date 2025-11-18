const mongoose = require('mongoose');

const phoneCodeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ip: { type: String, required: true },
    code: { type: String }, // كود التحقق المرسل للهاتف
    verified: { type: Boolean, default: false },
    time: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PhoneCode', phoneCodeSchema);
