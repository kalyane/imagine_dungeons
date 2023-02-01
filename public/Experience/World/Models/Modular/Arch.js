import Modular from './Modular.js'
import * as THREE from '/build/three.module.js'

export default class Arch extends Modular
{
    static asset_name = 'arch'
    constructor(unique_name)
    {
        super()

        this.unique_name = unique_name

        // Resource
        this.resource = this.resources.items[this.constructor.asset_name]

        this.preSetModel()
    }

    preSetModel(){
        // creates a copy of the original model
        this.model = this.resource.scene.clone()

        this.model.scale.set(2,2,2)

        // creates a box to cover the model
        const boxGeo = new THREE.BoxGeometry(8, 8, 2)
        boxGeo.applyMatrix4( new THREE.Matrix4().makeTranslation( 0, 4, 0 ) )
        this.modelDragBox = new THREE.Mesh(
            boxGeo,
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
        )
        this.modelDragBox.geometry.computeBoundingBox()

        this.setModel()

        // dealing with the space player can pass
        this.separateBoxes = []

        const box1 = new THREE.BoxGeometry(2, 8, 2)
        box1.applyMatrix4( new THREE.Matrix4().makeTranslation( 3, 4, 0 ) )
        const meshBox1 = new THREE.Mesh(
            box1,
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
        )
        meshBox1.geometry.computeBoundingBox()

        const box2 = new THREE.BoxGeometry(2, 8, 2)
        box2.applyMatrix4( new THREE.Matrix4().makeTranslation( -3, 4, 0 ) )
        const meshBox2 = new THREE.Mesh(
            box2,
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
        )
        meshBox2.geometry.computeBoundingBox()

        this.scene.add(meshBox1)
        this.scene.add(meshBox2)

        this.separateBoxes.push(meshBox1)
        this.separateBoxes.push(meshBox2)
    }
}