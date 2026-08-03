const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js")
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage: storage });


const listingsController = require("../Controllers/listings.js");


router.route("/")

    .get(wrapAsync(listingsController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingsController.createListing)
    );
    

// New Route
router.get("/new", isLoggedIn, listingsController.renderNewForm
);

    router.route("/:id")
    .get(wrapAsync(listingsController.showListing))
    .put( 
         validateListing,
         isLoggedIn,
         isOwner,
    wrapAsync(listingsController.updateListing))
    .delete(
         isLoggedIn,
         isOwner,
         wrapAsync(listingsController.destroyListing));


// Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync( listingsController.renderEditForm
));


module.exports = router;