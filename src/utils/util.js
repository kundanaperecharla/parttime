const moment = require('moment');

const getCurrentTime = () => moment().format('YYYY-MM-DD hh:mm:ss');

module.exports = {
    getCurrentTime
};
