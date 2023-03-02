import MessageHandler from "./MessageHandler";

let assets = null;
let game = null;

var message_handler = new MessageHandler()

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/bundles/agent_worker_bundle.js').then(registration => {
        // Send a message to the service worker
        const id_agent = document.getElementsByClassName("agent")[0].getAttributeNode("id_agent").value
        registration.active.postMessage({trigger: "id_agent", data: {id_agent: id_agent}});
    }).catch(error => {
        console.error('Error registering service worker:', error);
    });
}

const worker = new Worker('/static/bundles/agent_worker_bundle.js');

const id_agent = document.getElementsByClassName("agent")[0].getAttributeNode("id_agent").value

worker.postMessage({trigger: "id_agent", data: {id_agent: id_agent}})

const canvas = document.getElementById('playCanvas');
const ctx = canvas.getContext('2d');

worker.addEventListener('message', event => {
    const { trigger, data } = event.data;

    if (trigger == "update"){
        const bitmap = data.bitmap

        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

        // Calculate the aspect ratio of the bitmap
        const aspectRatio = bitmap.width / bitmap.height;

        // Resize the bitmap to fit the canvas
        if (bitmap.width > canvas.width || bitmap.height > canvas.height) {
            if (aspectRatio > 1) {
            ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.width / aspectRatio);
            } else {
            ctx.drawImage(bitmap, 0, 0, canvas.height * aspectRatio, canvas.height);
            }
        } else {
            ctx.drawImage(bitmap, 0, 0);
        }
    }

    if (trigger == "message"){
        message_handler.addMessage(data)
        message_handler.showMessages()
    }
});

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
    document.getElementById("agent_name").readOnly = true;
    window.editor.setOption("readOnly", true);

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
    const code = document.getElementById("code").value;

    worker.postMessage({trigger: 'experience', data: {
        assets:assets, 
        gridSize : {'x': game.size_x*2,'z': game.size_z*2}, 
        fog: {'near': game.near, 'far': game.far}, 
        code: code
    }})
}