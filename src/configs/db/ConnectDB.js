const mongoose = require('mongoose');

const ConnectDB = async (URL) => {
    try {
        await mongoose.connect(URL)
        .then(() => console.log('Connect to db successfully'))
        .catch((err) => console.log('Error connecting to db: ' + err.message))
    } catch (error) {
        console.log('Error connecting to db: ' + error.message);
    }
}

module.exports = ConnectDB