const express = require('express');

let router = express.Router();
const Asset = require('../../dbmodels/Asset');

router
    .route("/:id_game")
    .get(async (request, response) => {
        const id_game = request.params.id_game;
        try {
            const assets = await Asset.find({game: id_game});
            response.send(assets);
        } catch (error) {
            throw error;
        }
    })
    .post(async (request, response)=>{
        let id_game = request.params.id_game;
        let assets = request.body.assets;


        // create a set of asset names from the request
        let assetNames = new Set(assets.map(asset => asset.unique_name));

        // find all assets with the given game ID
        let existingAssets = await Asset.find({game: id_game});

        // filter out the assets that are not present in the request
        let assetsToDelete = existingAssets.filter(existingAsset => !assetNames.has(existingAsset.unique_name));

        // delete the filtered assets
        for (let asset of assetsToDelete) {
            await Asset.deleteOne({_id: asset._id});
        }

        for (var i=0; i < assets.length; i++){
            let unique_name = request.body.assets[i].unique_name;
            let asset_name = request.body.assets[i].asset_name;
            let type = request.body.assets[i].type;
            let position_x = request.body.assets[i].position_x;
            let position_z = request.body.assets[i].position_z;
            let quaternion_y = request.body.assets[i].quaternion_y;
            let quaternion_w = request.body.assets[i].quaternion_w;
            
            let life = request.body.assets[i].life;
            let strength = request.body.assets[i].strength;
            let attack_weapon = request.body.assets[i].attack_weapon;
            let defense_weapon = request.body.assets[i].defense_weapon;
            var id_asset;

            try {
                // check if the asset is already in the database
                const existingAsset = await Asset.findOne({game: id_game, unique_name: unique_name});
                if (existingAsset) {
                    // update existing asset
                    existingAsset.position_x = position_x;
                    existingAsset.position_z = position_z;
                    existingAsset.quaternion_y = quaternion_y;
                    existingAsset.quaternion_w = quaternion_w;
                    existingAsset.life = life;
                    existingAsset.strength = strength;
                    existingAsset.attack_weapon = attack_weapon;
                    existingAsset.defense_weapon = defense_weapon;
                    await existingAsset.save();
                } else {
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
                        defense_weapon: defense_weapon
                    });
                    await newAsset.save();
                }
                response.end();
            } catch (error) {
                throw error;
            }
        }
    });
    
    

module.exports = router;