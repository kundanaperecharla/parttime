require('../db/mongoose');
const express = require('express');

const Users = require('../models/users');
const Requests = require('../models/requests');

const { getCurrentTime } = require('../utils/util');
const auth = require('../middleware/auth');
const { customerOrHelperAuth } = require('../middleware/userTypeAuth');

const router = new express.Router();

const workNotes = 'workNotes';

router.get('/signup', (req, res) => {
    res.render('signup', {
        userType: req.query.user
    });
});

// todo: send type on slecting customer/helper card
router.post('/signup', async (req, res) => {
    try {
        const { name, mobile, userType } = req.body;
        const user = new Users({
            name,
            mobile,
            type: userType
        });
        await user.save();
        await user.generateAuthToken();
        if (user) {
            res.status(201).send();
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

router.post('/login', async (req, res) => {
    try {
        const { user } = await Users.isNewUser(req.body.mobile);
        await user.generateAuthToken();
        res.status(200).send();
    } catch (e) {
        res.status(500).send(e);
    }
});

router.post('/logout', auth, async (req, res) => {
    try {
        const user = req.user;
        user.tokens = user.tokens.filter(token => token.token !== req.token);
        await user.save();
        res.send(user);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.post('/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send("Logged out. " + req.user);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get('/profileDetails', [auth, customerOrHelperAuth], async (req, res) => {
    try {
        const whoseRequests = req.user.type === 'customer' ? 'customerRequests' : req.user.type === 'helper' ? 'helperRequests' : null;
        await req.user.populate(whoseRequests);
        res.send({
            user: req.user,
            requests: req.user[whoseRequests]
        });
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch('/updateName', auth, async (req, res) => {
    try {
        const user = await Users.findOneAndUpdate({
            _id: req.user._id
        }, {
            name: req.body.newName
        }, {
            new: true
        });
        if (user) {
            const protectedUser = user.toJSON();
            res.send(protectedUser);
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

router.delete('/profile', auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(`Deleted your profile successfully, Bye ${req.user.name}`);
    } catch (e) {
        res.status(500).send(e);
    }
});

// GET requests/keywords=banana&status=complete
router.get('/requests', [auth, customerOrHelperAuth], async (req, res) => {
    // open requests by current user only
    let match = {};
    const { status, keywords } = req.query;

    // Filter requests based on status
    if (!status) {
        // default match
        match = {
            status: {
                $nin: ['complete', 'incomplete', 'cancelled']
            }
        };
    } else if (status === 'all') {
        match = {};
    } else {
        // user has provided some status query to filter requests
        match = { status };
    }

    // Filter requests based on keywords in title or worknotes
    if (keywords) {
        const regexOrQuery = typeof keywords === 'string' ? keywords : keywords.join('|');
        Object.assign(match, {
            $or: [{
                title: {
                    $regex: regexOrQuery
                }
            }, {
                workNotes: {
                    $regex: regexOrQuery
                }
            }]
        });
    }

    try {
        // const limit = 2; // TODO: add pagination after UI
        // const page = 1;
        const whoseRequests = req.user.type === 'customer' ? 'customerRequests' : req.user.type === 'helper' ? 'helperRequests' : null;
        await req.user.populate({
            path: whoseRequests,
            match,
            options: {
                // limit,
                // skip: (page - 1) * limit,
                sort: {
                    createdAt: -1 // descending order
                }
            }
        });
        res.send({
            owner: req.user.name,
            requests: req.user[whoseRequests],
        });
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch('/request/comment/:id', auth, async (req, res) => {
    const requestedUpdates = Object.keys(req.body);
    if (requestedUpdates.length !== 1 || requestedUpdates[0] !== workNotes)
        return res.status(400).send("You are not allowed to edit the request. You can either comment or cancel the request");

    try {
        let findOneFilters = {
            _id: req.params.id
        };
        if (req.user.type === 'customer') {
            // If it is a customer, the request must belong to them
            findOneFilters['owner'] = req.user._id;
        } else if (req.user.type === 'helper') {
            // if it is a helper, the request must be assigned to them
            findOneFilters['assignedTo'] = req.user._id;
        }

        const request = await Requests.findOne(findOneFilters);
        if (!request)
            return res.status(404).send("No request found");

        const timeNow = getCurrentTime();
        const currentUserName = req.user.name;
        const newWorkNote = req.body[workNotes];
        const transformedWorkNotes = request[workNotes].concat(`(${timeNow}) ${currentUserName} says: ${newWorkNote}`); // TODO: new line while on app or html

        request[workNotes] = transformedWorkNotes;
        await request.save();
        res.send(request);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;
