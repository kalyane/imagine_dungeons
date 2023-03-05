import Experience from '../Experience/Experience.js'
import MessageHandler from "./MessageHandler";

var message_handler = new MessageHandler()

const experience = new Experience(document.querySelector('canvas#editCanvas'))
// including experience as global variable for easy access and debuging
window.experience = experience;

// get the game _id
var id_game = document.getElementsByClassName("edit_game")[0].getAttributeNode("id_game").value;

// get all assets saved in the database for this game
let assets = null;
fetch("/assets/" + id_game).then(function (response){
    return response.json();
}).then(function (resolvedValue){
    assets = resolvedValue;
    setExperienceAttributes();
});

function setExperienceAttributes(){
    /**
     * Adds all assets into the new experience instance.
     * Set the game attributes to default.
     * Managers the visual representation of the assets on the screen.
     */

    // only set the assets in the game
    experience.setAttributes(assets)
    
    // when all available models are correctly loaded to the experience
    experience.world.on('ready', async () => {
        // adds assets to experience and set the controls
        experience.reset()
        // update the asset cards on the view project tab
        updateAddedAssets()
        // get the grid size input and update the experience map size
        updateGridSize()
        // add all available assets for user to choose
        addAllModels()

        // informs the view the experience is ready and can stop showing loading screen
        experience.trigger("ready");
    });

    // keep listening to when an asset is being transformed
    experience.world.on('start_transform', () => {
        // select the asset card of the asset being transformed
        selectAssetCard()
    });

    // when no asset is being transformed
    experience.world.on('stop_transform', () => {
        // remove selection of all assets
        unselect()
    });
}

function addAllModels(){
    /**
     * Get all available models in the experience and add to the asset tab
     * for user to add to game
     */
    
    
    for (var key in experience.world.modelClasses){
        // get model from dict of available models in the experience
        let model = experience.world.modelClasses[key];
        // identify which container to add the model card
        let container = document.getElementById(model.type);

        // -- create model card
        let div = document.createElement('div');
        div.classList.add('model_card');
        div.setAttribute("model", model.asset_name);

        // div container
        let divCont = document.createElement('div');

        // div that shows add message
        let divAdd = document.createElement('div');
        divAdd.classList.add('add');
        // add message container
        let divAddCont = document.createElement('div');
        // add icon
        let icon = document.createElement('i');
        icon.classList.add('fa-solid');
        icon.classList.add('fa-plus');
        // add text
        let addText = document.createTextNode("Click to Add");
        // all add items inside this div
        let insideDiv = document.createElement('div');
        insideDiv.appendChild(icon);
        insideDiv.appendChild(document.createElement("br"));
        insideDiv.appendChild(addText);
        divAddCont.appendChild(insideDiv);
        divAdd.appendChild(divAddCont);
        divCont.appendChild(divAdd);

        // card model image
        let img = document.createElement('img');
        img.src = "/static/images/models/"+model.type+"/"+model.asset_name+".png";
        divCont.appendChild(img);
        // model name text
        let text = document.createTextNode(model.asset_name);
        divCont.appendChild(text);

        // adds all to card div
        div.appendChild(divCont);
        // adds card to the main type container
        container.appendChild(div);

        // if model card is clicked it adds model to game
        div.addEventListener("click", function() {
            // add asset to experience
            const asset_name = this.getAttributeNode("model").value;
            experience.world.addModel(asset_name);
            // update project tab
            updateAddedAssets()
            
            // when a new asset is added, it becomes the selected asset on the experience
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

// -- grid size configuration
var size_x = document.getElementById('size_x');
var size_z = document.getElementById('size_z');

size_x.addEventListener('change', (event) => {
    updateGridSize()
})

size_z.addEventListener('change', (event) => {
    updateGridSize()
})

function updateGridSize(){
    experience.world.gridSize.x = size_x.value * 2;
    experience.world.gridSize.z = size_z.value * 2;
    experience.world.floor.floorMesh.scale.set(experience.world.gridSize.x, experience.world.gridSize.z, 1);
    experience.world.floor.floorTexture.repeat.set(experience.world.gridSize.x/2, experience.world.gridSize.z/2);
}

// watch for any changes in the attribute's inputs and update experience accordingly
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

    // add icon to indicate weapon is being used
    var attack_assets = document.getElementsByClassName("attack_asset");
    for (let i = 0; i < attack_assets.length; i++) {
        let container = attack_assets[i].getElementsByClassName("icon_container")[0];
        container.innerHTML = ""
        if (attack_assets[i].textContent == attack.value){
            var icon = document.createElement('i');
            icon.classList.add("fas");
            icon.classList.add("fa-sword");
            container.appendChild(icon);
        }
    }

})

defense.addEventListener('change', (event) => {
    var unique_name = document.getElementById('asset_name').value;
    experience.world.dictModels[unique_name].defense_weapon = defense.value;

    // add icon to indicate weapon is being used
    var defense_assets = document.getElementsByClassName("defense_asset");
    for (let i = 0; i < defense_assets.length; i++) {
        let container = defense_assets[i].getElementsByClassName("icon_container")[0];
        container.innerHTML = ""
        if (defense_assets[i].textContent == defense.value){
            var icon = document.createElement('i');
            icon.classList.add("fas");
            icon.classList.add("fa-shield");
            container.appendChild(icon);
        }
    }
})

function selectAssetCard(){
    /**
     * Selects the asset that is currently being transformed
     */

    // select all added assets
    var added_assets = document.getElementsByClassName("added_asset");

    // identify object being transformed in the experience
    var unique_name = experience.world.transformControls.object.userData;

    // adds the border to the asset selected
    for (let i = 0; i < added_assets.length; i++) {
        if (added_assets[i].textContent == unique_name){
            added_assets[i].classList.add('border');
        }else{
            added_assets[i].classList.remove('border');
        }
    }

    // -- show asset settings

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

    // check if asset has attack_range
    if ('attack_range' in selected_asset){
        document.getElementsByClassName("properties_attack_range")[0].removeAttribute("hidden");
        document.getElementById('attack_range').value = selected_asset.attack_range;
    }

    // check if asset has attack_weapon
    if ('attack_weapon' in selected_asset){
        // make the select visible
        document.getElementsByClassName("properties_attack")[0].removeAttribute("hidden");

        // recreates the select innerHTML
        var select = document.getElementById('attack');
        select.innerHTML = "";

        // add the none option as the first
        var option = document.createElement('option');
        option.value = ""
        option.innerHTML = "None";
        select.appendChild(option);

        // for each added attack weapon, create an option in the select
        var attack_assets = document.getElementsByClassName("attack_asset");
        for (var i=0; i<attack_assets.length; i++){
            var option = document.createElement('option');
            option.value = attack_assets[i].textContent;
            option.innerHTML = attack_assets[i].textContent;
            // selects the option if the asset has this weapon selected
            if(attack_assets[i].textContent == selected_asset.attack_weapon){
                option.selected = true;
            }
            select.appendChild(option);
        }
    }

    // check if asset has defense_weapon
    if ('defense_weapon' in selected_asset){
        // make the select visible
        document.getElementsByClassName("properties_defense")[0].removeAttribute("hidden");

        // recreates the select innerHTML
        var select = document.getElementById('defense')
        select.innerHTML = "";

        // add the none option as the first
        var option = document.createElement('option');
        option.value = ""
        option.innerHTML = "None";
        select.appendChild(option);

        // for each added defense weapon, create an option in the select
        var defense_assets = document.getElementsByClassName("defense_asset");
        for (var i=0; i<defense_assets.length; i++){
            var option = document.createElement('option');
            option.value = defense_assets[i].textContent;
            option.innerHTML = defense_assets[i].textContent;
            // selects the option if the asset has this weapon selected
            if(defense_assets[i].textContent == selected_asset.defense_weapon){
                option.selected = true;
            }
            select.appendChild(option);
        }
    }
}

function unselect(){
    /**
     * Deselect all assets in the project tab
     */
    
    // for each card, remove the border class
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

function updateAddedAssets(){
    /**
     * Update the asset cards in the project to be the same as in the game
     */

    // get added assets container
    const addedAssetsCont = document.getElementsByClassName("added_assets")[0];
    // remove all cards from the container
    addedAssetsCont.innerHTML = ""

    // get all assets in the game
    const models = experience.world.assets

    // creates variable to be referenced later
    let player = null;
  
    // creates card for each game asset
    for (let i = 0; i < models.length; i++) {
        let model = models[i];

        // creates card with javascript dom
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
        let divIcon = document.createElement('div');
        divIcon.classList.add("icon_container");
        divCont.appendChild(divIcon);
        div.appendChild(divCont);
        addedAssetsCont.appendChild(div);

        // if the model is a weapon, add a special class to identify it easily
        if (experience.world.dictModels[model.unique_name].attack){
            div.classList.add("attack_asset");
        } else if (experience.world.dictModels[model.unique_name].defense){
            div.classList.add("defense_asset");
        }

        // if model is a player, saves model to be identified later
        if (model.constructor.type == "player"){
            // if player was already identified, show error message
            if (player){
                message_handler.addMessage({text: "Can only have a single player in the game", type: "error"})
                message_handler.showMessages()
            }
            player = model;
        }

        // when clicking on the added asset card, it selects the model on the experience
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

        // when delete button is clicked, deletes the asset from the game
        divDel.addEventListener("click", function(){
            // make sure the transformControls is not selecting any asset
            experience.world.transformControls.detach();
            // delete asset from game
            experience.world.deleteModel(model.unique_name);
            // update project tab
            updateAddedAssets();
        })
    }

    // if a player exists in the game, add an icon on the weapons it is using
    if (player){
        // show attack weapon icon
        var attack_assets = document.getElementsByClassName("attack_asset");
        for (let i = 0; i < attack_assets.length; i++) {
            let container = attack_assets[i].getElementsByClassName("icon_container")[0];
            container.innerHTML = ""
            if (attack_assets[i].textContent == player.attack_weapon){
                var icon = document.createElement('i');
                icon.classList.add("fas");
                icon.classList.add("fa-sword");
                container.appendChild(icon);
            }
        }

        // show defense weapon icon
        var defense_assets = document.getElementsByClassName("defense_asset");
        for (let i = 0; i < defense_assets.length; i++) {
            let container = defense_assets[i].getElementsByClassName("icon_container")[0];
            container.innerHTML = ""
            if (defense_assets[i].textContent == player.defense_weapon){
                var icon = document.createElement('i');
                icon.classList.add("fas");
                icon.classList.add("fa-shield");
                container.appendChild(icon);
            }
        }
    }
}

// play game
document.getElementById("play").addEventListener("click", async function() {
    // show loading div
    const loading = document.querySelector("#loading");
    loading.style.display = "flex";

    // saves game
    await Promise.all([saveGameDetails(), saveAssets()]);

    // redirects to play page
    window.location = "/games/play/"+id_game;
});

// save game
document.getElementById("save").addEventListener("click", async function() {
    // show loading icon animation
    const icon = this.getElementsByTagName("i")[0];
    icon.classList.remove("fa-save");
    icon.classList.add("fa-spinner");
    icon.classList.add("fa-pulse");

    // saves game
    await Promise.all([saveGameDetails(), saveAssets()]);

    // show save icon again
    icon.classList.add("fa-save");
    icon.classList.remove("fa-spinner");
    icon.classList.remove("fa-pulse");

    // display any messages
    message_handler.showMessages()
});


async function saveGameDetails() {
    /**
     * Save only game general details
     */

    // get all inputs
    const input = document.getElementById('game_name');
    const size_x = document.getElementById('size_x');
    const size_z = document.getElementById('size_z');

    // create dict with all data values
    const data = {
        name: input.value,
        size_x: size_x.value,
        size_z: size_z.value
    };

    // send game data to API
    try {
        const response = await fetch(`/games/${id_game}`, {
            method: "PUT",
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(data)
        });

        const data_json = await response.json();
        // adds any message returned to the message_handler
        message_handler.addMessage(data_json.message);
    } catch (error) {
        console.error(error);
    }
}

async function saveAssets(){
    /**
     * Save all game assets in database
     */

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

    // send all assets data to API
    try {
        const response = await fetch(`/assets/${id_game}`, {
            method: "PUT",
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({assets: data})
        });

        const data_json = await response.json();

        // adds any message returned to the message_handler
        message_handler.addMessage(data_json.message);
    } catch (error) {
        console.error(error);
    }
}