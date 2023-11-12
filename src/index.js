const path = require('path');
const http = require('http');
const express = require('express');
const hbs = require('hbs');
const socketio = require('socket.io');
const bcrypt = require('bcrypt');
var needle = require('needle');
const request = require('request');

const viewsPath = path.join(__dirname, './templates/views');
const partialsPath = path.join(__dirname, './templates/partials');
const publicDirectoryPath = path.join(__dirname, '../public');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.set('view engine', 'hbs');
app.set('views', viewsPath);
app.use(express.static(publicDirectoryPath));
hbs.registerPartials(partialsPath);

app.use(express.json());

const port = process.env.PORT;

const homeRouter = require('./routers/home');
const usersRouter = require('./routers/users');
const customersRouter = require('./routers/customers');
const helpersRouter = require('./routers/helpers');
const Users = require('./models/users');
const OTPs = require('./models/otps');

app.use(homeRouter);
app.use(usersRouter);
app.use(customersRouter);
app.use(helpersRouter);

app.get('*', (req, res) => {
    res.render('404');
});

io.on('connection', (socket) => {

    const generateOTP = async (mobile) => {
        // All possible characters of my OTP
        let generatedOTP = "";
        let str = process.env.OTP_CHARACTERS;
        let n = str.length;

        for (var i = 1; i <= 6; i++)
            generatedOTP += str[Math.floor(Math.random() * 10) % n];
        console.log("generatedOTP", generatedOTP); // Todo: send to users this OTP

        try {
            const otp = new OTPs({
                otp: generatedOTP,
                mobile
            });
            await otp.save();

            socket.emit('otpRequested'); //todo: emit this only when otp sending is successful
        } catch (e) {
            console.log(e);
        }
    };

    const regenerateOTP = async (mobile) => {
        try {
            await OTPs.deleteOne({ mobile });
            generateOTP(mobile);
        } catch (e) {
            console.log(e); // todo: handle thois error
        }
    };

    const validateOTP = async (mobile, typedOTP, cardClickUserType, baseURL) => {
        // todo code to validate OTP
        let storedOTP = '';
        let otpRecord;
        try {
            otpRecord = await OTPs.findOne({ mobile });
            if (!otpRecord) {
                return console.log("OTP expired"); // todo: handle thois error
            }
            storedOTP = otpRecord.otp;
        } catch (e) {
            console.log(e); // todo: handle thois error
        }

        const isValidOTP = await bcrypt.compare(typedOTP, storedOTP);
        if (!isValidOTP) {
            // wrong OTP
            socket.emit("invalidOTPEntered");
        } else {
            try {

                // delete OTP - has been used
                await otpRecord.remove();

                const { isNewUser, user } = await Users.isNewUser(mobile);
                if (isNewUser) {
                    socket.emit('nameRequested');
                } else {
                    const { type: storedUserType } = user;
                    // login
                    // card click type does not match with stored record type (helper or type)
                    // todo - ask them on UI - "Log in as helper instead? or sign up as a new user"
                    if (cardClickUserType !== storedUserType) {
                        // todo: handle this error
                        console.log(`You already have an account as ${storedUserType}. Log in as ${storedUserType} instead? or sign up as a new user`);
                    } else {
                        needle.post(
                            baseURL + '/login',
                            { mobile },
                            { json: true },
                            (err, res) => {
                                if (err)
                                    console.error(err)
                                else if (res)
                                    socket.emit('redirectToHome');
                            }
                        );
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
    };

    const createRecord = async (mobile, name, userType, baseURL) => {
        needle.post(
            baseURL + '/signup',
            { name, mobile, userType },
            { json: true },
            (err, res) => {
                if (err)
                    console.error('error', err);
                else if (res) {
                    socket.emit('redirectToHome');
                }
            }
        );
    };

    // ---------------------------------------------------------------------------------------------

    const getProfile = (baseURL) => {
        needle.get(baseURL + '/profileDetails', function (err, res) {
            if (err) {
                console.error('error', err);
            }
            else if (res.statusCode == 200) {
                socket.emit('postProfile', res.body)
            }
        });
    };

    const saveNameChanges = (newName, baseURL) => {
        needle.patch(
            baseURL + '/updateName',
            { newName },
            { json: true },
            function (err, res) {
                if (err) {
                    console.error('error', err);
                }
                else if (res.statusCode == 200) {
                    socket.emit('postNameChange', res.body.name)
                }
            });
    };

    // ---------------------------------------------------------------------------------------------

    const getLatLongOfFrom = (fromString) => {
        request(
            "https://maps.googleapis.com/maps/api/geocode/json?address=" + fromString + "&key=" + process.env.MAPS_API_KEY,
            { json: true },
            (err, res) => {
                if (err || res.body.status !== "OK") {
                    console.log(err);
                } else {
                    socket.emit('postLatLongOfFrom', res.body.results[0].geometry.location);
                }
            }
        );
    };

    const getLatLongOfTo = (toString, finalLatLong) => {
        request(
            "https://maps.googleapis.com/maps/api/geocode/json?address=" + toString + "&key=" + process.env.MAPS_API_KEY,
            { json: true },
            (err, res) => {
                if (err || res.body.status !== "OK") {
                    console.log(err);
                } else {
                    socket.emit('postLatLongOfTo', res.body.results[0].geometry.location, finalLatLong);
                }
            }
        );
    }

    // ---------------------------------------------------------------------------------------------

    const submit1locationsWithoutFrom = (data) => {
        const isDataValid = true;
        if (isDataValid) {
            socket.emit('showNextPage');
        }
    };
    const submit2locationsWithFrom = (data) => {
        const isDataValid = true;
        if (isDataValid) {
            socket.emit('showNextPage');
        }
    };
    const submit3orderingItemsViaAll = (data) => {
        const isDataValid = true;
        if (isDataValid) {
            socket.emit('showNextPage');
        }
    };
    const submit4orderingItemsViaJustFileUpload = (data) => {
        const isDataValid = true;
        if (isDataValid) {
            socket.emit('showNextPage');
        }
    };
    const submit5rideModeOfTransportOptions = (data) => {
        const isDataValid = true;
        if (isDataValid) {
            socket.emit('showNextPage');
        }
    };
    const submit6packageModeOfTransportOptions = (data) => {
        const isDataValid = true;
        if (isDataValid) {
            socket.emit('showNextPage');
        }
    };

    const loadPrices = () => {
        const price = 123;
        const priceUnit = '₹';
        socket.emit('onPricesLoaded', price + priceUnit);
    };

    // ---------------------------------------------------------------------------------------------

    socket.on('mobileInputted', generateOTP);
    socket.on('otpInputted', validateOTP);
    socket.on('nameInputted', createRecord);
    socket.on('resendOTPRequested', regenerateOTP);

    socket.on('getProfile', getProfile);
    socket.on('saveNameChanges', saveNameChanges);

    socket.on('getLatLongOfFrom', getLatLongOfFrom);
    socket.on('getLatLongOfTo', getLatLongOfTo);

    socket.on('submit1locationsWithoutFrom', submit1locationsWithoutFrom);
    socket.on('submit2locationsWithFrom', submit2locationsWithFrom);
    socket.on('submit3orderingItemsViaAll', submit3orderingItemsViaAll);
    socket.on('submit4orderingItemsViaJustFileUpload', submit4orderingItemsViaJustFileUpload);
    socket.on('submit5rideModeOfTransportOptions', submit5rideModeOfTransportOptions);
    socket.on('submit6packageModeOfTransportOptions', submit6packageModeOfTransportOptions);

    socket.on('loadPrices', loadPrices);
});

server.listen(port);
