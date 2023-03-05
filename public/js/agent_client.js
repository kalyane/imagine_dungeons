import Experience from '../Experience/Experience.js'
import MessageHandler from "./MessageHandler";

import GameEnv from './GameEnv.js'
import DBManager from './DBManager.js'

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

// Set TensorFlow backend to WebGL
tf.setBackend('webgl');

// Initialize variables
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

    // Show any messages returned by the server
    message_handler.showMessages()
});

// Add event listener to the "agent_name" input field
const name = document.getElementById("agent_name");
name.addEventListener("change", function(){
    changeNameFile()
})

// Function to change the filename displayed on the webpage based on the value of the "agent_name" input field
function changeNameFile(){
    document.getElementById("main").innerHTML = name.value + ".js"
}
// Set the initial filename
changeNameFile()

// Save the agent code to the server
async function save(){
    // If current code is not "main", ask for confirmation before saving
    if (current_code != "main"){
        var answer = window.confirm("By clicking OK you confirm to replace the code on '"+ name.value + ".js' file with the current code in the editor");
        if (!answer){
            return false
        }
    }

    const id_agent = document.getElementsByClassName("agent")[0].getAttributeNode("id_agent").value;
    const code = window.editor.getValue();

    // Update main code to the last saved
    current_code = "main"
    availableCodes[current_code] = code
    availableCodeWithChanges[current_code] = code
    selectOptionCode()

    // Save the code to the server
    let data = {
        name: name.value,
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

    return true

}

document.getElementById("run").addEventListener("click", async function() {
    var saved = await save();
    // If not saved, the code doesn't run
    if (!saved){
        return
    }

    const id_game = document.getElementById("game_name").value;
    // If no game was selected, show an alert and return
    if (id_game == null || id_game == ""){
        alert("No game was selected");
        return
    }

    const icon = this.getElementsByTagName("i")[0];
    icon.classList.remove("fa-play");
    icon.classList.add("fa-spinner");
    icon.classList.add("fa-pulse");

    document.getElementsByClassName("code")[0].style.opacity = 0.5;
    document.getElementById("agent_name").readOnly = true;
    window.editor.setOption("readOnly", true);
    

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

// Set the attributes of the experience instance
async function setExperienceAttributes(){
    experience.setAttributes(assets, {'x': game.size_x*2,'z': game.size_z*2}, true, false)
    
    // when the experience is ready
    experience.world.on('ready', async () => {
        // reset experience
        experience.reset()

        // execute the code in the editor
        await executeCode()
    });

    // update metrics on every tick
    experience.time.on('tick', () =>
    {
        var life = document.getElementById("life");
        life.innerHTML = experience.metrics.life

        var xp = document.getElementById("xp");
        xp.innerHTML = experience.metrics.xp

        var level = document.getElementById("level");
        level.innerHTML = experience.metrics.level

        var defense = document.getElementById("defense");
        defense.innerHTML = experience.metrics.defense

        var attack = document.getElementById("attack");
        attack.innerHTML = experience.metrics.attack

        var time = document.getElementById("time");
        time.innerHTML = experience.metrics.time

        var key = document.getElementById("key");
        key.innerHTML = experience.metrics.key
    })
}

// executes the code currently in the editor
async function executeCode() {
    const code = window.editor.getValue();

    // creates a wrapper function that is async and shows error messaged if there is an error
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
        fn( tf, GameEnv, DBManager, message_handler); // Call the function with the libraries and classes available
    } catch (error) {
        console.log(error)
        message_handler.addMessage({text: error.message, type:"error"});
        message_handler.showMessages()
    }

    message_handler.showMessages()
}

// -- manages the switching between main and example codes

const options_container = document.getElementsByClassName("algo_options")[0];
const options = document.querySelectorAll('.algo_option');

// when clicks on files icon, show the code options
document.getElementById("files").addEventListener("click", async function() {
    options_container.hidden = !options_container.hidden;
});

// Add a click event listener to each button
options.forEach(option => {
    // when an option is clicked, shows the associated code in the editor
    option.addEventListener('click', () => {
        changeCodeOnEditor(option.getAttributeNode("code").value)
    });
});

// creates a dict to store the available codes
const availableCodes = {
    "main": window.codes["main"],
    "dqn": window.codes["dqn"],
    "placeholder": window.codes["placeholder"]
}

// copy the available codes to allow user to change
const availableCodeWithChanges = {...availableCodes}

// app starts with the main code
var current_code = "main"

// sets the code in the editor to be the same selected in the options
function changeCodeOnEditor(code){
    availableCodeWithChanges[current_code] = window.editor.getValue();

    window.editor.setValue(availableCodeWithChanges[code]);

    current_code = code;

    selectOptionCode()

    options_container.hidden = true
}

// adds the selected class to the selected option
function selectOptionCode(){
    options.forEach(option => {
        if (option.getAttributeNode("code").value == current_code){
            option.classList.add("selected")
        } else {
            option.classList.remove("selected")
        }
    });
}

selectOptionCode()

// when undo is clicked, replace the changes with the original files
document.getElementById("undo").addEventListener("click", async function() {
    availableCodeWithChanges[current_code] = availableCodes[current_code]
    window.editor.setValue(availableCodeWithChanges[current_code]);
});

