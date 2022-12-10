import * as THREE from '/build/three.module.js'
import EventEmitter from '../Utils/EventEmitter.js'

export default class CharacterControl extends EventEmitter
{
    constructor(input)
    {
        super()
        this.input = input
        this.distanceIteration = 0.1
        this.rotationIteration = 0.1

        // key pressed
        this.input.on('keyDown', () =>
        {
            this.setState()
        })

        // key released
        this.input.on('keyUp', () =>
        {
            this.setState()
        })

        // dict of states and their game representation
        this.states = {
            'idle': {
                'animation':'idle', 
                'rotation': 0, 
                'position': new THREE.Vector3(0, 0, 0)},
            'left': {
                'animation':'idle', 
                'rotation': this.rotationIteration, 
                'position': new THREE.Vector3(0, 0, 0)},
            'right': {
                'animation':'idle', 
                'rotation': -this.rotationIteration, 
                'position': new THREE.Vector3(0, 0, 0)},
            'forward': {
                'animation':'walk', 
                'rotation': 0, 
                'position': new THREE.Vector3(0, 0, this.distanceIteration)},
            'backward': {
                'animation':'walk', // TODO: need to change animation
                'rotation': 0, 
                'position': new THREE.Vector3(0, 0, -this.distanceIteration)},
            'attack': {
                'animation':'attack', 
                'rotation': 0, 
                'position': new THREE.Vector3(0, 0, 0)},
            'death': {
                'animation':'death', 
                'rotation': 0, 
                'position': new THREE.Vector3(0, 0, 0)}
        }

        this.currentState = this.states.idle
    }

    setState()
    {
        var newState = this.getNewState()

        // if there is a new state, trigger character to change state
        if (newState != this.currentState){
            this.currentState = newState
            this.trigger('newState')
        }
    }

    getNewState(){
        var newState = {...this.states.idle}

        if (this.input.keys.space){
            newState = {...this.states.attack}
            return newState
        }
        if (this.input.keys.left){
            newState.rotation += this.states.left.rotation
        }
        if (this.input.keys.right){
            newState.rotation += this.states.right.rotation
        }
        if (this.input.keys.forward){
            newState.position.add(this.states.forward.position)
            newState.animation = this.states.forward.animation
        }
        // TODO: character not going backwards problem
        if (this.input.keys.backward){
            newState.position.add(this.states.backward.position)
            newState.animation = this.states.backward.animation
        }
        if (this.input.keys.shift){ // TODO: add a running animation
            newState.position.add(newState.position)
        }

        return newState
    }

}