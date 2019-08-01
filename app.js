var express      = require("express"),
    app          = express(),
    bodyParser   = require("body-parser"),
    mongoose     = require("mongoose"),
    flash        = require("connect-flash"),
    passport     = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Neighborhood = require("./models/neighborhood"),
    Comment      = require("./models/comment"),
    User         = require("./models/user"),
    seedDB       = require("./seeds");

//requiring routes
var commentRoutes = require("./routes/comments"),
    reviewRoutes = require("./routes/reviews"),
    neighborhoodRoutes = require("./routes/neighborhoods"),
    indexRoutes = require("./routes/index");

mongoose.connect("mongodb://localhost:27017/yelp_hood", {useNewUrlParser: true});
mongoose.set("useFindAndModify", false);
app.use(bodyParser.urlencoded({extended : true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment");
// seedDB();

//Passport Configuration

app.use(require("express-session")({
    secret: "All guinea piggies are good guinea piggies!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/neighborhoods/:id/comments", commentRoutes);
app.use("/neighborhoods", neighborhoodRoutes);
app.use("/neighborhoods/:id/reviews", reviewRoutes);

app.listen(3000, function(){
    console.log("YelpHood App has started!");
});