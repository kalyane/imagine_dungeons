const express = require('express');

let router = express.Router();
const InGameAsset = require('../dbmodels/InGameAsset');
const Asset = require('../dbmodels/Asset');

router
    .route("/:id_game")
    .get(async (request, response) => {
        const id_game = request.params.id_game;
        try {
            const assets = await InGameAsset.find({game: id_game}).populate('asset');
            response.send(assets);
        } catch (error) {
            throw error;
        }
    })
    .post(async (request, response)=>{
        let id_game = request.params.id_game;
        let assets = request.body.assets;


        // create a set of asset names from the request
        let assetNames = new Set(assets.map(asset => asset.name));

        // find all assets with the given game ID
        let existingAssets = await InGameAsset.find({game: id_game});

        // filter out the assets that are not present in the request
        let assetsToDelete = existingAssets.filter(existingAsset => !assetNames.has(existingAsset.name));

        // delete the filtered assets
        for (let asset of assetsToDelete) {
            await InGameAsset.deleteOne({_id: asset._id});
        }

        for (var i=0; i < assets.length; i++){
            let position_x = request.body.assets[i].position_x;
            let position_z = request.body.assets[i].position_z;
            let rotation_y = request.body.assets[i].rotation_y;
            let name = request.body.assets[i].name;
            let model_name = request.body.assets[i].model_name;
            var id_asset;

            try {
                // get the id_asset
                const asset = await Asset.findOne({name: model_name});
                id_asset = asset._id;
            } catch (error) {
                throw error;
            }

            try {
                // check if the asset is already in the database
                const existingAsset = await InGameAsset.findOne({id_game, name});
                if (existingAsset) {
                    // update existing asset
                    existingAsset.position_x = position_x;
                    existingAsset.position_z = position_z;
                    existingAsset.rotation_y = rotation_y;
                    await existingAsset.save();
                } else {
                    // create new asset
                    const newAsset = new InGameAsset({
                        name: name,
                        asset: id_asset,
                        game: id_game,
                        position_x: position_x,
                        position_z: position_z,
                        rotation_y: rotation_y
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