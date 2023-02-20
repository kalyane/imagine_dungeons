import Experience from '../Experience/Experience.js'
import MessageHandler from "./MessageHandler";

var message_handler = new MessageHandler()

const experience = new Experience(document.querySelector('canvas#editCanvas'))

window.experience = experience;

let assets = null;
var id_game = document.getElementsByClassName("edit_game")[0].getAttributeNode("id_game").value;

var weapon_attack = []
var weapon_defense = []

// grid size configuration
var size_x = document.getElementById('size_x');
var size_z = document.getElementById('size_z');

size_x.addEventListener('change', (event) => {
    updateGridSize()
})

size_z.addEventListener('change', (event) => {
    updateGridSize()
})

var url = "/assets/" + id_game
fetch(url).then(function (response){
    return response.json();
}).then(function (resolvedValue){
    assets = resolvedValue;
    setExperienceAttributes();
});

function setExperienceAttributes(){
    experience.setAttributes(assets)
    
    experience.world.on('ready', async () => {
        experience.reset()
        updateAddedAssets()
        updateGridSize()
        addAllModels()

        experience.trigger("ready");
    });

    // keep listening to when an asset is being transformed
    experience.world.on('start_transform', () => {
        selectAssetCard()
    });

    // when no asset is being transformed
    experience.world.on('stop_transform', () => {
        unselect()
    });
}

function addAllModels(){
    // gets all possible assets to use and add to edit page
    for (var key in experience.world.modelClasses){
        let asset = experience.world.modelClasses[key];
        let container = document.getElementById(asset.type);

        let div = document.createElement('div');
        div.classList.add('asset_card');
        div.setAttribute("model", asset.asset_name);

        let divCont = document.createElement('div');

        let divAdd = document.createElement('div');
        divAdd.classList.add('add');
        let divAddCont = document.createElement('div');
        let insideDiv = document.createElement('div');
        let icon = document.createElement('i');
        icon.classList.add('fa-solid');
        icon.classList.add('fa-plus');
        insideDiv.appendChild(icon);
        insideDiv.appendChild(document.createElement("br"));
        let addText = document.createTextNode("Click to Add");
        insideDiv.appendChild(addText);
        divAddCont.appendChild(insideDiv);
        divAdd.appendChild(divAddCont);
        divCont.appendChild(divAdd);

        let img = document.createElement('img');
        img.src = "/static/images/models/"+asset.type+"/"+asset.asset_name+".png";
        divCont.appendChild(img);

        let text = document.createTextNode(asset.asset_name);
        divCont.appendChild(text);

        div.appendChild(divCont);
        container.appendChild(div);

        div.addEventListener("click", function() {
            const asset_name = this.getAttributeNode("model").value;
            experience.world.addModel(asset_name);
            updateAddedAssets()
            experience.world.transformControls.detach();
            experience.world.transformControls.attach(experience.world.assets[experience.world.assets.length - 1].modelDragBox);
            for (var key in experience.world.dictModels){
                experience.world.dictModels[key].boxHelper.visible = false
            }
            experience.world.assets[experience.world.assets.length - 1].boxHelper.visible = true
            selectAssetCard()
        });
    }
}



function updateGridSize(){
    experience.world.gridSize.x = size_x.value * 2;
    experience.world.gridSize.z = size_z.value * 2;
    experience.world.floor.floorMesh.scale.set(experience.world.gridSize.x, experience.world.gridSize.z, 1);
    experience.world.floor.floorTexture.repeat.set(experience.world.gridSize.x/2, experience.world.gridSize.z/2);
}

var life = document.getElementById('life');
var strength = document.getElementById('strength');
var attack_range = document.getElementById('attack_range');
var attack = document.getElementById('attack');
var defense = document.getElementById('defense');

life.addEventListener('change', (event) => {
    var unique_name = document.getElementById('asset_name').value;
    experience.world.dictModels[unique_name].life = life.value;
})

strength.addEventListener('change', (event) => {
    var unique_name = document.getElementById('asset_name').value;
    experience.world.dictModels[unique_name].strength = strength.value;
})

attack_range.addEventListener('change', (event) => {
    var unique_name = document.getElementById('asset_name').value;
    experience.world.dictModels[unique_name].attack_range = attack_range.value;
})

attack.addEventListener('change', (event) => {
    var unique_name = document.getElementById('asset_name').value;
    experience.world.dictModels[unique_name].attack_weapon = attack.value;
})

defense.addEventListener('change', (event) => {
    var unique_name = document.getElementById('asset_name').value;
    experience.world.dictModels[unique_name].defense_weapon = defense.value;
})


function selectAssetCard(){
    // select only the object being transformed
    var added_assets = document.getElementsByClassName("added_asset");

    var unique_name = experience.world.transformControls.object.userData;

    // adds the border to the asset selected
    for (let i = 0; i < added_assets.length; i++) {
        if (added_assets[i].textContent == unique_name){
            added_assets[i].classList.add('border');
        }else{
            added_assets[i].classList.remove('border');
        }
    }

    // show asset settings

    // get instance of asset
    var selected_asset = experience.world.dictModels[unique_name]

    // show image and asset unique name
    document.getElementsByClassName("selected")[0].removeAttribute("hidden");
    document.getElementById('asset_name').value = selected_asset.unique_name;
    document.getElementById('selected_img').setAttribute('src',"/static/images/models/"+selected_asset.constructor.type+"/"+selected_asset.constructor.asset_name+".png");

    // check if asset has life
    if ('life' in selected_asset){
        // make life visible
        document.getElementsByClassName("properties_life")[0].removeAttribute("hidden");
        // include current value of life to asset
        document.getElementById('life').value = selected_asset.life;
    }

    // check if asset has strength
    if ('strength' in selected_asset){
        // make strength visible
        document.getElementsByClassName("properties_strength")[0].removeAttribute("hidden");
        // include current value of strength to asset
        document.getElementById('strength').value = selected_asset.strength;
    }

    if ('attack_range' in selected_asset){
        document.getElementsByClassName("properties_attack_range")[0].removeAttribute("hidden");
        document.getElementById('attack_range').value = selected_asset.attack_range;
    }

    if ('attack_weapon' in selected_asset){
        // make strength visible
        document.getElementsByClassName("properties_attack")[0].removeAttribute("hidden");
        // include current value of strength to asset
        var select = document.getElementById('attack');
        select.innerHTML = "";
        for (var i=0; i<weapon_attack.length; i++){
            var option = document.createElement('option');
            option.value = weapon_attack[i]
            option.innerHTML = weapon_attack[i];
            if(weapon_attack[i] == selected_asset.attack_weapon){
                option.selected = true;
            }
            select.appendChild(option);
        }
        experience.world.dictModels[unique_name].attack_weapon = select.value;
    }

    if ('defense_weapon' in selected_asset){
        // make strength visible
        document.getElementsByClassName("properties_defense")[0].removeAttribute("hidden");
        // include current value of strength to asset
        var select = document.getElementById('defense')
        select.innerHTML = "";
        for (var i=0; i<weapon_defense.length; i++){
            var option = document.createElement('option');
            option.value = weapon_defense[i]
            option.innerHTML = weapon_defense[i];
            if(weapon_defense[i] == selected_asset.defense_weapon){
                option.selected = true;
            }
            select.appendChild(option);
        }
        experience.world.dictModels[unique_name].defense_weapon = select.value;
    }
}

function unselect(){
    // deselect all assets
    var added_assets = document.getElementsByClassName("added_asset");
    for (let i = 0; i < added_assets.length; i++) {
        added_assets[i].classList.remove('border');
    }

    // hide asset settings
    document.getElementsByClassName("selected")[0].setAttribute("hidden", true);
    document.getElementsByClassName("properties_life")[0].setAttribute("hidden", true);
    document.getElementsByClassName("properties_strength")[0].setAttribute("hidden", true);
    document.getElementsByClassName("properties_attack_range")[0].setAttribute("hidden", true);
    document.getElementsByClassName("properties_attack")[0].setAttribute("hidden", true);
    document.getElementsByClassName("properties_defense")[0].setAttribute("hidden", true);
}



// update the asset cards in the project to be the same as in the game
function updateAddedAssets(){
    // added assets container
    const addedAssetsCont = document.getElementsByClassName("added_assets")[0];
    // remove all cards from the container
    addedAssetsCont.innerHTML = ""

    // get all assets in the game
    const models = experience.world.assets

    weapon_attack = []
    weapon_defense = []
  
    // create card for each game asset
    for (let i = 0; i < models.length; i++) {
        let model = models[i];
        let div = document.createElement('div');
        div.classList.add('added_asset');
        div.setAttribute("pos", i)

        let divCont = document.createElement('div');
        let img = document.createElement('img');
        img.src = "/static/images/models/"+model.constructor.type+"/"+model.constructor.asset_name+".png"
        divCont.appendChild(img)
        let text = document.createTextNode(model.unique_name);
        divCont.appendChild(text);
        let divDel = document.createElement('div');
        divDel.classList.add('asset_delete');
        let icon = document.createElement('i');
        icon.classList.add("fa-solid");
        icon.classList.add("fa-trash-can");
        divDel.appendChild(icon);
        divCont.appendChild(divDel);
        div.appendChild(divCont);
        addedAssetsCont.appendChild(div);

        if (experience.world.dictModels[model.unique_name].attack){
            weapon_attack.push(model.unique_name)
        } else if (experience.world.dictModels[model.unique_name].defense){
            weapon_defense.push(model.unique_name)
        }

        // 
        divCont.addEventListener("click", () => {

            for (var key in experience.world.dictModels){
                experience.world.dictModels[key].boxHelper.visible = false
            }

            experience.world.dictModels[model.unique_name].boxHelper.visible = true

            // detach the previous object
            experience.world.transformControls.detach();
            // attach the newly selected object
            experience.world.transformControls.attach(experience.world.dictModels[model.unique_name].modelDragBox);

            selectAssetCard()
        })

        // watch when the delete button is clicked
        divDel.addEventListener("click", function(){
            experience.world.transformControls.detach();
            experience.world.deleteModel(model.unique_name);
            updateAddedAssets()
        })
    }
}

document.getElementById("play").addEventListener("click", function() {
    saveGameDetails()
    saveAssets()

    window.location = "/games/play/"+id_game;
});

// when save button is clicked
document.getElementById("save").addEventListener("click", function() {
    saveGameDetails()
    saveAssets()
});

// save only game general details
function saveGameDetails(){
    const input = document.getElementById('game_name');
    var near = document.getElementById('near');
    var far = document.getElementById('far');

    let data = {
        name: input.value,
        size_x: size_x.value,
        size_z: size_z.value,
        near: near.value,
        far: far.value
    };

    // send request
    fetch("/games/update/"+id_game, {
        method: "POST",
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(data)
    }).then(function(response) {
        return response.json();
    }).then(function(data_json) {
        message_handler.addMessage(data_json.message)
        message_handler.showMessages()
    }).catch(function(error) {
        console.error(error);
    });
}

// save all game assets in database
function saveAssets(){
    const assets = experience.world.assets;

    // creates an array with all the assets data
    var data = []
    for (var i = 0; i < assets.length; i++){
        let assetData = {
            unique_name: assets[i].unique_name,
            asset_name: assets[i].constructor.asset_name,
            position_x: assets[i].model.position.x,
            position_z: assets[i].model.position.z,
            quaternion_y: assets[i].model.quaternion.y,
            quaternion_w: assets[i].model.quaternion.w,
            life: (assets[i].life) ? assets[i].life  : 0,
            strength: (assets[i].strength) ? assets[i].strength  : 0,
            attack_range: (assets[i].attack_range) ? assets[i].attack_range  : 0,
            attack_weapon: (assets[i].attack_weapon) ? assets[i].attack_weapon  : "",
            defense_weapon: (assets[i].defense_weapon) ? assets[i].defense_weapon  : "",
        };
        data.push(assetData)
    }

    // send request
    fetch("/assets/"+id_game, {
        method: "POST",
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({assets: data})
    }).then(function(response) {
        return response.json();
    }).then(function(data_json) {
        message_handler.addMessage(data_json.message)
        message_handler.showMessages()
    }).catch(function(error) {
        console.error(error);
    });
}