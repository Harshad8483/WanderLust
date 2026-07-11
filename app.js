const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing");
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError'); 
const { listingSchema, reviewSchema } = require('./schema');
const Review = require('./models/review');
const mongoURI = 'mongodb://127.0.0.1:27017/wonderlust';



main().then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});
async function main(params) {
    await mongoose.connect(mongoURI);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
        if (error) {
            let errorMsg = error.details.map(el => el.message).join(",");
            throw new ExpressError(400, errorMsg);
        }else {
        next();
}
};


const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
        if (error) {
            let errorMsg = error.details.map(el => el.message).join(",");
            throw new ExpressError(400, errorMsg);
        }else {
        next();
}
};

// index route 
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", {allListings});
}));

//New route 
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});


// Show route 
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show", {listing});
}));

// Create route
app.post("/listings", 
    validateListing,
    wrapAsync(async (req, res, next) => {
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    
}));

// Edit route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", {listing});
}));

// Update route
app.put("/listings/:id", 
    validateListing,
    wrapAsync(async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

// Delete route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted listing:", deletedListing);
    res.redirect("/listings");
}));

//Reviews
//post route for reviews
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let review = new Review(req.body.review);
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));

// Delete Review Route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {

    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId }
    });

    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);

}));




/*app.get("/testlistings", wrapAsync( async (req, res) => {
     let sampleListing = new Listing({
        title: "My new Villa",
        description: "By the beach.",
        price: 1000,
        location: "Miami",
        country: "USA",
        
    
    });
    await sampleListing.save();
    console.log("Sample listing saved to the database.");
    res.send("Successfully saved listing to the database.");
});*/

app.all("*", (req, res, next) => {
    next(new ExpressError(404, 'Page Not Found'));
});

app.use((err, req, res, next) => {
    let { statusCode = 500 } = err;

    if (!err.message) {
        err.message = "Something went wrong!";
    }

    res.status(statusCode).render("error.ejs", { err });
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});