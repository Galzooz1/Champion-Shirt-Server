const mongoose = require('mongoose');
require('dotenv').config();
// const { config } = require("../config/secretData");

const databaseUrl = process.env.DATABASE_URL;
// panda3 -> מיצג את השם של המסד נתונים
mongoose.connect(`${databaseUrl}`, { useNewUrlParser: true, useUnifiedTopology: true });


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("MongoDB connected!");
    // we're connected!
});

module.exports = db;