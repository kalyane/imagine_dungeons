const express = require('express');
const Game = require('../../dbmodels/Game');
const connectEnsureLogin = require('connect-ensure-login'); //authorization
// app.get('/dashboard', connectEnsureLogin.ensureLoggedIn(), (req, res) => {

let router = express.Router();

// TODO: guarantee only the owner can access edit pages

router
    .route("/")
    .get(connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
        const games = await Game.find({ user: request.user._id }).populate("user", "name");
        response.render('games', {user: request.user, games: games});
    });

router
    .route("/create")
    .get(connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
        const game = new Game({ user: request.user._id, size_x: 50, size_z: 50 });
        await game.save();
        response.redirect(`/games/edit/${game._id}`);
    });

router
    .route("/edit/:id_game")
    .get(async (request, response)=>{
        // TODO: make sure only user -----
        var id_game = request.params.id_game;
        try {
            const game = await Game.findOne({ _id: id_game});
            if (game) {
                response.render('edit_game', {game: game});
            } else {
                response.redirect('/login')
            }
        } catch (error) {
            response.render('404');
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
            response.render('404');
        }
    });

router
    .route("/delete/:id_game")
    .get(connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
        console.log("here")
        try {
            const game = await Game.findOneAndDelete({ _id: request.params.id_game, user: request.user._id });
            if (!game) {
                throw new Error("Game not found or you do not have permission to delete this game");
            }
            response.redirect('/games');
        } catch (error) {
            response.render('404');
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
            response.status(200).send({message: "Game updated successfully"})
        } catch (error) {
            response.render('404');
        }
    });

module.exports = router;