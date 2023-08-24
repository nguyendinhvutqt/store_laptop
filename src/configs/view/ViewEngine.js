const path = require('path');

const ViewEngine = (app) => {
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
}

module.exports = ViewEngine;