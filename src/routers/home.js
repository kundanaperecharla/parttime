require('../db/mongoose');
const express = require('express');

const auth = require('../middleware/auth');

const router = new express.Router();

router.get('', (req, res) => {
    res.render('prehome');
});

router.get('/home', (req, res) => {
    res.render('home');
});

router.get('/profile', auth, (req, res) => {
    res.render('profile');
});

module.exports = router;
