const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token received:', token); // Log token (optional)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded:', decoded); // Log decoded payload
            req.userId = decoded.userId;
            next();
        } catch (error) {
            console.error('Auth middleware error:', error.message); // Log the actual error
            return res.status(401).json({ message: 'Not authorized' });
        }
    }

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };