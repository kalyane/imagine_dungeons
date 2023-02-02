import * as THREE from '/node_modules/three/build/three.module.js'

import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Resources from './Utils/Resources.js'

import sources from './sources.js'

let instance = null

export default class Experience
{
    constructor(_canvas, gridSize = {'x':50,'z':50}, playing = false)
    {
        // Singleton
        if(instance)
        {
            return instance
        }
        instance = this

        // Options
        this.canvas = _canvas
        this.playing = playing

        // Setup
        this.sizes = new Sizes(_canvas)
        this.time = new Time()
        this.scene = new THREE.Scene()

        this.gridSize = gridSize

        this.gameOver = false

        if (this.playing){
            this.scene.fog = new THREE.Fog(new THREE.Color('#222222'), 10, 50);
        }

        this.scene.background = new THREE.Color(0xb0b16);

        let light = new THREE.AmbientLight( 0x444444 , 2);
        this.scene.add(light);

        this.resources = new Resources(sources)
        
        this.world = new World(gridSize)
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

    startPlaying(){
        this.world.classifyAssets()
        this.world.player.setControl()
        for (let monster of this.world.monsters){
            monster.setControl()
        }
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

        if (this.playing && document.getElementById("ready").innerHTML == "true"){
            this.updateMetrics()
        }
    }

    updateMetrics(){
        var health = document.getElementById("health");
        health.innerHTML = this.world.player.life

        var xp = document.getElementById("xp");
        xp.innerHTML = this.world.player.xp

        var level = document.getElementById("level");
        level.innerHTML = this.world.player.level

        var defense = document.getElementById("defense");
        // TODO: add the defense from shields

        var attack = document.getElementById("attack");
        attack.innerHTML = this.world.player.strength

        var time = document.getElementById("time");
        time.innerHTML = this.time.elapsed

        var over = document.getElementById("over");
        if (this.gameOver) {
            if (this.world.player.controls.dead){
                over.innerHTML = "lose"
            } else {
                over.innerHTML = "win"
            }
        }
        else {
            over.innerHTML = this.gameOver
        }
        
        // TODO: when player wins game
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

    }
}