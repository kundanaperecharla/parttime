require('../db/mongoose');
const express = require('express');
const { getCurrentTime } = require('../utils/util');

const auth = require('../middleware/auth');
const { customerAuth } = require('../middleware/userTypeAuth');

const Requests = require('../models/requests');

const router = new express.Router();

const workNotes = 'workNotes';

router.get('/new-request/pricing', [auth, customerAuth], (req, res) => {
    res.render('pricing');
});

router.get('/new-request', [auth, customerAuth], (req, res) => {
    // todo: only one page for all request methods or ?
    const allowedRequestTypes = ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010'];
    let to_input_label = 'To:';
    switch (req.query.type) {
        case '001':
        case '009':
        case '004':
            to_input_label = "Deliver to:";
            break;
        case '003':
        case '007':
        case '008':
            to_input_label = "Where:";
            break;

        default:
            break;
    }
    if (allowedRequestTypes.includes(req.query.type)) {
        res.render('newRequest', {
            MAPS_URL: process.env.MAPS_URL,
            type: req.query.type,
            to_input_label
        });
    } else {
        res.render('404', {
            message: "Invalid request type"
        });
    }
});

router.post('/request', [auth, customerAuth], async (req, res) => {
    try {
        let transformedWorkNotes = [];
        if (req.body[workNotes]) {
            const timeNow = getCurrentTime();
            const currentUserName = req.user.name;
            const newWorkNote = req.body[workNotes];

            transformedWorkNotes = transformedWorkNotes.concat(`(${timeNow}) ${currentUserName} says: ${newWorkNote}`); // TODO: new line while on app or html            
        }
        const request = new Requests({
            title: req.body.title,
            owner: req.user._id,
            workNotes: transformedWorkNotes,
            status: 'pendingDispatch'
        });
        await request.save();
        res.status(201).send(request);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get('/request/:id', [auth, customerAuth], async (req, res) => {
    // when user searches for a specific request using id, show only if the owner is the user
    try {
        const request = await Requests.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!request) {
            res.status(404).send("No request found");
        }
        res.send(request);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch('/request/cancel/:id', [auth, customerAuth], async (req, res) => {
    // to cancel task
    try {
        const request = await Requests.findOneAndUpdate({
            _id: req.params.id,
            owner: req.user._id
        }, {
            status: 'cancelled'
        });

        if (!request) {
            return res.status(404).send("No request found");
        }

        res.send("Cancelled: " + request);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;
