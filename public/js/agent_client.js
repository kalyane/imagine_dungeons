import Experience from '../Experience/Experience.js'
import MessageHandler from "./MessageHandler";

import GameEnv from './GameEnv.js'
import DBManager from './DBManager.js'

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

tf.setBackend('webgl');

let assets = null;
let game = null;

var message_handler = new MessageHandler()

let experience = new Experience(document.querySelector('canvas#playCanvas'));
window.experience = experience;

document.getElementById("save").addEventListener("click", async function() {
    // show loading icon animation
    const icon = this.getElementsByTagName("i")[0];
    icon.classList.remove("fa-save");
    icon.classList.add("fa-spinner");
    icon.classList.add("fa-pulse");

    await save();

    // show save icon again
    icon.classList.add("fa-save");
    icon.classList.remove("fa-spinner");
    icon.classList.remove("fa-pulse");

    message_handler.showMessages()
});

async function save(){
    const id_agent = document.getElementsByClassName("agent")[0].getAttributeNode("id_agent").value;
    const code = document.getElementById("code").value;
    const name = document.getElementById("agent_name").value;

    let data = {
        name: name,
        code: code
    };

    const response = await fetch(`/agents/${id_agent}`, {
        method: "PUT",
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(data)
    });

    const data_json = await response.json();
    // adds any message returned to the message_handler
    message_handler.addMessage(data_json.message);

}

document.getElementById("run").addEventListener("click", async function() {
    await save();

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

        await executeCode()
    });
}

async function executeCode() {
    document.getElementById("agent_name").readOnly = true;
    window.editor.setOption("readOnly", true);

    const code = document.getElementById("code").value;

    const wrapper = `
        async function myAsyncFunction() {
            try {
                ${code}
            } catch (error) {
                console.log(error)
                message_handler.addMessage({text: error, type:"error"});
                message_handler.showMessages()
            }
        };
        try {
            myAsyncFunction();
        } catch (error) {
            console.log(error)
            message_handler.addMessage({text: error, type:"error"});
            message_handler.showMessages()
        }`;

    try {
        // Define an async function that takes in the env object
        const fn = new Function('tf', 'GameEnv', 'DBManager','message_handler',wrapper);
        fn( tf, GameEnv, DBManager, message_handler); // Call the function with the environment and action arguments
    } catch (error) {
        console.log(error)
        message_handler.addMessage({text: error.message, type:"error"});
        message_handler.showMessages()
    }

    message_handler.showMessages()
}