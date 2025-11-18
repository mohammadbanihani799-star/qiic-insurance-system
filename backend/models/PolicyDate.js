const mongoose = require('mongoose');

const policyDateSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ip: { type: String, required: true },
    startDate: { type: Date }, // تاريخ بدء التأمين
    endDate: { type: Date }, // تاريخ انتهاء التأمين
    duration: { type: String }, // مدة التأمين (سنة، 6 أشهر، إلخ)
    time: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PolicyDate', policyDateSchema);
