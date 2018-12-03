
var express = require('express');
var bodyParser= require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorites');
var Verify = require('./verify');

var favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')

.all(Verify.verifyOrdinaryUser)

.get(function (req, res, next) {
    Favorites.find({postedBy: req.decoded._doc._id})
        .populate('postedBy')
        .populate('dishes')
        .exec(function (err, favorite) {
        if (err) throw err;
        res.json(favorite);
    });
})

.post(function (req, res, next) {
   Favorites.findOneAndUpdate(
       {postedBy : req.decoded._doc._id},
       {$addToSet: {dishes: req.body} },
       {upsert:true, new:true} , function (err, favorite) {
           if (err) throw err;
           console.log('You added a dish to your favorites!');
           res.json(favorite);
      });
})

.delete(function (req, res, next) {

    Favorites.remove({}, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });

    // Favorites.findOneAndRemove({
    //         postedBy: req.decoded._doc._id,
    //     }).exec(function (err, favorites) {
    //         if (err) throw err;
    //         res.json(favorites);
    // });

});

favoriteRouter.route('/:dishObjectId')
.all(Verify.verifyOrdinaryUser)

.delete(function (req, res, next) {

  Favorites.findOneAndUpdate(
      {postedBy : req.decoded._doc._id},
      {$pull: {dishes:req.params.dishObjectId} },
      {upsert:true, new:true} , function (err, favorite) {
          if (err) throw err;
          console.log('You removed a dish from your favorites!');
          res.json(favorite);
     });



});

module.exports = favoriteRouter;
