import * as THREE from '/build/three.module.js'
import * as SkeletonUtils from '/jsm/utils/SkeletonUtils.js'
import AIInput from '../Utils/AIInput.js'
import RandomInput from '../Utils/RandomInput.js'
import Character from './Character.js'

export default class Zombie extends Character
{
    constructor(name)
    {
        super('zombieModel', name)
        this.setControl(new RandomInput())
        this.preSetModel()
        
        // set animations in the right order
        this.setAnimation(
            this.resource.animations[2], // idle
            this.resource.animations[3], // walk - TODO: change animation for in place
            this.resource.animations[0], // attack
            this.resource.animations[1] // death
        )

        this.control.on('newState', () =>
        {
            if (this.experience.world.playing && this.life > 0){
                this.updateState()
            }
        })
    }

    preSetModel(){
        // creates a copy of the original model
        const originalModel = this.resource.scene
        this.model = SkeletonUtils.clone( originalModel )
        this.model.scale.set(2, 2, 2)

        // creates a box to cover the model
        const boxGeo = new THREE.BoxGeometry(2, 4, 2)
        boxGeo.applyMatrix4( new THREE.Matrix4().makeTranslation( 0, 2, 0 ) )
        this.modelDragBox = new THREE.Mesh(
            boxGeo,
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
        )
        this.modelDragBox.geometry.computeBoundingBox()

        this.setModel()
    }

}