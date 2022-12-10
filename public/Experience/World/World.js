import Experience from '../Experience.js'
import EventEmitter from '../Utils/EventEmitter.js'
import * as THREE from '/build/three.module.js'
import Fox from './Fox.js'
import Cleric from './Models/Cleric.js'
import Ranger from './Models/Ranger.js'
import Rogue from './Models/Rogue.js'
import Warrior from './Models/Warrior.js'
import Zombie from './Zombie.js'
import Wall from './Models/Wall.js'

import { DragControls } from '/jsm/controls/DragControls.js'

export default class World extends EventEmitter
{
    constructor()
    {
        super()
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.player;
        this.enemies = [];
        this.solids = []
        this.assets = []
        this.assetsDragBox = []
        this.dictModels = {}
        // this should change by the user
        this.gridSize = {'x':50,'z':50}
        // grid helper, needs to change based on world size
        this.gridHelper = new THREE.GridHelper(50, 10, 0x000000, 0xffffff)
        this.scene.add(this.gridHelper)

        // Wait for resources
        this.resources.on('ready', () =>
        {
            // Setup
            this.modelClasses = {
                "fox": Fox,
                "zombie": Zombie,
                "wall" : Wall,
                "cleric": Cleric,
                "ranger": Ranger,
                "rogue": Rogue,
                "warrior": Warrior
            }

            // if not playing user can drag objects
            if (!this.experience.playing){
                this.setDragControl()
            }
            
            this.trigger("ready")
        })
        
    }

    setDragControl(){
        this.dragControls = new DragControls(this.assetsDragBox, this.experience.camera.instance, this.experience.canvas)

        this.dragControls.addEventListener('dragstart', (event) =>
        {
            // stop orbitControls
            this.experience.camera.controls.enabled = false

            // make all box helped invisible, except the one that is being dragged
            for (var key in this.dictModels){
                this.dictModels[key].boxHelper.visible = false
            }
            this.dictModels[event.object.userData].boxHelper.visible = true
            
            // change opacity to make it evident that asset is being dragged
            event.object.material.opacity = 0.33
        })

        this.dragControls.addEventListener('dragend', (event) =>
        {
            // allow orbit control
            this.experience.camera.controls.enabled = true
            // change opacity to indicate drag stopped
            event.object.material.opacity = 0
        })

        // when dragging
        this.dragControls.addEventListener('drag', (event) =>
        {
            // make object position in a discrete space, only intergers
            event.object.position.x = Math.floor(event.object.position.x)
            event.object.position.z = Math.floor(event.object.position.z)
            // the y direction is fixed
            event.object.position.y = 0

            this.checkBoundaries(event.object)
            
        })

        // maybe add this in the future?
        //this.dragControls.addEventListener('hoveron')
    }

    checkBoundaries(object){
        var bb = this.calculateExactBoundingBox(object)
            
        var subtractX = object.geometry.boundingBox.min.x
        var subtractZ = object.geometry.boundingBox.min.z

        // don't allow user to place asset outside grid
        if(bb.min.x < this.gridSize['x']/-2) object.position.x = this.gridSize['x']/-2 - subtractX
        if(bb.max.x > this.gridSize['x']/2) object.position.x = this.gridSize['x']/2 + subtractX

        if(bb.min.z < this.gridSize['z']/-2) object.position.z = this.gridSize['z']/-2 - subtractZ
        if(bb.max.z > this.gridSize['z']/2) object.position.z = this.gridSize['z']/2 + subtractZ
    }

    

    classifyAssets(){
        for (var i=0; i < this.assets.length; i++){
            if (this.assets[i].type == "player"){
                this.player = this.assets[i]
            }
            if (this.assets[i].type == "enemy"){
                this.enemies.push(this.assets[i])
            }
            if (this.assets[i].type == "solid"){
                this.solids.push(this.assets[i])
            }
        }
    }
    
    addModel(modelName, name = null)
    {
        const model = this.modelClasses[modelName]
        if (name == null){
            name = modelName
            let count = 0
            while (name in this.dictModels){
                count += 1
                name = modelName + "." + count
            }
        }

        this.dictModels[name] = new model(modelName, name)
        this.assetsDragBox.push(this.dictModels[name].modelDragBox)
        this.assets.push(this.dictModels[name])
    }

    generateSolidMatrix(){
        this.matrix = []

        // loop through the rows in the matrix
        for (let i = 0; i < this.gridSize.x*2; i++) {
            // loop through the columns in the matrix
            this.matrix.push([])
            for (let j = 0; j < this.gridSize.z*2; j++) {
                // set the cell in the matrix to 1
                this.matrix[i][j] = 1;
            }
        }

        // loop through each square in the array
        for (let solid of this.solids) {
            let bb = solid.modelDragBox.geometry.boundingBox
            var maxX = Math.round(solid.modelDragBox.position.x+bb.max.x+this.experience.world.gridSize.x/2)
            var minX = Math.round(solid.modelDragBox.position.x+bb.min.x+this.experience.world.gridSize.x/2)
            var maxZ = Math.round(solid.modelDragBox.position.z+bb.max.z+this.experience.world.gridSize.x/2)
            var minZ = Math.round(solid.modelDragBox.position.z+bb.min.z+this.experience.world.gridSize.x/2)

            // loop through the x-coordinates in the bounding box
            for (let x = minX*2; x <= maxX*2; x++) {
                // loop through the y-coordinates in the bounding box
                for (let z = minZ*2; z <= maxZ*2; z++) {
                    // set the cell in the matrix to 0
                    this.matrix[x][z] = 0;
                }
            }
        }
    }

    checkCollision(asset1, asset2) {
        // Get the bounding box of each square using Three.js
        const bb1 = asset1.modelDragBox.geometry.boundingBox
        const bb2 = asset2.modelDragBox.geometry.boundingBox
      
        // Check if the bounding boxes overlap in the x and y directions
        if (bb1.min.x < bb2.max.x && bb1.max.x > bb2.min.x &&
            bb1.min.y < bb2.max.y && bb1.max.y > bb2.min.y) {
          // There is a collision
          return true;
        } else {
          // There is no collision
          return false;
        }
      }

    calculateExactBoundingBox(box){
        // calculates bounding box relative to the world position
        var bounding = {...box.geometry.boundingBox}
        
        var maxX = box.position.x+bounding.max.x
        var minX = box.position.x+bounding.min.x
        var maxZ = box.position.z+bounding.max.z
        var minZ = box.position.z+bounding.min.z

        return {'max':{'x':maxX, 'z':maxZ}, 'min':{'x':minX, 'z':minZ}}
    }

    update()
    {
        for (var key in this.dictModels){
            this.dictModels[key].update()
        }
    }
}