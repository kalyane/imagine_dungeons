const express = require('express');
const Agent = require('../../dbmodels/Agent');
const Game = require('../../dbmodels/Game');

const fs = require('fs');

let router = express.Router();

// set all agents routes
router
    .route("/")
    // show all agents the user has
    .get(async (req, res) => {
        try {
            const agents = await Agent.find({ user: req.user._id }).populate("user", "name");
            res.render('agents', {name: 'agents', user: req.user, agents: agents});
        } catch (error) {
            res.status(500).send({message: { text: error, type: "error"}})
        }
    })
    // create a new agent
    .post(async (req, res) => {
        try {
            // get placeholder javascript for the agent
            const jsFileContent = fs.readFileSync('public/js/agent_code/placeholder.js', 'utf8');
            // create new agent with placeholder code
            const agent = new Agent({ user: req.user._id, code: jsFileContent});
            await agent.save();
            res.redirect(`/agents/${agent._id}?id_game=${req.body.id_game}`);
        } catch (error) {
            res.status(500).send({message: { text: error, type: "error"}})
        }
    });

router
    .route("/:id_agent")
    // render agent page
    .get(async (req, res) => {
        const id_agent = req.params.id_agent;
        try {
            const agent = await Agent.findOne({ _id: id_agent, user: req.user._id});
            const games = await Game.find({ user: req.user._id }).populate("user", "name");
            const codes = {
                "main": agent.code,
                "dqn": fs.readFileSync('public/js/agent_code/dqn.js', 'utf8'),
                "placeholder": fs.readFileSync('public/js/agent_code/placeholder.js', 'utf8')
            }
            if (!agent) {
                // guarantees only the owner can see this page
                return res.status(403).send({message: { text: "Agent not found or you do not have permission to get this agent", type: "error"}})
            }
            return res.render('agent', {agent: agent, user: req.user, games, id_game: req.query.id_game, codes: codes});
        } catch (error) {
            res.status(500).send({message: { text: error, type: "error"}})
        }
    })
    // update agent information
    .put(async (req, res)=>{
        var id_agent = req.params.id_agent;
        var name = req.body.name;
        var code = req.body.code;

        try {
            const agent = await Agent.findOneAndUpdate({ _id: id_agent, user: req.user._id  }, { name, code });
            if (!agent) {
                // guarantees only the owner can update a agent
                return res.status(403).send({message: { text: "Agent not found or you do not have permission to update this agent", type: "error"}})
            }
            return res.status(200).send({message: { text: "Agent updated successfully", type: "success"}})
        } catch (error) {
            res.status(500).send({message: { text: error, type: "error"}})
        }
    })
    // delete game
    .delete(async (req, res) => {
        try {
            const agent = await Agent.findOneAndDelete({ _id: req.params.id_agent, user: req.user._id });
            if (!agent) {
                // guarantees only the owner can delete an agent
                return res.status(403).send({message: { text: "Agent not found or you do not have permission to delete this agent", type: "error"}})
            }
            return res.status(200).send({message: { text: "Agent deleted successfully", type: "success"}})
        } catch (error) {
            res.status(500).send({message: { text: error, type: "error"}})
        }
    });

router
    .route("/object/:id_agent")
    // get the agent user_object
    .get(async (req, res)=>{
        var id_agent = req.params.id_agent;
        try {
            const agent = await Agent.findOne({ _id: id_agent, user: req.user._id});
            if (!agent) {
                return res.status(403).send("Object not found or you do not have permission to get this object")
            } 
            return res.status(200).send(agent.user_object)
        } catch (error) {
            res.status(500).send(error)
        }
    })
    // update agent user_object
    .patch(async (req, res)=>{
        var id_agent = req.params.id_agent;
        var user_object = req.body.user_object;
        try {
            await Agent.findOneAndUpdate({ _id: id_agent, user: req.user._id }, { user_object});
            res.status(200).send({message: "Object saved successfully"})
        } catch (error) {
            res.status(500).send(error)
        }
    });

module.exports = router;