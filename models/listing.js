const mongoose = require('mongoose');
const schema = mongoose.Schema;

const listingSchema = new schema({
    title: {
        type: String,
        required: true

    },
    description: String,
   image: {
    filename: {
        type: String,
        default: "listingimage",
    },
    url: {
        type: String,
        default: "https://media.istockphoto.com/id/2233143644/photo/scenic-tropical-beach-paradise-with-palm-trees-in-goa-india.jpg?s=1024x1024&w=is&k=20&c=PYknAX7KgxAkGbF-3vK7EqnBsmVhECsD57ElX0FsXEc=",
    }
},
    price: Number,
    location: String,
    country: String,
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;