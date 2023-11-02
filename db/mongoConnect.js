const mongoose = require('mongoose');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;
mongoose.connect(`${databaseUrl}`, { useNewUrlParser: true, useUnifiedTopology: true });


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("MongoDB connected!");
    // we're connected!
});

module.exports = db;