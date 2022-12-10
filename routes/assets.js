const express = require('express');

let router = express.Router();
var mysqlConnection = require('../database').databaseConnection;

router
    .route("/:id_game")
    .get((request, response)=>{
        var id_game = request.params.id_game;
        mysqlConnection.query('SELECT game_assets.*, assets.name as asset_name FROM game_assets INNER JOIN assets ON game_assets.id_asset=assets.id_asset WHERE id_game = ?', [id_game], function(error, results, fields) {
            if (error) throw error;
            else{
                response.send(results);
            }
        })
    })
    .post((request, response)=>{
        let id_game = request.params.id_game;
        let assets = request.body.assets;

        for (var i=0; i < assets.length; i++){
            let position_x = request.body.assets[i].position_x;
            let position_z = request.body.assets[i].position_z;
            let rotation_y = request.body.assets[i].rotation_y;
            let name = request.body.assets[i].name;
            let model_name = request.body.assets[i].model_name;
            var id_asset;

            // get the id_asset
            mysqlConnection.query('SELECT id_asset FROM assets WHERE name = ?', [model_name], function(error, results, fields) {
                if (error) throw error;
                else{
                    id_asset = results[0].id_asset
                }
            })

            // check if the asset is already in the database
            mysqlConnection.query('SELECT * FROM game_assets WHERE id_game = ? and name = ?', [id_game, name], function(error, results, fields) {
                if (error) throw error;
                // update existing asset
                if (results.length == 1){
                    mysqlConnection.query('UPDATE game_assets SET position_x = ?, position_z = ?, rotation_y = ? WHERE id_game = ? and name = ?', 
                    [position_x, position_z, rotation_y, id_game, name], function(error2, results2, fields2) {
                        if (error) throw error;
                    })
                }
                else{
                    mysqlConnection.query('INSERT INTO game_assets (`name`,`id_asset`, `id_game`, `position_x`, `position_z`,`rotation_y`) VALUES (?, ?, ?, ?, ?, ?)', 
                    [name, id_asset, id_game, position_x, position_z,rotation_y], function(error2, results2, fields2) {
                        if (error) throw error;
                    })
                }
            })

            response.end();
        }
        
    });
    

module.exports = router;