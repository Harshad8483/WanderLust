const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing");
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
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
// index route 
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", {allListings});
});

//New route 
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});


// Show route 
app.get("/listings/:id", async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show", {listing});
});

// Create route
app.post("/listings", async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");          
});

// Edit route 
app.get("/listings/:id/edit", async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", {listing});
});

// Update route
app.put("/listings/:id", async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
});

// Delete route
app.delete("/listings/:id", async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted listing:", deletedListing);
    res.redirect("/listings");
});



/*app.get("/testlistings", async (req, res) => {
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

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});