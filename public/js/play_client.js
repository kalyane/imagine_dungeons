import Experience from '../Experience/Experience.js'

var ready = document.getElementById("ready");
ready.innerHTML = false

var size_x = document.getElementsByClassName("play_game")[0].getAttributeNode("size_x").value;
var size_z = document.getElementsByClassName("play_game")[0].getAttributeNode("size_z").value;

var near = document.getElementsByClassName("play_game")[0].getAttributeNode("near").value;
var far = document.getElementsByClassName("play_game")[0].getAttributeNode("far").value;

const experience = new Experience(document.querySelector('canvas#playCanvas'), {'x': size_x*2,'z': size_z*2}, {'near': near, 'far': far} , true)

window.experience = experience;

// get model that were saved in the database
var id_game = document.getElementsByClassName("play_game")[0].getAttributeNode("id_game").value;

// includes all assets from the database into the experience

experience.world.on('ready', () => {
    addAllAssets()
    ready.innerHTML = true
    experience.startPlaying()
});

function addAllAssets(){
    var assets = window.assets
    console.log(assets)
    for (var i = 0; i < assets.length; i++){
        
        experience.world.addModel(assets[i].asset_name, assets[i].unique_name);
        var curr_asset = experience.world.dictModels[assets[i].unique_name]
        curr_asset.modelDragBox.position.x = assets[i].position_x
        curr_asset.modelDragBox.position.z = assets[i].position_z
        curr_asset.modelDragBox.quaternion.y = assets[i].quaternion_y
        curr_asset.modelDragBox.quaternion.w = assets[i].quaternion_w
        if (curr_asset.life){
            curr_asset.life = assets[i].life
        }
        if (curr_asset.strength){
            curr_asset.strength = assets[i].strength
        }
        if (curr_asset.attack_range){
            curr_asset.attack_range = assets[i].attack_range
        }
        if (curr_asset.attack_weapon){
            curr_asset.attack_weapon = assets[i].attack_weapon
        }
        if (curr_asset.defense_weapon){
            curr_asset.defense_weapon = assets[i].defense_weapon
        }        
    }
}