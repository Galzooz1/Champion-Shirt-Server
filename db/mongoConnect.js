const mongoose = require('mongoose');
const { config } = require("../config/secretData");
// panda3 -> מיצג את השם של המסד נתונים
mongoose.connect(`mongodb+srv://${config.mongoUser}:${config.mongoPassword}@cluster0.1dcgs.mongodb.net/FinalProject`, { useNewUrlParser: true, useUnifiedTopology: true });


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("MongoDB connected!");
    // we're connected!
});

module.exports = db;