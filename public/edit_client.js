import Experience from './Experience/Experience.js'

const experience = new Experience(document.querySelector('canvas#editCanvas'))

window.experience = experience;

// get model that were saved in the database
var id_game = document.getElementsByClassName("edit_game")[0].getAttributeNode("id_game").value;
var size_x = document.getElementById('size_x');
var size_z = document.getElementById('size_z');

updateGridSize()

var url = "/assets/" + id_game

experience.world.on('ready', () => {
    fetch(url).then(function(response) {
        return response.json();
    }).then(function(assets) {
        for (var i = 0; i < assets.length; i++){
            experience.world.addModel(assets[i].asset.name, assets[i].name);
            experience.world.dictModels[assets[i].name].modelDragBox.position.x = assets[i].position_x
            experience.world.dictModels[assets[i].name].modelDragBox.position.z = assets[i].position_z
            experience.world.dictModels[assets[i].name].modelDragBox.quaternion.y = assets[i].quaternion_y
            experience.world.dictModels[assets[i].name].modelDragBox.quaternion.w = assets[i].quaternion_w
        }
        updateAddedAssets()
    });
});



size_x.addEventListener('change', (event) => {
    updateGridSize()
})

size_z.addEventListener('change', (event) => {
    updateGridSize()
})

function updateGridSize(){
    experience.world.gridSize.x = size_x.value * 2;
    experience.world.gridSize.z = size_z.value * 2;
    experience.world.floorMesh.scale.set(experience.world.gridSize.x, experience.world.gridSize.z, 1);
    experience.world.floorTexture.repeat.set(experience.world.gridSize.x/2, experience.world.gridSize.z/2);
}

var assets = document.getElementsByClassName("asset_card");

for (var i = 0; i < assets.length; i++) {
    assets[i].addEventListener("click", function() {
        const modelName = this.getAttributeNode("model").value;
        experience.world.addModel(modelName);
        updateAddedAssets()
    });
}

const addedAssetsCont = document.querySelector('.added_assets');

experience.world.on('start_transform', () => {
    // select only the object transform
    var added_assets = document.getElementsByClassName("added_asset");

    var asset_name = experience.world.transformControls.object.userData;

    for (let i = 0; i < added_assets.length; i++) {
        if (added_assets[i].textContent == asset_name){
            added_assets[i].classList.add('border');
        }else{
            added_assets[i].classList.remove('border');
        }
    }

    // show info

    // get instance of asset
    var selected_asset = experience.world.dictModels[asset_name]

    document.getElementsByClassName("selected")[0].removeAttribute("hidden");
    document.getElementById('asset_name').value = selected_asset.name;
    document.getElementById('selected_img').setAttribute('src',"/images/models/"+selected_asset.modelName+".png");

    if ('life' in selected_asset){
        // make life visible
        document.getElementsByClassName("properties_life")[0].removeAttribute("hidden");
        // include current value of life to asset
        document.getElementById('life').value = selected_asset.life;
    }
    if ('strength' in selected_asset){
        // make strength visible
        document.getElementsByClassName("properties_strength")[0].removeAttribute("hidden");
        // include current value of strength to asset
        document.getElementById('strength').value = selected_asset.strength;
    }
});

experience.world.on('stop_transform', () => {
    // deselect all assets
    var added_assets = document.getElementsByClassName("added_asset");

    for (let i = 0; i < added_assets.length; i++) {
        added_assets[i].classList.remove('border');
    }

    // hide asset properties
    document.getElementsByClassName("selected")[0].setAttribute("hidden", true);
    document.getElementsByClassName("properties_life")[0].setAttribute("hidden", true);
    document.getElementsByClassName("properties_strength")[0].setAttribute("hidden", true);
    
});

function updateAddedAssets(){
    const models = experience.world.assets
  
    addedAssetsCont.innerHTML = ""
  
    for (let i = 0; i < models.length; i++) {
        let model = models[i];
        let div = document.createElement('div');
        div.classList.add('added_asset');
        div.setAttribute("pos", i)
        let img = document.createElement('img');
        img.src = "/images/models/"+model.modelName+".png"
        div.appendChild(img)
        let text = document.createTextNode(model.name);
        div.appendChild(text);
        let divDel = document.createElement('div');
        divDel.classList.add('asset_delete');
        let icon = document.createElement('i');
        icon.classList.add("fa-solid");
        icon.classList.add("fa-trash-can");
        divDel.appendChild(icon);
        div.appendChild(divDel);
        addedAssetsCont.appendChild(div);

        divDel.addEventListener("click", function(){
            experience.world.deleteModel(model.name);
            updateAddedAssets()
        })
    }
}

// when save button is clicked
document.getElementById("save").addEventListener("click", function() {
    saveGameDetails()
    saveAssets()
});


function saveGameDetails(){
    // for now game just has name
    const input = document.getElementById('game_name');
    let data = {
        name: input.value,
        size_x: size_x.value,
        size_z: size_z.value
    };
    console.log(data)

    fetch("/games/update/"+id_game, {
        method: "POST",
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(data)
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        console.log(data);
    });
}

function saveAssets(){
    const assets = experience.world.assets;

    var data = []

    for (var i = 0; i < assets.length; i++){
        let assetData = {
            position_x: assets[i].model.position.x,
            position_z: assets[i].model.position.z,
            quaternion_y: assets[i].model.quaternion.y,
            quaternion_w: assets[i].model.quaternion.w,
            name: assets[i].name,
            model_name: assets[i].modelName,
        };

        data.push(assetData)
    }

    fetch("/assets/"+id_game, {
        method: "POST",
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({assets: data})
    });
}