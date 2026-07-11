const mongoose = require('mongoose');
const schema = mongoose.Schema;
const Review = require('./review');

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
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ]   
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({
            _id: { $in: listing.reviews }
        });
    }
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;