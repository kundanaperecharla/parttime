require('../db/mongoose');
const express = require('express');

const { getCurrentTime } = require('../utils/util');

const auth = require('../middleware/auth');
const { helperAuth } = require('../middleware/userTypeAuth');

const Requests = require('../models/requests');

const router = new express.Router();

router.patch('/request/accept/:id', [auth, helperAuth], async (req, res) => {
    try {
        const request = await Requests.findOne({
            _id: req.params.id
        });

        const requestAssignedTo = request.assignedTo;
        const currentUserID = req.user._id;

        if (!request || requestAssignedTo !== null && requestAssignedTo.toString() !== currentUserID.toString()) {
            return res.status(404).send("No request found");
        }

        if (requestAssignedTo !== null && requestAssignedTo.toString() === currentUserID.toString()) {
            return res.send("Request already assigned to you.");
        }

        if (requestAssignedTo === null) {
            request.assignedTo = currentUserID;
            request.status = 'assigned';
            request.workNotes = request.workNotes.concat(`(${getCurrentTime()}) ${req.user.name} has accepted your request`);
            await request.save();
            res.send("Accepted! Let's get to work." + request);
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch('/request/finishWork/:id', [auth, helperAuth], async (req, res) => {
    try {
        const request = await Requests.findOne({
            _id: req.params.id,
            assignedTo: req.user._id
        });

        if (!request) {
            return res.status(404).send("Record not found");
        }

        if (request.status !== 'assigned')
            return res.status(400).send(`Invalid update. Request in ${request.status} state.`);

        request.status = 'workFinishedPaymentPending';
        request.workNotes = request.workNotes.concat(`(${getCurrentTime()}) ${req.user.name}: Work completed. Awaiting payment`);
        request.save();

        res.send("Work finished. You'll receive your payment soon");
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch('/request/confirmPayment/:id', [auth, helperAuth], async (req, res) => {
    try {
        const request = await Requests.findOne({
            _id: req.params.id,
            assignedTo: req.user._id
        });

        if (!request) return res.status(404).send("Request not found");

        if (request.status !== 'workFinishedPaymentPending')
            return res.status(400).send(`Invalid update. Request in ${request.status} state.`);

        request.status = 'complete';
        request.workNotes = request.workNotes.concat(`(${getCurrentTime()}) ${req.user.name}: Payment received, closing request. Have a beautiful day`);
        await request.save();

        res.send("Thank you for confirming. Closing the request");
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch('/request/closeincomplete/:id', [auth, helperAuth], async (req, res, next) => {
    try {
        const request = await Requests.findOne({
            _id: req.params.id,
            assignedTo: req.user._id
        });

        if (!request) return res.status(404).send("Request not found");

        switch (request.status) {
            case 'assigned':
                const owner = request.owner;
                request.status = 'incomplete';
                request.workNotes = request.workNotes.concat(`(${getCurrentTime()}) ${req.user.name} is unable to work on your request. We're assigning it to a new helper. Thank you for your patience`);
                request.id = request._id;
                request.owner = process.env.CLOSED_INCOMPLETE_USER; // TODO: when going live, either 1. create a user with your number or 2. create a user with unreachable number(2 digits? not 10)
                request.save();

                // todo: trigger new request creation
                req.url = '/request/duplicateRequest';
                req.method = 'POST';
                req.inputs = {
                    request,
                    owner
                };
                next();

                return res.send('Marked request closed incomplete');


            case 'workFinishedPaymentPending':
                // TODO: Send a "private" alert seeking confirmation on this update. Work done, payment pending. Do you still want to cancel?
                return res.send('TODO');

            default:
                return res.status(400).send(`Invalid update. Request in ${request.status} state.`);
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

router.post('/request/duplicateRequest', [auth, helperAuth], async (req, res) => {
    try {
        const { title, workNotes, createdAt, updatedAt, id } = req.inputs.request;
        const request = new Requests({
            title,
            workNotes,
            owner: req.inputs.owner,
            createdAt,
            updatedAt,
            id,
            status: 'pendingDispatch',
            assignedTo: null
        });
        await request.save();
    } catch (e) {
        throw new Error(e);
    }
});

module.exports = router;
