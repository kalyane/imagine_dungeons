import * as THREE from '/build/three.module.js'

import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Resources from './Utils/Resources.js'

import sources from './sources.js'

import { GUI } from 'dat.gui'

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

        //this.scene.background = new THREE.Color('#222222');

        // this.scene.fog = new THREE.Fog(new THREE.Color('#222222'), 1, 10);

        this.scene.background = new THREE.Color(0xb0b16);

        /*

        var params = {
            color: 0xb0b16
        };
        
        var gui = new GUI();
        
        var folder = gui.addFolder( 'MATERIAL' );
        
        folder.addColor(params, 'color')
            .onChange(() => this.scene.background.set(params.color));
        
        folder.open();
        */

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
        this.world.generateSolidMatrix()
        this.world.player.setPlayerControl()
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