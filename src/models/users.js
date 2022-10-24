const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

const Requests = require('./requests');

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }, mobile: {
        type: String,
        unique: true,
        required: true,
        validate(value) {
            if (value.length !== 10) {
                throw new Error("Enter 10 digits mobile number");
            }
        }
    }, type: {
        type: String,
        enum: ['customer', 'helper', 'admin'],
        default: 'customer',
        required: true,
    }, tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

usersSchema.virtual('customerRequests', {
    ref: 'Requests',
    localField: '_id',
    foreignField: 'owner'
});

usersSchema.virtual('helperRequests', {
    ref: 'Requests',
    localField: '_id',
    foreignField: 'assignedTo'
});

// deleting all requests by user when user profile is deleted
// todo is this needed
usersSchema.pre("remove", async function (next) {
    const user = this;
    await Requests.deleteMany({
        owner: user._id,
    });
    next();
});

usersSchema.statics.isNewUser = async function (mobile) {
    try {
        const user = await Users.findOne({ mobile });
        if (!user) {
            return {
                isNewUser: true
            };
        }

        return {
            isNewUser: false,
            user
        };
    } catch (e) {
        throw new Error(e);
    }
}

// Methods on user
usersSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign(
        { _id: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION }
    );
    localStorage.setItem('jwtToken', token);
    user.tokens = user.tokens.concat({ token });

    await user.save();
    return token;
};

usersSchema.methods.toJSON = function () {
    const user = this;
    const clonedUser = user.toObject();

    delete clonedUser.tokens;
    delete clonedUser.__v;

    return clonedUser;
}

const Users = mongoose.model("Users", usersSchema);

module.exports = Users;
