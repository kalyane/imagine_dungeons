import Experience from './Experience/Experience.js'

var size_x = document.getElementsByClassName("play_game")[0].getAttributeNode("size_x").value;
var size_z = document.getElementsByClassName("play_game")[0].getAttributeNode("size_z").value;

const experience = new Experience(document.querySelector('canvas#editCanvas'), {'x': size_x*2,'z': size_z*2} , true)

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
            experience.world.addModel(assets[i].asset.name, assets[i].name);
            let object = experience.world.dictModels[assets[i].name].modelDragBox
            object.position.x = assets[i].position_x
            object.position.z = assets[i].position_z

            
            object.quaternion.y = assets[i].quaternion_y
            object.quaternion.w = assets[i].quaternion_w

            /*
            var quaternion = new THREE.Quaternion(0, assets[i].quaternion_y, 0, assets[i].quaternion_w);
            var euler = new THREE.Euler().setFromQuaternion(quaternion, 'YZX');
            
            object.rotateY(euler.y);*/
        }

        experience.startPlaying()
    });
});