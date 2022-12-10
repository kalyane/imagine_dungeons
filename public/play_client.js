import Experience from './Experience/Experience.js'

const experience = new Experience(document.querySelector('canvas#editCanvas'), true)

window.experience = experience;

// get model that were saved in the database
var id_game = document.getElementsByClassName("play_game")[0].getAttributeNode("id_game").value;

var url = "/assets/" + id_game

// includes all assets from the database into the experience
experience.world.on('ready', () => {
    fetch(url).then(function(response) {
        return response.json();
    }).then(function(assets) {
        for (var i = 0; i < assets.length; i++){
            experience.world.addModel(assets[i].asset_name, assets[i].name);
            experience.world.dictModels[assets[i].name].modelDragBox.position.x = assets[i].position_x
            experience.world.dictModels[assets[i].name].modelDragBox.position.z = assets[i].position_z
            experience.world.dictModels[assets[i].name].modelDragBox.rotation.y = assets[i].rotation_y
        }

        experience.startPlaying()
    });
});

