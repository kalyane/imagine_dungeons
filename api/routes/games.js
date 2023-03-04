const express = require('express');
const Game = require('../../dbmodels/Game');
const Asset = require('../../dbmodels/Asset');
const Agent = require('../../dbmodels/Agent');

let router = express.Router();

// set all games routes
router
    .route("/")
    // show all games
    .get(async (req, res) => {
        try {
            const games = await Game.find({ user: req.user._id }).populate("user", "name");
            res.render('games', {name: 'games', user: req.user, games: games});
        } catch (error) {
            res.status(500).send({message: { text: error, type: "error"}})
        }
    })
    // create a new game
    .post(async (req, res) => {
        const game = new Game({ user: req.user._id });
        try {
            await game.save();
            res.redirect(`/games/edit/${game._id}`);
        } catch (error) {
            res.status(500).send({message: { text: error, type: "error"}})
        }
    });

router
    .route("/:id_game")
    // send game information
    .get(async (req, res) => {
        const id_game = req.params.id_game;
        try {
            const game = await Game.findOne({ _id: id_game, user: req.user._id});
            if (!game) {
                // guarantees only the user can see this page
                return res.status(403).send({message: { text: "Game not found or you do not have permission to get this game", type: "error"}})
            }
            return res.status(200).send(game);
        } catch (error) {
            res.status(500).send({message: { text: error, type: "error"}})
        }
    })
    // update game information
    .put(async (req, res)=>{
        // get game information from the request body
        var id_game = req.params.id_game;
        var name = req.body.name;
        var size_x = req.body.size_x
        var size_z = req.body.size_z
        var near = req.body.near
        var far = req.body.far

        try {
            const game = await Game.findOneAndUpdate({ _id: id_game, user: req.user._id  }, { name: name, size_x: size_x, size_z: size_z, near: near, far: far });
            if (!game) {
                // guarantees only the owner can update a game
                return res.status(403).send({message: { text: "Game not found or you do not have permission to update this game", type: "error"}})
            }
            return res.status(200).send({message: { text: "Game settings updated successfully", type: "success"}})
        } catch (error) {
            res.status(500).send({message: { text: error, type: "error"}})
        }
    })
    // delete a game
    .delete(async (req, res) => {
        try {
            const game = await Game.findOneAndDelete({ _id: req.params.id_game, user: req.user._id });
            if (!game) {
                // guarantees only the owner can delete a game
                return res.status(403).send({message: { text: "Game not found or you do not have permission to delete this game", type: "error"}})
            }
            await Asset.deleteMany({ game: game._id });
            return res.status(200).send({message: { text: "Game deleted successfully", type: "success"}})
        } catch (error) {
            res.status(500).send({message: { text: error, type: "error"}})
        }
    });

router
    .route("/edit/:id_game")
    // shows edit page for a game
    .get(async (req, res)=>{
        var id_game = req.params.id_game;
        try {
            const game = await Game.findOne({ _id: id_game, user: req.user._id});
            if (!game) {
                // guarantees only the owner can see this page
                return res.status(403).send({message: { text: "Game not found or you do not have permission to edit this game", type: "error"}})
            } 
            return res.render('edit_game', {game: game, user:req.user});
        } catch (error) {
            res.status(500).send({message: { text: error, type: "error"}})
        }
    });

router
    .route("/play/:id_game")
    // shows play page for a game
    .get(async (req, res)=>{
        var id_game = req.params.id_game;
        try {
            const agents = await Agent.find({ user: req.user._id });
            const game = await Game.findOne({ _id: id_game, user: req.user._id});
            if (!game) {
                // guarantees only the owner can see this page
                return res.status(403).send({message: { text: "Game not found or you do not have permission to play this game", type: "error"}})
            }
            // get all assets from this game and remove the _id and game fields from the results
            const assets = await Asset.find({game: id_game}, {_id:0, game: 0});
            
            return res.render('play_game', {game: game, assets: assets, user:req.user, agents:agents});
        } catch (error) {
            res.status(500).send({message: { text: error, type: "error"}})
        }
    });

module.exports = router;