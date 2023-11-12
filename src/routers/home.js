const fs = require('fs');
const path = require('path')
const formidable = require('formidable');
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

router.post('/uploadFile', (req, res) => {
    const form = new formidable.IncomingForm();
    form.options.keepExtensions = true;
    form.parse(req, function (err, fields, files) {
        var oldPath = files.itemsPhoto.filepath;
        // todo: should we have one folder for each customer - maybe mobile number will be the folder name
        // or if new sysid is generated for name everytime, shall we keep the name as is 
        // should we store the sysid name in db?
        var newPath = path.join(__dirname, '../../public/uploads') + '/' + files.itemsPhoto.newFilename;
        var rawData = fs.readFileSync(oldPath);

        fs.writeFile(newPath, rawData, function (err) {
            if (err)
                console.log(err);
            else
                return res.redirect('new-request/pricing');
        });
    });
});

module.exports = router;
