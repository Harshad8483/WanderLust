const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { reviewSchema } = require("../schema");
const Review = require("../models/review");
const Listing = require("../models/listing");
const { validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");

//Reviews
//post route for reviews
router.post("/", isLoggedIn,validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let review = new Review(req.body.review);
    review.author = req.user._id;
    console.log(review);
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
}));

// Delete Review Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {

    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId }
    });

    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted!");

    res.redirect(`/listings/${id}`);

}));

module.exports = router;