var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
// automatically require the directory of middleware
var middleware = require("../middleware");

// INDEX - show all campgrounds
// adding campgrounds page that lists all the campgrounds
router.get("/", function(req, res) {
    // get all campgrounds from db
    Campground.find({}, function(err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
});

// CREATE - add new campground to DB
// post routes
router.post("/", middleware.isLoggedIn, function(req, res) {
    // get data from form
    var name = req.body.name;
    var image = req.body.image;
    var price = req.body.price;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    // add to campgrounds array
    var newCampground = {name: name, price: price, image: image, description: desc, author: author};
    // create a new campground and save it to db
    Campground.create(newCampground, function(err, newlyCreated) {
        if (err) {
            console.log(err);     
        } else {
             // redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

// NEW - show form to create new campground
// new routes showing the form
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res) {
    // find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            // render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    // find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
        if (err) {
            res.redirect(":/campgrounds");
        } else {
            // redirect somewhere
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership,function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Campground deleted!");
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;