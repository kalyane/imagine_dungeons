import GameEnv from './GameEnv.js'
import DBManager from './DBManager.js'

import Experience from '../Experience/Experience.js'

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

tf.setBackend('webgl');

const offscreenCanvas = new OffscreenCanvas(400, 300);

let experience = new Experience(offscreenCanvas, true);
let id_agent = null;
let db_manager = null;

addEventListener('message', async event => {
    const { trigger, data } = event.data;

    if (trigger === 'id_agent') {
        id_agent = data.id_agent
        db_manager = new DBManager(id_agent)
    }
    
    if (trigger === 'experience') {
        experience.setAttributes(data.assets, data.gridSize, data.fog , true, false)
    
        experience.world.on('ready', async () => {
            experience.reset()

            experience.time.on('tick', () =>
            {
                self.postMessage({ trigger: 'update', data: {bitmap: experience.renderer.current_image, metrics: experience.metrics} });
            })

            await executeCode(data.code)
        });
    }
});


async function executeCode(code) {
    const wrapper = `
        async function myAsyncFunction() {
            try {
                ${code}
            } catch (error) {
                self.postMessage({ trigger: 'message', data: {text: error, type: 'error'} });
            }
        };
        try {
            myAsyncFunction();
        } catch (error) {
            self.postMessage({ trigger: 'message', data: {text: error, type: 'error'} });
        }`;

    try {
        // Define an async function that takes in the env object
        const fn = new Function('tf', 'GameEnv', 'db_manager','self',wrapper);
        fn( tf, GameEnv, db_manager, self); // Call the function with the environment and action arguments
    } catch (error) {
        self.postMessage({ trigger: 'message', data: {text: error, type: 'error'} });
    }
}