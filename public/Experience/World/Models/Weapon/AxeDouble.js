import Weapon from './Weapon.js'
import * as THREE from '/node_modules/three/build/three.module.js'

export default class AxeDouble extends Weapon
{
    static asset_name = 'axe_double'
    constructor(unique_name)
    {
        super()

        this.unique_name = unique_name

        this.attack = true
        this.strength = 20

        // Resource
        this.resource = this.resources.items[this.constructor.asset_name]

        this.preSetModel()
    }

    preSetModel(){
        // creates a copy of the original model
        this.model = this.resource.scene.clone()

        // creates a box to cover the model
        const boxGeo = new THREE.BoxGeometry(2, 6.5, 1)
        boxGeo.applyMatrix4( new THREE.Matrix4().makeTranslation( 0, 3.25, 0 ) )
        this.modelDragBox = new THREE.Mesh(
            boxGeo,
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
        )
        this.modelDragBox.geometry.computeBoundingBox()

        this.offsetRot = new THREE.Vector3(-3.9, -0.2, -2);
        this.offsetPos = new THREE.Vector3(-61, -7.21, 43);

        this.setModel()
    }
}