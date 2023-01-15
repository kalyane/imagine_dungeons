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
            experience.world.dictModels[assets[i].name].modelDragBox.rotation.y = assets[i].rotation_y
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
      addedAssetsCont.appendChild(div)
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
            rotation_y: assets[i].model.rotation.y,
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