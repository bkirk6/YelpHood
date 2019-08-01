var Neighborhood = require("../models/neighborhood");
var Comment = require("../models/comment");
var Review = require("../models/review");
//all the middleware
var middlewareObj = {};

middlewareObj.checkNeighborhoodOwnership = function checkNeighborhoodOwnership(req, res, next){
    if (req.isAuthenticated()){
        Neighborhood.findById(req.params.id, function(err, foundNeighborhood) {
            if(err) {
                req.flash("error", "Error: Neighborhood not found.");
                res.redirect("back");
            } else {
                if (foundNeighborhood.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "Error: Only post owners may modify.");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Error: Must be logged in.");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function checkCommentOwnership(req, res, next){
    if (req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err) {
                res.redirect("back");
            } else {
                if (!foundComment) {
                    req.flash("error", "Item not found.");
                    return res.redirect("back");
                }
                if (foundComment.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "Error: Only comment owners may modify.");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Error: Must be logged in.");
        res.redirect("back");
    }
};

middlewareObj.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                res.redirect("back");
            }  else {
                // does user own the comment?
                if(foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "Only review owners may modify.");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Error: Must be logged in.");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Neighborhood.findById(req.params.id).populate("reviews").exec(function (err, foundNeighborhood) {
            if (err || !foundNeighborhood) {
                req.flash("error", "Neighborhood not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundNeighborhood.reviews
                var foundUserReview = foundNeighborhood.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/neighborhoods/" + foundNeighborhood._id);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "Error: Must be logged in.");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next){
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Error: Must be logged in.");
    res.redirect("/login");
};


module.exports = middlewareObj;