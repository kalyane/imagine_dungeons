const express = require('express');
const Game = require('../../dbmodels/Game');
const passport = require('passport');
const Asset = require('../../dbmodels/Asset');

require('./jwt_strategy');

let router = express.Router();

router
    .route("/")
    .get(passport.authenticate('jwt', { session: false, failureRedirect: '/login' }), async (req, res) => {
        const games = await Game.find({ user: req.user._id }).populate("user", "name");
        res.render('games', {name: 'games', user: req.user, games: games});
    });

router
    .route("/:id_game")
    .get(async (request, response) => {
        const id_game = request.params.id_game;
        try {
            const game = await Game.findOne({_id: id_game});
            response.send(game);
        } catch (error) {
            throw error;
        }
    })

router
    .route("/create")
    .get(passport.authenticate('jwt', { session: false, failureRedirect: '/login' }), async (req, res) => {
        const game = new Game({ user: req.user._id, size_x: 50, size_z: 50, near: 10, far: 50 });
        await game.save();
        res.redirect(`/games/edit/${game._id}`);
    });

router
    .route("/edit/:id_game")
    .get(async (req, res)=>{
        // TODO: make sure only user -----
        var id_game = req.params.id_game;
        try {
            const game = await Game.findOne({ _id: id_game});
            if (game) {
                res.render('edit_game', {game: game});
            } else {
                res.redirect('/login')
            }
        } catch (error) {
            res.redirect('/404')
        }
    });

router
    .route("/play/:id_game")
    .get(async (req, res)=>{
        //anyone can play the game
        var id_game = req.params.id_game;
        try {
            const game = await Game.findOne({ _id: id_game });
        if (game) {
            const assets = await Asset.find({game: id_game}, {_id:0, game: 0});
            res.render('play_game', {game: game, assets: assets});
        }
        } catch (error) {
            res.redirect('/404')
        }
    });

router
    .route("/delete/:id_game")
    .get(passport.authenticate('jwt', { session: false, failureRedirect: '/login' }), async (req, res) => {
        try {
            const game = await Game.findOneAndDelete({ _id: req.params.id_game, user: req.user._id });
            if (!game) {
                throw new Error("Game not found or you do not have permission to delete this game");
            }
            res.redirect('/games');
        } catch (error) {
            res.redirect('/404')
        }
    });

router
    .route("/update/:id_game")
    .post(passport.authenticate('jwt', { session: false, failureRedirect: '/login' }), async (req, res)=>{
        var id_game = req.params.id_game;
        var name = req.body.name;
        var size_x = req.body.size_x
        var size_z = req.body.size_z
        var near = req.body.near
        var far = req.body.far
        try {
            await Game.findOneAndUpdate({ _id: id_game }, { name: name, size_x: size_x, size_z: size_z, near: near, far: far });
            res.status(200).send({message: "Game updated successfully"})
        } catch (error) {
            res.redirect('/404')
        }
    });

module.exports = router;