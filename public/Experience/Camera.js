import * as THREE from '/build/three.module.js'
import Experience from './Experience.js'
import { OrbitControls } from '/jsm/controls/OrbitControls.js'

import { GUI } from 'dat.gui'

export default class Camera
{
    constructor()
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas
        this.resources = this.experience.resources

        this.setInstance()
        
        if (this.experience.playing){
            this.currentPosition = new THREE.Vector3()
            this.currentLookat = new THREE.Vector3()

            //this.instance.position.set(-2, 10, 6)
            
        } else {
            // when editing, user can use orbit controls
            this.setControls()
        }

        // wait until all models are classified
        this.experience.world.on('classified', () => {
            // gets player model
            this.player = this.experience.world.player.model
        });

        this.idealOffset = new THREE.Vector3(-3, 8, -12)
        this.idealLookat = new THREE.Vector3(-3, 0, 9)
        
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 1000)
        this.instance.position.set(30, 30, 30)
        this.scene.add(this.instance)
    }
    
    setControls()
    {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
    }

    // a little distance between camera and player
    offset()
    {
        const idealOffset = new THREE.Vector3().copy(this.idealOffset)
        idealOffset.applyQuaternion(this.player.quaternion)
        idealOffset.add(this.player.position)

        return idealOffset
    }

    // direction camera looks at
    lookat()
    {
        const idealLookat = new THREE.Vector3().copy(this.idealLookat)
        idealLookat.applyQuaternion(this.player.quaternion)
        idealLookat.add(this.player.position)

        return idealLookat
    }

    // cameras follows the player
    followPlayer()
    {
        const idealOffset = this.offset()
        const idealLookat = this.lookat()

        this.currentPosition.copy(idealOffset)
        this.currentLookat.copy(idealLookat)
        this.instance.position.copy(this.currentPosition)
        this.instance.lookAt(this.currentLookat)
    }

    // when size of the screen changes, this function is triggered
    resize()
    {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update()
    {
        if (this.experience.playing){
            if (this.player){
                //this.followPlayer()
            }
        } else {
            this.controls.update()
        }
    }
}