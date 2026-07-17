const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError'); 
const session = require("express-session");
const flash = require("connect-flash");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

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

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    },
};

app.get('/', (req, res) => {
    res.send('Hello, World!');
});


app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
     res.locals.error = req.flash("error");
    next();
})

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);





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