import * as THREE from '/build/three.module.js'
import Experience from '../Experience.js'

export default class Sword
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('sword')
        }

        // Resource
        this.resource = this.resources.items.swordModel

        this.setModel()
    }

    setModel()
    {
        this.model = this.resource.scene
        //this.model.scale.set(0.02, 0.02, 0.02)
        this.scene.add(this.model)

        this.model.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                child.castShadow = true
            }
        })
    }
}