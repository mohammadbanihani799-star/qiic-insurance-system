const mongoose = require('mongoose');

const plateNumberSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ip: { type: String, required: true },
    plateNumber: { type: String }, // رقم اللوحة
    plateCode: { type: String }, // كود اللوحة
    time: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PlateNumber', plateNumberSchema);
