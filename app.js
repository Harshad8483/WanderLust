if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError'); 
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const user = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

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

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

/*app.get("/demouser", async (req, res) => {

    let fakeUser = new user({
        email: "student@gmail.com",
        username: "delta-student",
    });

    let registeredUser = await user.register(fakeUser, "helloworld");

    res.send(registeredUser);

});*/

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);





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