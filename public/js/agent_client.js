import Experience from '../Experience/Experience.js'
import GameEnv from './GameEnv.js'
import DBManager from './DBManager.js'

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

tf.setBackend('webgl');

let assets = null;
let game = null;

var ready = document.getElementById("ready");
ready.innerHTML = false

let experience = new Experience(document.querySelector('canvas#playCanvas'));
window.experience = experience;

document.getElementById("save").addEventListener("click", function() {
    const id_agent = document.getElementsByClassName("agent")[0].getAttributeNode("id_agent").value;
    const code = document.getElementById("code").value;
    const name = document.getElementById("agent_name").value;

    let data = {
        name: name,
        code: code
    };

    fetch("/agents/"+id_agent, {
        method: "PATCH",
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(data)
    }).then(function(response) {
        console.log(response);
    });
});

document.getElementById("run").addEventListener("click", function() {
    const code = editor.getValue();
    const id_game = document.getElementById("game_name").value;

    if (id_game == null || id_game == ""){
        alert("No game was selected");
        return
    }

    var url = "/games/" + id_game
    fetch(url).then(function (response) {
        return response.json();
    }).then(function (resolvedValue) {
        game = resolvedValue;
        window.game = game;
        if (game && assets) {
            setExperienceAttributes();
        }
    });

    // get assets saved on database to populate the game
    var url = "/assets/" + id_game
    fetch(url).then(function (response){
        return response.json();
    }).then(function (resolvedValue){
        assets = resolvedValue;
        if (game && assets) {
            setExperienceAttributes();
        }
    });

    document.getElementsByClassName("choice")[0].style.display = "none";
});

async function setExperienceAttributes(){
    experience.setAttributes(assets, {'x': game.size_x*2,'z': game.size_z*2}, {'near': game.near, 'far': game.far} , true, false)
    
    experience.world.on('ready', async () => {
        experience.reset()
        ready.innerHTML = true

        await executeCode()
    });
}

function executeCode() {
    window.editor.setOption("readOnly", true);
    window.editor.getWrapperElement().classList.toggle("readOnly", true);

    const code = document.getElementById("code").value;
    const wrapper = `async function myAsyncFunction() { ${code} }; myAsyncFunction();`;

    try {
        // Define an async function that takes in the env object
        const fn = new Function('tf', 'GameEnv', 'DBManager',wrapper);
        fn( tf, GameEnv, DBManager); // Call the function with the environment and action arguments
    } catch (e) {
        console.error(e);
    }
}