const express = require('express');
const Agent = require('../../dbmodels/Agent');
const Game = require('../../dbmodels/Game');
const passport = require('passport');

require('./jwt_strategy');

let router = express.Router();

router
    .route("/")
    .get(passport.authenticate('jwt', { session: false, failureRedirect: '/login' }), async (req, res) => {
        const agents = await Agent.find({ user: req.user._id }).populate("user", "name");
        res.render('agents', {name: 'agents', user: req.user, agents:agents});
    });

router
    .route("/create/:id_game?")
    .get(passport.authenticate('jwt', { session: false, failureRedirect: '/login' }), async (req, res) => {
        const agent = new Agent({ user: req.user._id});
        await agent.save();
        res.redirect(`/agents/${agent._id}/${req.params.id_game}`);
    });
    
router
    .route("/delete/:id_agent")
    .get(passport.authenticate('jwt', { session: false, failureRedirect: '/login' }), async (req, res) => {
        try {
            const agent = await Agent.findOneAndDelete({ _id: req.params.id_agent, user: req.user._id });
            if (!agent) {
                throw new Error("Agent not found or you do not have permission to delete this agent");
            }
            res.redirect('/agents');
        } catch (error) {
            res.redirect('/404')
        }
    });

router
    .route("/update/:id_agent")
    .post(passport.authenticate('jwt', { session: false, failureRedirect: '/login' }), async (req, res)=>{
        var id_agent = req.params.id_agent;
        var name = req.body.name;
        var code = req.body.code;
        try {
            await Agent.findOneAndUpdate({ _id: id_agent }, { name, code });
            res.status(200).send({message: "Agent updated successfully"})
        } catch (error) {
            res.redirect('/404')
        }
    });

router
    .route("/object/:id_agent")
    .get(passport.authenticate('jwt', { session: false, failureRedirect: '/login' }), async (req, res)=>{
        var id_agent = req.params.id_agent;
        try {
            const agent = await Agent.findOne({ _id: id_agent, user: req.user._id});
            if (agent) {
                res.send(agent.user_object)
            } else {
                res.status(500).send({message: "Couldn't get object"})
            }
        } catch (error) {
            res.status(500).send({message: "Couldn't get object"})
        }
    })
    .post(passport.authenticate('jwt', { session: false, failureRedirect: '/login' }), async (req, res)=>{
        var id_agent = req.params.id_agent;
        var user_object = req.body.user_object;
        try {
            await Agent.findOneAndUpdate({ _id: id_agent }, { user_object});
            res.status(200).send({message: "Object saved successfully"})
        } catch (error) {
            res.status(500).send({message: "Couldn't save object"})
        }
    });

router
    .route("/:id_agent/:id_game?")
    .get(passport.authenticate('jwt', { session: false, failureRedirect: '/login' }), async (req, res)=>{
        // TODO: make sure only user -----
        var id_agent = req.params.id_agent;
        try {
            const agent = await Agent.findOne({ _id: id_agent});
            const games = await Game.find({ user: req.user._id }).populate("user", "name");
            if (agent) {
                res.render('agent', {agent: agent, user: req.user, games, id_game: req.params.id_game});
            } else {
                res.redirect('/login')
            }
        } catch (error) {
            res.redirect('/404')
        }
    });

module.exports = router;