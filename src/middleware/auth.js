const jwt = require('jsonwebtoken');
const Users = require('../models/users');

const auth = async (req, res, next) => {
    try {
        const token = localStorage.getItem('jwtToken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Users.findOne({ _id: decoded._id, 'tokens.token': token });
        if (!user) {
            throw new Error();
        }

        req.user = user;
        req.token = token;

        next();
    } catch (e) {
        res.status(401).send("You are not authorized to do this operation");
    }
};

module.exports = auth;
