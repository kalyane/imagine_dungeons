const express = require('express');
const Game = require('../dbmodels/Game');
const Asset = require('../dbmodels/Asset');

let router = express.Router();

// TODO: guarantee only the owner can access edit pages

router
    .route("/")
    .get(async (request, response) => {
        try {
            if (request.session.loggedin) {
                const games = await Game.find({ user: request.session.id_user }).populate("user", "name");
                response.render('games', {session: request.session, games: games});
            } else {
                response.redirect('/login');
            }
        } catch (error) {
            response.send(error);
        }
    });

router
    .route("/create")
    .get(async (request, response) => {
        if (request.session.loggedin) {
            const game = new Game({ user: request.session.id_user, size_x: 50, size_z: 50 });
            await game.save();
            response.redirect(`/games/edit/${game._id}`);
        } else {
            response.redirect('/login');
        }
    });

router
    .route("/edit/:id_game")
    .get(async (request, response)=>{
        // make sure only user
        /*
        if (request.session.loggedin){
            var id_user = request.session.id_user
            var id_game = request.params.id_game;
            try {
                const game = await Game.findOne({ _id: id_game, user: id_user });
                if (game) {
                    const assets = await Asset.find({});
                    response.render('edit_game', {game: game, assets: assets});
                } else {
                    response.redirect('/login')
                }
            } catch (error) {
                throw error;
            }
        }
        else response.redirect('/login')
        */
        var id_game = request.params.id_game;
        try {
            const game = await Game.findOne({ _id: id_game});
            if (game) {
                const assets = await Asset.find({});
                response.render('edit_game', {game: game, assets: assets});
            } else {
                response.redirect('/login')
            }
        } catch (error) {
            throw error;
        }
    });

router
    .route("/play/:id_game")
    .get(async (request, response)=>{
        //anyone can play the game
        var id_game = request.params.id_game;
        try {
            const game = await Game.findOne({ _id: id_game });
        if (game) {
            response.render('play_game', {game: game});
        }
        } catch (error) {
            throw error;
        }
    });

router
    .route("/delete/:id_game")
    .get(async (request, response) => {
        if (request.session.loggedin) {
            try {
                const game = await Game.findOneAndDelete({ _id: request.params.id_game, user: request.session.id_user });
                if (!game) {
                    throw new Error("Game not found or you do not have permission to delete this game");
                }
                response.redirect('/games');
            } catch (error) {
                response.render('error', { error });
            }
        } else {
            response.redirect('/login');
        }
    });

router
    .route("/update/:id_game")
    .post(async (request, response)=>{
        var id_game = request.params.id_game;
        var name = request.body.name;
        var size_x = request.body.size_x
        var size_z = request.body.size_z
        try {
            await Game.findOneAndUpdate({ _id: id_game }, { name: name, size_x: size_x, size_z: size_z });
        } catch (error) {
            throw error;
        }
    });

module.exports = router;