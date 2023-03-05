const express = require('express');

let router = express.Router();
const Asset = require('../../dbmodels/Asset');

router
    .route("/:id_game")
    .get(async (req, res) => {
        const id_game = req.params.id_game;
        try {
            const assets = await Asset.find({game: id_game});
            res.status(200).send(assets);
        } catch (error) {
            res.status(500).send(error);
        }
    })
    .put(async (req, res)=>{
        let id_game = req.params.id_game;
        let assets = req.body.assets;

        try {
            // delete all assets for the game
            await Asset.deleteMany({game: id_game});
            // insert all assets
            for (var i=0; i < assets.length; i++){
                let unique_name = req.body.assets[i].unique_name;
                let asset_name = req.body.assets[i].asset_name;
                let type = req.body.assets[i].type;
                let position_x = req.body.assets[i].position_x;
                let position_z = req.body.assets[i].position_z;
                let quaternion_y = req.body.assets[i].quaternion_y;
                let quaternion_w = req.body.assets[i].quaternion_w;
                
                let life = req.body.assets[i].life;
                let strength = req.body.assets[i].strength;
                let attack_weapon = req.body.assets[i].attack_weapon;
                let defense_weapon = req.body.assets[i].defense_weapon;
                let attack_range = req.body.assets[i].attack_range;
    
                // create new asset
                const newAsset = new Asset({
                    unique_name: unique_name,
                    asset_name: asset_name,
                    type: type,
                    game: id_game,
                    position_x: position_x,
                    position_z: position_z,
                    quaternion_y: quaternion_y,
                    quaternion_w: quaternion_w,
                    life: life,
                    strength: strength,
                    attack_weapon: attack_weapon,
                    defense_weapon: defense_weapon,
                    attack_range: attack_range
                });
                await newAsset.save();
            }

            res.status(200).send({message: { text: "Assets updated successfully", type: "success"}});
        }
        catch (error){
            res.status(500).send({message: { text: error, type: "error"}});
        }
    });
    

module.exports = router;