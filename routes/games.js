const express = require('express');

let router = express.Router();
var mysqlConnection = require('../database').databaseConnection;

router
    .route("/")
    .get((request, response)=>{
        if (request.session.loggedin){
            mysqlConnection.query('SELECT * FROM games WHERE id_user = ?', [request.session.id_user], function(error, results, fields) {
                if (error) throw error;
                else{
                    response.render('games', {session: request.session, games: results});
                }
            })
        }
        else response.redirect('/login')
    });

router
    .route("/create")
    .get((req, res)=>{
        if (request.session.loggedin){
            var sql = "INSERT INTO games (`id_user`) VALUES (?);"
            mysqlConnection.query(sql, [request.session.id_user], (err, res, fields) => {
                if (err) throw err;
                else{
                    mysqlConnection.query('SELECT * FROM game WHERE id_user = ? ORDER BY `date_created` DESC LIMIT 1', [request.session.id_user], function(suberr, subres, subfields) {
                        if (suberr) throw suberr;
                        else{
                            response.redirect('/edit/game/'+subres[0].id_game)
                        }
                    })
                }
            })
        }
        else response.redirect('/login')
    });

router
    .route("/edit/:id_game")
    .get((request, response)=>{
        // when production ask for LOGGED IN ************ id_user = request.session.id_user
        var id_game = request.params.id_game;
        mysqlConnection.query('SELECT * FROM games WHERE id_game = ? and id_user = ?', [id_game, 1], function(error, results, fields) {
            if (error) throw error;
            if (results.length > 0){
                mysqlConnection.query('SELECT * FROM assets', [], function(error2, results2, fields2) {
                    response.render('edit_game', {game: results[0], assets: results2});
                })
            }else{
                response.redirect('/login')
            }
        })
    });

router
    .route("/play/:id_game")
    .get((request, response)=>{
        //anyone can play the game
        var id_game = request.params.id_game;
        mysqlConnection.query('SELECT * FROM games WHERE id_game = ?', [id_game], function(error, results, fields) {
            if (error) throw error;
            else{
                response.render('play_game', {game: results[0]});
            }
        })
    });

router
    .route("/delete/:id_game")
    .get((request, response)=>{
        if (request.session.loggedin){
            var id_game = request.params.id_game;
            mysqlConnection.query('DELETE FROM games WHERE id_game = ? and id_user = ?', [id_game, request.session.id_user], function(error, results, fields) {
                if (error) throw error;
                response.redirect('/games');
            })
        }
        else response.redirect('/login')
    });

router
    .route("/update/:id_game")
    .post((request, response)=>{
        var id_game = request.params.id_game;
        var name = request.body.name
        mysqlConnection.query('UPDATE games SET name = ? WHERE id_game = ?', [name, id_game], function(error, results, fields) {
            if (error) throw error;
        })
    });

module.exports = router;