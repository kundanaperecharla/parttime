const customerAuth = async (req, res, next) => {
    try {
        if (req.user.type === 'customer') 
            next();
        else 
            throw new Error();
    } catch (e) {
        res.status(401).send("You are not authorized to do this operation");
    }
};

const helperAuth = async (req, res, next) => {
    try {
        if (req.user.type === 'helper') 
            next();
        else 
            throw new Error();
    } catch (e) {
        res.status(401).send("You are not authorized to do this operation");
    }
};

const customerOrHelperAuth = async (req, res, next) => {
    try {
        if (req.user.type === 'customer' || req.user.type === 'helper') 
            next();
        else 
            throw new Error();
    } catch (e) {
        res.status(401).send("You are not authorized to do this operation");
    }
};

module.exports = {
    customerAuth,
    helperAuth,
    customerOrHelperAuth
};
