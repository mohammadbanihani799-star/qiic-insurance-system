const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('❌ FATAL: JWT_SECRET environment variable is required!');
}

function generateTokenFor(user) {
    return jwt.sign(
        { id: user.id || user._id, username: user.username },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
}

module.exports = generateTokenFor;
