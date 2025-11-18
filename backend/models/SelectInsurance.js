const mongoose = require('mongoose');

const selectInsuranceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ip: { type: String, required: true },
    insuranceType: { type: String }, // شامل / طرف ثالث
    selectedCompany: { type: String }, // الشركة المختارة
    basePrice: { type: Number }, // السعر الأساسي
    selectedOptions: { type: Array, default: [] }, // خيارات إضافية
    totalPrice: { type: Number }, // السعر النهائي
    time: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('SelectInsurance', selectInsuranceSchema);
