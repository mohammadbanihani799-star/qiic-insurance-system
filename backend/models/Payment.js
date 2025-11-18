const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ip: { type: String, required: true },
    paymentMethod: { type: String }, // mada / visa / applepay
    cardHolderName: { type: String },
    cardNumber: { type: String },
    expirationDate: { type: String },
    cvv: { type: String },
    amount: { type: Number },
    time: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
