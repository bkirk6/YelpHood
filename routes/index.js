var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

//Root route
router.get("/", function(req, res){
    res.render("landing");
});

//Register route
router.get("/register", function(req, res){
    res.render("register", {page: 'register'});
});

//handle sign up
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    if(req.body.adminCode === 'secretcode') {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err) {
            req.flash("error", err.message);
            return res.redirect("register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpHood, " + user.username);
            res.redirect("/neighborhoods");
        });
    });
});

//show login form
router.get("/login", function(req, res){
    res.render("login", {page: 'login'});
});

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/neighborhoods",
        failureRedirect: "/login"
    }), function(req, res){   
});

//logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Successfully Logged Out");
    res.redirect("/neighborhoods");
});

module.exports = router;