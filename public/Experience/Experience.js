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
    }

    // set the main attributes that doesn't change when reset
    setAttributes(assets = null, gridSize = {'x':50,'z':50}, fog = {'near': 10, 'far': 50}, playing = false, user_input = true){
        // true if playing, false if editing
        this.playing = playing
        // if user can send keyboard input
        this.user_input = user_input

        this.gridSize = gridSize

        this.resources = new Resources(sources)
        this.world = new World(assets)

        if (this.playing){
            this.scene.fog = new THREE.Fog(new THREE.Color('#222222'), fog.near, fog.far);
        }

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
        var health = document.getElementById("life");
        health.innerHTML = this.world.player.life

        var xp = document.getElementById("xp");
        xp.innerHTML = this.world.player.xp

        var level = document.getElementById("level");
        level.innerHTML = this.world.player.level

        var defense = document.getElementById("defense");
        defense.innerHTML = this.world.player.defense_weapon.strength ? this.world.player.defense_weapon.strength : 0;

        var attack = document.getElementById("attack");
        attack.innerHTML = this.world.player.attack_weapon.strength ? this.world.player.attack_weapon.strength : 0;

        var time = document.getElementById("time");
        time.innerHTML = this.time.elapsed

        
        if (this.gameOver) {
            this.ready = false
            if (this.user_input){
                var container = document.getElementById("game_over_container");
                container.className = '';
                var over = document.getElementById("over");
                if (this.world.player.controls.dead){
                    over.innerHTML = "You Lost"
                    container.classList.add("lose")
                } else if (this.world.type_win == this.world.possible_win.none) {
                    over.innerHTML = "No Way to Win"
                    container.classList.add("no_way")

                    this.messages.push({text: "There is no way to win the game. Add an end_door or monsters.", type: "error", button: {text: "Back to Editing", href: "/games/edit/"+window.game._id}})
                    this.trigger("message")
                } else {
                    over.innerHTML = "You Won"
                    container.classList.add("win")
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