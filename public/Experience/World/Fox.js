import * as THREE from '/build/three.module.js'
import Experience from '../Experience.js'
import * as SkeletonUtils from '/jsm/utils/SkeletonUtils.js'


export default class Fox
{
    constructor(name)
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.name = name

        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('fox')
        }

        // Resource
        this.resource = this.resources.items.foxModel

        this.setModel()
        this.setAnimation()
    }

    setModel()
    {
        const originalModel = this.resource.scene
        this.model = SkeletonUtils.clone( originalModel );

        this.model.scale.set(0.04, 0.04, 0.04)
        this.model.userData = this.name
        this.scene.add(this.model)

        this.model.traverse((child) =>
        {
            if (child instanceof THREE.Group) {
                this.modelGroup = child
            }
            if(child instanceof THREE.Mesh)
            {
                child.castShadow = true
            }
        })

        const boxGeo = new THREE.BoxGeometry(1, 3, 5)
        boxGeo.applyMatrix4( new THREE.Matrix4().makeTranslation( 0, 1.5, 0 ) )

        this.modelDragBox = new THREE.Mesh(
            boxGeo,
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
        )
        this.modelDragBox.userData = this.name
        this.scene.add(this.modelDragBox)

        this.boxHelper = new THREE.BoxHelper(this.modelDragBox, 0xffff00)
        this.boxHelper.visible = false
        this.boxHelper.userData = this.name
        this.scene.add(this.boxHelper)
    }

    setAnimation()
    {
        this.animation = {}
        
        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model)
        
        // Actions
        this.animation.actions = {} 
        
        this.animation.actions.idle = this.animation.mixer.clipAction(this.resource.animations[0])
        this.animation.actions.walking = this.animation.mixer.clipAction(this.resource.animations[1])
        this.animation.actions.running = this.animation.mixer.clipAction(this.resource.animations[2])

        //console.log("fox",this.animation.actions.idle)
        
        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

        // Play the action
        this.animation.play = (name) =>
        {
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current

            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, 1)

            this.animation.actions.current = newAction
        }

        // Debug
        if(this.debug.active)
        {
            const debugObject = {
                playIdle: () => { this.animation.play('idle') },
                playWalking: () => { this.animation.play('walking') },
                playRunning: () => { this.animation.play('running') }
            }
            this.debugFolder.add(debugObject, 'playIdle')
            this.debugFolder.add(debugObject, 'playWalking')
            this.debugFolder.add(debugObject, 'playRunning')
        }
    }

    update()
    {
        this.animation.mixer.update(this.time.delta * 0.001)
        this.modelGroup.position.copy(this.modelDragBox.position)
        this.modelGroup.rotation.copy(this.modelDragBox.rotation)
        this.boxHelper.update()
    }

    delete()
    {
        this.scene.remove(this.model)
        this.scene.remove(this.modelDragBox)
        this.scene.remove(this.boxHelper)
    }
}