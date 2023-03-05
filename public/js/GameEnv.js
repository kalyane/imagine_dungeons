import Experience from '../Experience/Experience.js'
import ndarray from 'ndarray';

export default class GameEnv
{
    constructor(width, height, weights)
    {
        // Create a instance of the Experience class that is a singleton
        this.experience = new Experience();

        // Set the width and height of the game environment
        this.width = width;
        this.height = height;
        
        // Define the observation space
        this.observation_space = [this.width, this.height, 1];

        // Initialize the rewards array
        this.rewards = []
        
        // Define the mapping between actions and keys
        //      Action key
        //      0 - IDLE (none), 1 - MOVE (w), 2 - ROTATE LEFT (a), 3 - ROTATE RIGHT (d)
        //      4 - ATTACK (space), 5 - INTERACT (e)
        this.action_map = {
            0: [],
            1: ['w'],
            2: ['a'],
            3: ['d'],
            4: [' '],
            5: ['e']
        }

        // Define the reward weights
        this.reward_weights = weights;

        // Determine the number of actions
        this.action_space = Object.keys(this.action_map).length;

        // Set the ready state of the game to false
        this.ready = false;

        // When the experience is ready, set the ready variable to true
        this.experience.on('ready', () => {
            this.ready = true;
        });

        // When the experience is not ready, set the ready variable to false
        this.experience.on('not_ready', () => {
            this.ready = false;
        });
    }

    // Reset the game environment
    async reset() {
        // Reset the experience
        this.experience.reset();

        // If there is a total reward, add it to the rewards array
        if (this.total_reward){
            this.rewards.push(this.total_reward)
        }

        // Update the reward plot
        this.plotReward()

        this.total_reward = 0

        const observation = await this.getObservation();
      
        return new Promise(resolve => {
            // If the experience is ready, get the current metrics and resolve the promise
            if (this.ready) {
                this.previous_metrics = this.getMetrics();
                resolve([observation]);
            } 
            // If the experience is not ready, check every 100ms until it is ready
            else {
                const checkReady = () => {
                    if (this.ready) {
                        this.previous_metrics = this.getMetrics();
                        resolve([observation]);
                    } else {
                        setTimeout(checkReady, 100);
                    }
                };
                checkReady();
            }
        });
    }

    // Take a step in the game environment
    async step(action){
        // Send the input to the player controls
        this.experience.world.player.controls.sendInput(this.action_map[action]);

        // Check if the game is over
        const done = this.experience.gameOver;

        // Get the current observation
        const observation = await this.getObservation();

        // Get the reward for the current step
        const reward = this.getReward()
        // Add the reward to the total reward
        this.total_reward += reward;

        // Wait for 10ms and then resolve the promise with the observation, reward, and done variables
        return new Promise(resolve => {
            setTimeout(() => {
              resolve([
                observation,
                reward,
                done
              ]);
            }, 10);
        });
    }

    // Get the current metrics for the player
    getMetrics(){
        var metrics = {
            "life": this.experience.metrics.life,
            "xp": this.experience.metrics.xp,
            "level": this.experience.metrics.level,
            "defense": this.experience.metrics.defense,
            "attack": this.experience.metrics.attack,
            "time": this.experience.metrics.time,
            "game_lost": this.experience.metrics.over == "lost",
            "game_win": this.experience.metrics.over == "won"
        }

        return metrics
    }

    // Calculate the reward for the current step
    getReward(){
        var reward = 0

        // Get the current metrics
        const metrics = this.getMetrics();

        // Calculate the reward based on the reward weights and the difference in metrics from the previous step
        for(const key in this.reward_weights){
            reward += this.reward_weights[key] * (metrics[key] - this.previous_metrics[key])
        }

        // Update the previous metrics
        this.previous_metrics = metrics

        return reward
    }

    // Get the current observation
    async getObservation() {
        // Get the current image data from the renderer
        const dataURL = this.experience.renderer.current_image;
        const img = new Image();

        img.src = dataURL;

        // Wait for the image to load
        await new Promise((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Failed to load image'));
        });

        // Create a canvas and context to draw the image onto
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.width;
        canvas.height = this.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get the image data from the canvas and convert it to a grayscale ndarray
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const matrix = ndarray(new Float32Array(imageData.data.length / 4), [canvas.width, canvas.height], [1, canvas.width], 0);
        var stateArray = [];
        for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const luminosity = 0.21 * r + 0.72 * g + 0.07 * b;
            matrix.data[i / 4] = luminosity;
            stateArray.push(luminosity);
        }
        this.grayscaleMatrix = matrix;

        return stateArray;
    }

    plotReward(){
        // Update the chart with new data
        window.chart.data.datasets[0].data = this.rewards;
        window.chart.data.labels = this.rewards.map((reward, index) => `${index + 1}`);
        window.chart.update();
    }

    render(){
        // Create a new ImageData object from the grayscale matrix
        const imageData = new ImageData(this.width, this.height);

        // Populate the ImageData object with grayscale values
        for (let i = 0; i < imageData.data.length; i += 4) {
            const index = i / 4;
            const value = Math.floor(this.grayscaleMatrix.data[index]);
            imageData.data[i] = value;
            imageData.data[i + 1] = value;
            imageData.data[i + 2] = value;
            imageData.data[i + 3] = 255;
        }

        // Create a canvas and display the image
        const canvas = document.getElementById("renderCanvas");
        const context = canvas.getContext('2d');
        canvas.height = this.height
        canvas.width = this.width
        context.putImageData(imageData, 0, 0);
    }
}