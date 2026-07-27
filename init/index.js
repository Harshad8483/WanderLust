const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');

const mongoURI = 'mongodb://127.0.0.1:27017/wonderlust';

main().then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});
async function main(params) {
    await mongoose.connect(mongoURI);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "6a638963c8df68571894786e"}));
    await Listing.insertMany(initData.data);
    console.log("Database initialized with sample data.");
};
initDB();