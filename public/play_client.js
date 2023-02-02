import Experience from './Experience/Experience.js'

var ready = document.getElementById("ready");
ready.innerHTML = false

var size_x = document.getElementsByClassName("play_game")[0].getAttributeNode("size_x").value;
var size_z = document.getElementsByClassName("play_game")[0].getAttributeNode("size_z").value;

const experience = new Experience(document.querySelector('canvas#editCanvas'), {'x': size_x*2,'z': size_z*2} , true)

window.experience = experience;

// get model that were saved in the database
var id_game = document.getElementsByClassName("play_game")[0].getAttributeNode("id_game").value;

var url = "/assets/" + id_game

// includes all assets from the database into the experience

experience.world.on('ready', () => {
    console.log(experience.resources)
    fetch(url).then(function(response) {
        return response.json();
    }).then(function(assets) {
        for (var i = 0; i < assets.length; i++){
            experience.world.addModel(assets[i].asset_name, assets[i].unique_name);
            let object = experience.world.dictModels[assets[i].unique_name].modelDragBox
            object.position.x = assets[i].position_x
            object.position.z = assets[i].position_z
            object.quaternion.y = assets[i].quaternion_y
            object.quaternion.w = assets[i].quaternion_w

        }

        ready.innerHTML = true
        experience.startPlaying()
    });
});