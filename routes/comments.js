var express = require("express");
var router = express.Router({mergeParams: true});
var Neighborhood = require("../models/neighborhood");
var Comment = require("../models/comment");
var middleware = require("../middleware")

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    Neighborhood.findById(req.params.id, function(err, neighborhood){
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", {neighborhood: neighborhood});
        }
    });
});

//Comments Create
router.post("/", middleware.isLoggedIn, function(req, res){
    //lookup w/ ID
    Neighborhood.findById(req.params.id, function(err, neighborhood){
        if(err) {
            console.log(err);
            res.redirect("/neighborhoods");
        } else {
                //create new comment
            Comment.create(req.body.comment, function(err, comment){
                if (err) {
                    console.log(err);
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    //connect new comment to neighborhood
                    neighborhood.comments.push(comment);
                    neighborhood.save();
                        //redirect to neighborhood show page
                    req.flash("success", "Comment added!");
                    res.redirect("/neighborhoods/" + neighborhood._id);
                }
            });
        }
    });
});

//Comment EDIT route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if (err) {
            res.redirect("back");
        } else {
            res.render("comments/edit", {neighborhood_id: req.params.id, comment: foundComment});
        }
    });
});

//Comment UPDATE route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/neighborhoods/" + req.params.id);
        }
    });
});

//Comment DESTROY route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment removed");
            res.redirect("/neighborhoods/" + req.params.id);
        }
    });
});



module.exports = router;