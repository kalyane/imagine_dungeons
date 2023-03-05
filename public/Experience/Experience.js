import * as THREE from '/node_modules/three/build/three.module.js'
import EventEmitter from './Utils/EventEmitter.js'

import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Resources from './Utils/Resources.js'

import sources from './sources.js'

let instance = null

export default class Experience extends EventEmitter
{
    constructor(_canvas)
    {
        super()
        // Singleton
        if(instance)
        {
            return instance
        }
        instance = this

        this.canvas = _canvas

        this.scene = new THREE.Scene()
        this.time = new Time()
        this.ready = false

        this.messages = []

        this.metrics = {
            time: null,
            life: null,
            defense: null,
            attack: null,
            xp: null,
            level: null,
            over: null,
            key: null
        }
    }

    // set the main attributes that doesn't change when reset
    setAttributes(assets = null, gridSize = {'x':50,'z':50}, playing = false, user_input = true){
        // true if playing, false if editing
        this.playing = playing
        // if user can send keyboard input
        this.user_input = user_input

        this.gridSize = gridSize

        this.resources = new Resources(sources)
        this.world = new World(assets)

        this.scene.background = new THREE.Color(0xb0b16);

        let light = new THREE.AmbientLight( 0x444444 , 2);
        this.scene.add(light);

        
        this.sizes = new Sizes(this.canvas)
        
        this.camera = new Camera()
        this.renderer = new Renderer()
        

        // Resize event
        this.sizes.on('resize', () =>
        {
            this.resize()
        })
        
        // Time tick event
        this.time.on('tick', () =>
        {
            this.update()
        })
    }

    cleanScene(){
        // Traverse the whole scene
        this.scene.traverse((child) =>
        {
            // Test if it's a mesh
            if(child instanceof THREE.Mesh)
            {
                child.geometry.dispose()

                // Loop through the material properties
                for(const key in child.material)
                {
                    const value = child.material[key]

                    // Test if there is a dispose function
                    if(value && typeof value.dispose === 'function')
                    {
                        value.dispose()
                    }
                }
            }
        })
    }

    reset(){
        this.trigger("not_ready");
        this.cleanScene()
        this.time.reset()

        this.gameOver = false

        this.world.reset();
        this.ready = true;
    }

    resize()
    {
        this.camera.resize()
        this.renderer.resize()
    }

    update()
    {
        this.camera.update()
        this.world.update()
        this.renderer.update()

        if (this.playing && this.ready){
            this.updateMetrics()
        }
    }

    updateMetrics(){
        this.metrics.life = this.world.player.life

        this.metrics.xp = this.world.player.xp

        this.metrics.level = this.world.player.level

        this.metrics.defense = this.world.player.defense_weapon.strength ? this.world.player.defense_weapon.strength : 0;

        this.metrics.attack = this.world.player.attack_weapon.strength ? this.world.player.attack_weapon.strength : 0;

        this.metrics.time = this.time.ticks

        let pressedKeys = '';
        for (let key in this.world.player.controls.keysPressed) {
            if (this.world.player.controls.keysPressed[key]) {
                if (key == " "){
                    key = "SPACE"
                }
                pressedKeys += key + ', ';
            }
        }
        pressedKeys = pressedKeys.slice(0, -2); // remove trailing comma
        if (pressedKeys == ""){
            pressedKeys = "_"
        }

        this.metrics.key = pressedKeys
        
        if (this.gameOver) {
            this.ready = false
            if (this.user_input){
                if (this.world.player.controls.dead){
                    this.metrics.over = "lost"
                } else if (this.world.type_win == this.world.possible_win.none) {
                    this.metrics.over = "no_way"
                    this.messages.push({text: "There is no way to win the game. Add an end_door or monsters.", type: "error", button: {text: "Back to Editing", href: "/games/edit/"+window.game._id}})
                    this.trigger("message")
                } else {
                    this.metrics.over = "won"
                }
            }
            this.trigger("game_over")
        }
    }

    destroy()
    {
        this.sizes.off('resize')
        this.time.off('tick')

        // Traverse the whole scene
        this.scene.traverse((child) =>
        {
            // Test if it's a mesh
            if(child instanceof THREE.Mesh)
            {
                child.geometry.dispose()

                // Loop through the material properties
                for(const key in child.material)
                {
                    const value = child.material[key]

                    // Test if there is a dispose function
                    if(value && typeof value.dispose === 'function')
                    {
                        value.dispose()
                    }
                }
            }
        })

        this.camera.controls.dispose()
        this.renderer.instance.dispose()

        instance = null
    }
}