import Experience from '../Experience/Experience.js'
import ndarray from 'ndarray';

export default class GameEnv
{
    constructor(width, height, weights)
    {
        this.experience = new Experience();
        this.width = width;
        this.height = height;
        this.observation_space = [this.width, this.height, 1];

        this.reward_episode = []

        // Action key
        // 0 - IDLE (none), 1 - MOVE (w), 2 - ROTATE LEFT (a), 3 - ROTATE RIGHT (d)
        // 4 - WALK AND ROTATE LEFT (w + a), 5 -  WALK AND ROTATE RIGHT (w + d)
        // 6 - ATTACK (space), 7 - INTERACT (e)
        this.action_map = {
            0: [],
            1: ['w'],
            2: ['a'],
            3: ['d'],
            4: [' '],
            5: ['e']
        }

        this.reward_weights = weights;

        this.action_space = Object.keys(this.action_map).length;

        this.ready = false;

        this.experience.on('ready', () => {
            this.ready = true;
        });

        this.experience.on('not_ready', () => {
            this.ready = false;
        });
    }

    async reset() {
        this.experience.reset();
        if (this.total_reward){
            this.reward_episode.push(this.total_reward)
        }
        this.plotReward()
        this.total_reward = 0

        const observation = await this.getObservation();
      
        return new Promise(resolve => {
            if (this.ready) {
                this.previous_metrics = this.getMetrics();
                resolve([observation]);
            } else {
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

    async step(action){
        this.experience.world.player.controls.sendInput(this.action_map[action]);

        const done = this.experience.gameOver;

        const observation = await this.getObservation();

        const reward = this.getReward()

        this.total_reward += reward;

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

    getMetrics(){
        var metrics = {
            "health": this.experience.world.player.life,
            "xp": this.experience.world.player.xp,
            "level": this.experience.world.player.level,
            "defense": this.experience.world.player.defense_weapon ? this.experience.world.player.defense_weapon.strength : 0,
            "attack": this.experience.world.player.attack_weapon ? this.experience.world.player.attack_weapon.strength : 0,
            "time": this.experience.time.elapsed,
            "game_over": this.experience.gameOver && this.experience.world.player.controls.dead,
            "game_win": this.experience.gameOver && !this.experience.world.player.controls.dead
        }

        return metrics
    }

    getReward(){
        var reward = 0

        const metrics = this.getMetrics();

        for(const key in this.reward_weights){
            reward += this.reward_weights[key] * (metrics[key] - this.previous_metrics[key])
        }

        this.previous_metrics = metrics

        return reward
    }

    async getObservation() {
        const dataURL = this.experience.renderer.current_image;
        const img = new Image();

        img.src = dataURL;

        await new Promise((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Failed to load image'));
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.width;
        canvas.height = this.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
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
        window.chart.data.datasets[0].data = this.reward_episode;
        window.chart.data.labels = this.reward_episode.map((reward, index) => `${index + 1}`);
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