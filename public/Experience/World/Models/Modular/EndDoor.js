import Modular from './Modular.js'
import * as THREE from '/node_modules/three/build/three.module.js'

export default class EndDoor extends Modular
{
    static asset_name = 'end_door'
    constructor(unique_name)
    {
        super()

        this.unique_name = unique_name

        // Resource
        this.resource = this.resources.items[this.constructor.asset_name]

        this.preSetModel()

        this.exit = true;
    }

    preSetModel(){
        // creates a copy of the original model
        this.model = this.resource.scene.clone()

        this.model.scale.set(2,2,2)

        // creates a box to cover the model
        const boxGeo = new THREE.BoxGeometry(5, 6.5, 1)
        boxGeo.applyMatrix4( new THREE.Matrix4().makeTranslation( 2.5, 3.25, 0 ) )
        this.modelDragBox = new THREE.Mesh(
            boxGeo,
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
        )
        this.modelDragBox.geometry.computeBoundingBox()

        this.setModel()
    }

    interact(){
        this.modelDragBox.rotateY(0.05)
        this.experience.gameOver = true
    }
}