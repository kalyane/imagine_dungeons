import Experience from '../Experience.js'
import EventEmitter from '../Utils/EventEmitter.js'
import * as THREE from '/build/three.module.js'
import Fox from './Fox.js'
import Cleric from './Models/Cleric.js'
import Ranger from './Models/Ranger.js'
import Rogue from './Models/Rogue.js'
import Warrior from './Models/Warrior.js'
import Zombie from './Zombie.js'
import Wall from './Wall.js'
import KeyboardInput from '../Utils/KeyboardInput.js'
import AIInput from '../Utils/AIInput.js'
import RandomInput from '../Utils/RandomInput.js'

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
        this.objects = []
        this.objectsFull = []
        this.playing = false
        this.assets = []

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

            this.dictModels = {}

            this.gridSize = {'x':50,'z':50}
            this.map = []

            // grid helper
            const gridHelper = new THREE.GridHelper(50, 10, 0x000000, 0xffffff)
            this.scene.add(gridHelper)

            // ground
            const groundGeo = new THREE.PlaneGeometry(50,50)
            const groundMat = new THREE.MeshPhongMaterial({color: 0x00ff00})
            groundGeo.rotateX( - Math.PI / 2)

            const ground = new THREE.Mesh(groundGeo, groundMat)
            this.scene.add(ground)
            ground.receiveShadow = true

            const dControls = new DragControls(this.objects, this.experience.camera.instance, this.experience.canvas)

            dControls.addEventListener('dragstart', (event) =>
            {
                this.experience.camera.controls.enabled = false
                for (var key in this.dictModels){
                    this.dictModels[key].boxHelper.visible = false
                }
                this.dictModels[event.object.userData].boxHelper.visible = true
                //window.document.querySelector("#name").value = event.object.userData
                event.object.material.opacity = 0.33
                var vector = new THREE.Vector3(); 
                this.dictModels[event.object.userData].model.getWorldDirection(vector)
            })

            dControls.addEventListener('dragend', (event) =>
            {
                this.experience.camera.controls.enabled = true
                event.object.material.opacity = 0
                //this.dictModels[event.object.userData].boxHelper.visible = false
            })

            dControls.addEventListener('drag', (event) =>
            {
                event.object.position.x = Math.floor(event.object.position.x)
                event.object.position.z = Math.floor(event.object.position.z)
                event.object.position.y = 0

                var bb = this.calculateExactBoundingBox(event.object)
                var gridPosition = this.translatePositionToGrid(bb)

                if (this.checkCollisions(event.object, this.objectsFull)){
                    // if not valid, copy previous valid position
                    //console.log("moving", this.model.position, "to", this.previousPosition)
                    var ele = 0
                    while (this.checkCollisions(event.object, this.objectsFull)){
                        console.log(event.object.position)
                        var positions = this.dictModels[event.object.userData].previousPosition
                        event.object.position.copy(positions[ele])
                        ele += 1
                    }
                }else{
                    // saves new valid position
                    this.dictModels[event.object.userData].previousPosition.push(event.object.position)
                    //console.log(this.previousPosition)
                }

                // if (!this.checkValidPosition(gridPosition)){
                //     event.object.position.copy(this.dictModels[event.object.userData].previousPosition)
                // }else{
                //     this.dictModels[event.object.userData].previousPosition.copy(event.object.position)
                // }

                //var subtractX = event.object.geometry.boundingBox.min.x
                //var subtractZ = event.object.geometry.boundingBox.min.z

                //if(position.min.x < this.gridSize['x']/-2) event.object.position.x = this.gridSize['x']/-2 - subtractX
                //if(position.max.x > this.gridSize['x']/2) event.object.position.x = this.gridSize['x']/2 + subtractX

                //if(position.min.z < this.gridSize['z']/-2) event.object.position.z = this.gridSize['z']/-2 - subtractZ
                //if(position.max.z > this.gridSize['z']/2) event.object.position.z = this.gridSize['z']/2 + subtractZ
                
            })

            dControls.addEventListener('hoveron')

            this.generateBoundaries()

            this.trigger("ready")
        })
        
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

        this.trigger("classified")
    }

    generateSolidMatrix(){
        this.matrix = []

        // loop through the rows in the matrix
        for (let i = 0; i < this.gridSize.x; i++) {
            // loop through the columns in the matrix
            this.matrix.push([])
            for (let j = 0; j < this.gridSize.z; j++) {
                // set the cell in the matrix to 1
                this.matrix[i][j] = 1;
            }
        }

        // loop through each square in the array
        for (let solid of this.solids) {
            // get the bounding box for the square
            let bb = solid.modelDragBox.geometry.boundingBox
            let [minX, maxX, minY, maxY] = getSquareBoundingBox(square);

            // loop through the x-coordinates in the bounding box
            for (let x = minX; x <= maxX; x++) {
                // loop through the y-coordinates in the bounding box
                for (let y = minY; y <= maxY; y++) {
                    // set the cell in the matrix to 0
                    matrix[x][y] = 0;
                }
            }
        }
    }

    boundingBoxToPosition(bb){
        var x = (bb.min.x+(bb.max.x-bb.min.x))/2-this.gridSize.x/2-1
        var z = (bb.min.z+(bb.max.z-bb.min.z))/2-this.gridSize.z/2-1
        return {'x':x,'z':z}
    }

    checkValidPosition(pos){
        // check all posible places it covers and they need to be free
        var position = {...pos}
        if (position.min.x<0 || position.min.z<0){
            return false
        }
        var maxX = this.gridSize.x*2+2
        var maxZ = this.gridSize.z*2+2
        if (position.max.x>maxX || position.max.z>maxZ){
            return false
        }
        for(var x=Math.round(position.min.x); x<Math.round(position.max.x); x++) {
            for(var z=Math.round(position.min.z); z<Math.round(position.max.z); z++) {
                if (this.matrix[x][z]){
                    return false
                }
            }
        }
        return true
    }

    update()
    {
        for (var key in this.dictModels){
            this.dictModels[key].update()
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
        this.objects.push(this.dictModels[name].modelDragBox)
        this.objectsFull.push(this.dictModels[name])

        this.assets.push(this.dictModels[name])
    }


    // calculateBoundaries()
    // {
    //     this.matrix = [];
    //     for(var i=0; i<100; i++) {
    //         this.matrix[i] = [];
    //         for(var j=0; j<100; j++) {
    //             this.matrix[i][j] = 0;
    //         }
    //     }
    //     var bounding = this.solid[0].modelDragBox.geometry.boundingBox
    //     var newX = this.solid[0].modelDragBox.position.x+25
    //     var newZ = this.solid[0].modelDragBox.position.z+25
    //     var maxX = Math.max(newX+bounding.max.x, newX+bounding.min.x)
    //     var minX = Math.min(newX+bounding.max.x, newX+bounding.min.x)
    //     var maxZ = Math.max(newZ+bounding.max.z, newZ+bounding.min.z)
    //     var minZ = Math.min(newZ+bounding.max.z, newZ+bounding.min.z)

    //     for(var i=minX*2; i<maxX*2; i++) {
    //         for(var j=minZ*2; j<maxZ*2; j++) {
    //             this.matrix[i][j] = 1;
    //         }
    //     }

    // }

    calculateExactBoundingBox(box){
        var bounding = {...box.geometry.boundingBox}
        
        var maxX = box.position.x+bounding.max.x
        var minX = box.position.x+bounding.min.x
        var maxZ = box.position.z+bounding.max.z
        var minZ = box.position.z+bounding.min.z

        return {'max':{'x':maxX, 'z':maxZ}, 'min':{'x':minX, 'z':minZ}}
    }

    translatePositionToGrid(position){
        var pos = {...position}
        pos.max.x = (pos.max.x+this.gridSize.x/2)*2 + 1
        pos.max.z = (pos.max.z+this.gridSize.z/2)*2 + 1
        pos.min.x = (pos.min.x+this.gridSize.x/2)*2 + 1
        pos.min.z = (pos.min.z+this.gridSize.z/2)*2 + 1
        
        return pos
    }

    checkCollisions(box, objects)
    {
        // manually calculate intersection
        let modelBox = new THREE.Box3();
        modelBox.copy(box.geometry.boundingBox);
        modelBox.applyMatrix4(box.matrixWorld);

        for(var i=0; i<objects.length; i++) {
            var otherModel = objects[i]
            let otherBox = new THREE.Box3();
            otherBox.copy(otherModel.modelDragBox.geometry.boundingBox);
            otherBox.applyMatrix4(otherModel.modelDragBox.matrixWorld);
            if (box.userData == otherModel.modelDragBox.userData){
                continue
            }
            if (modelBox.intersectsBox(otherBox)){
                return true
            }
        }
        return false
    }
}