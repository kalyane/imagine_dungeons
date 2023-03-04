// Define the DQN agent
class DQNAgent {
    constructor(numActions, inputShape) {
      this.numActions = numActions;
      this.inputShape = inputShape;
  
      // Define the Q network
      this.qNetwork = tf.sequential({
        layers: [
          tf.layers.conv2d({inputShape: inputShape, filters: 32, kernelSize: 8, strides: 4, activation: 'relu'}),
          tf.layers.conv2d({filters: 64, kernelSize: 4, strides: 2, activation: 'relu'}),
          tf.layers.conv2d({filters: 64, kernelSize: 3, strides: 1, activation: 'relu'}),
          tf.layers.flatten(),
          tf.layers.dense({units: 512, activation: 'relu'}),
          tf.layers.dense({units: numActions})
        ]
      });
  
      // Define the target Q network
      this.targetQNetwork = tf.sequential({
        layers: [
          tf.layers.conv2d({inputShape: inputShape, filters: 32, kernelSize: 8, strides: 4, activation: 'relu'}),
          tf.layers.conv2d({filters: 64, kernelSize: 4, strides: 2, activation: 'relu'}),
          tf.layers.conv2d({filters: 64, kernelSize: 3, strides: 1, activation: 'relu'}),
          tf.layers.flatten(),
          tf.layers.dense({units: 512, activation: 'relu'}),
          tf.layers.dense({units: numActions})
        ]
      });
  
      // Compile the Q network
      this.qNetwork.compile({optimizer: tf.train.adam(), loss: 'meanSquaredError'});
  
      // Define the hyperparameters
      this.gamma = 0.99;
      this.epsilon = 1.0;
      this.epsilonMin = 0.01;
      this.epsilonDecay = 0.9995;
      this.batchSize = 32;
      this.memory = [];
      this.memoryCapacity = 10000;
      this.updateTargetFrequency = 1000;
      this.stepCounter = 0;
    }
  
    // Get an action from the Q network
    getAction(state) {
      if (Math.random() < this.epsilon) {
        return Math.floor(Math.random() * this.numActions);
      } else {
        const qValues = this.qNetwork.predict(tf.tensor(state).reshape([1, this.inputShape[0], this.inputShape[1], 1]).div(255));
        return qValues.argMax().dataSync()[0];
      }
    }
  
    // Store a transition in the memory
    storeTransition(transition) {
      this.memory[this.memoryIndex] = transition;
      this.memoryIndex = (this.memoryIndex + 1) % this.memoryCapacity;
    }
  
    // Update the Q network
    updateQNetwork() {
      if (this.memory.length < this.batchSize) {
        return;
      }
  
      // Sample a batch from the memory
      const indices = tf.tidy(() => tf.randomUniform([this.batchSize], 0, this.memory.length).cast('int32'));
      const batch = tf.tidy(() => {
        const stateBatch = [];
        const actionBatch = [];
        const rewardBatch = [];
        const nextStateBatch = [];
        const doneBatch = [];
  
        indices.arraySync().forEach(index => {
          const [state, action, reward, nextState, done] = this.memory[index];
          stateBatch.push(tf.tensor(state).reshape([1, this.inputShape[0], this.inputShape[1], 1]).div(255));
          actionBatch.push(action);
          rewardBatch.push(reward);
          nextStateBatch.push(tf.tensor(nextState).reshape([1, this.inputShape[0], this.inputShape[1], 1]).div(255));
          doneBatch.push(done);
        });
  
        return [tf.concat(stateBatch), tf.tensor1d(actionBatch, 'int32'), tf.tensor1d(rewardBatch), tf.concat(nextStateBatch), tf.tensor1d(doneBatch, 'bool')];
      });
  
      // Compute the target Q values
      const targetQValues = tf.tidy(() => {
        const qValues = this.qNetwork.predict(batch[3]);
        const maxQValues = this.targetQNetwork.predict(batch[3]).max(1);
        const targetQValues = batch[2].add(maxQValues.mul(this.gamma).mul(tf.logicalNot(batch[4]).cast('float32')));
        return tf.oneHot(batch[1], this.numActions).mul(targetQValues.reshape([-1, 1]));
      });
  
      // Train the Q network
      this.qNetwork.trainOnBatch(batch[0], targetQValues);
  
      // Update the target Q network
      if (this.stepCounter % this.updateTargetFrequency === 0) {
        this.targetQNetwork.setWeights(this.qNetwork.getWeights());
      }
  
      // Update the epsilon
      this.epsilon = Math.max(this.epsilonMin, this.epsilon * this.epsilonDecay);
  
      // Increment the step counter
      this.stepCounter++;
    }
  }
  
  // Define the main function
  async function main() {
    // define weights for the reward function
    const reward_weights = {
      "health": 0,
      "xp": 0,
      "level": 0,
      "defense": 0,
      "attack": 0,
      "time": -0.005,
      "game_over": 0,
      "game_win": 100
    }
    // Create the environment
    const env = new GameEnv(width = 100, height = 75, weights = reward_weights)
  
    // Initialize the agent
    const agent = new DQNAgent(env.action_space, env.observation_space);
    
    console.log("here");
  
    // create a new instance of DBManager
    const db = new DBManager();
  
    // try to retrieve the saved network from the database
    let saved_object = await db.getObject();
  
    if (saved_object) {
      console.log("Using saved network...");
      agent.qNetwork.setWeights(saved_object.qWeights);
      agent.targetQNetwork.setWeights(saved_object.targetQWeights);
      env.rewards = saved_object.rewards
    }
  
  
    // Run the training loop
    for (let episode = 0; episode < 1000; episode++) {
  
      let [state] = await env.reset();
  
      let done = false;
      let totalReward = 0;
      while (!done) {
        // Get an action from the agent
  
        const action = agent.getAction(state);
        // Take the action in the environment
        const [nextState, reward, isDone] = await env.step(action);
        env.render();
  
        // Store the transition in the memory
        agent.storeTransition([state, action, reward, nextState, isDone]);
  
        // Update the Q network
        agent.updateQNetwork();
  
        // Update the state and reward
        state = nextState;
        totalReward += reward;
        done = isDone;
      }
  
      // save the network to the database
      await db.saveObject({
        qWeights: agent.qNetwork.getWeights(),
        targetQWeights: agent.targetQNetwork.getWeights(),
        rewards: env.rewards
      });
  
      console.log(`Episode ${episode}: total reward = ${totalReward}`);
    }
  }
  
  // Run the main function
  main();