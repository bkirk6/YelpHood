var express = require("express");
var router = express.Router();
var Neighborhood = require("../models/neighborhood");
var Comment = require("../models/comment");
var Review = require("../models/review");
var middleware = require("../middleware");

//Index route
router.get("/", function(req, res) {
    //get all neighborhoods from DB
    Neighborhood.find({}, function(err, allNeighborhoods) {
        if (err) {
            console.log(err);
        } else {
            res.render("neighborhoods/index", {neighborhoods: allNeighborhoods, page: 'neighborhoods'});
        }
    });
});

//Create route
router.post("/", middleware.isLoggedIn, function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newNeighborhood = {name: name, image: image, description: description, author: author};
    // Create new neighborhood to save to db
    Neighborhood.create(newNeighborhood, function(err, newlyCreated){
        if (err) {
            console.log(err);
        } else {
            res.redirect("/neighborhoods");
        }
    });
});

//New route
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("neighborhoods/new");
});

//Show route
router.get("/:id", function (req, res) {
    //find the neighborhood with provided ID
    Neighborhood.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function (err, foundNeighborhood) {
        if (err) {
            console.log(err);
        } else {
            //render show template with that neighborhood
            res.render("neighborhoods/show", {neighborhood: foundNeighborhood});
        }
    });
});

//EDIT neighborhood route
router.get("/:id/edit", middleware.checkNeighborhoodOwnership, function(req, res){
    Neighborhood.findById(req.params.id, function(err, foundNeighborhood) {
        res.render("neighborhoods/edit", {neighborhood: foundNeighborhood}); 
    });
});

//UPDATE neighborhood route
router.put("/:id", middleware.checkNeighborhoodOwnership, function(req, res){
    delete req.body.neighborhood.rating;
    //find and update correct neighborhood
    Neighborhood.findByIdAndUpdate(req.params.id, req.body.neighborhood, function(err, updatedNeighborhood){
        if (err) {
            res.redirect("/neighborhoods");
        } else {
            res.redirect("/neighborhoods/" + req.params.id);
        }
    });
});

//DESTROY neighborhood route
router.delete("/:id", middleware.checkNeighborhoodOwnership, function (req, res) {
    Neighborhood.findById(req.params.id, function (err, neighborhood) {
        if (err) {
            res.redirect("/neighborhoods");
        } else {
            // deletes all comments associated with the neighborhood
            Comment.remove({"_id": {$in: neighborhood.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/neighborhoods");
                }
                // deletes all reviews associated with the neighborhood
                Review.remove({"_id": {$in: neighborhood.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/neighborhoods");
                    }
                    //  delete the neighborhood
                    neighborhood.remove();
                    req.flash("success", "Neighborhood deleted successfully");
                    res.redirect("/neighborhoods");
                });
            });
        }
    });
});





module.exports = router;