import Experience from '../Experience.js'
import EventEmitter from '../Utils/EventEmitter.js'
import * as THREE from '/build/three.module.js'
import Fox from './Fox.js'
import Warrior from './Warrior.js'
import Zombie from './Zombie.js'
import Wall from './Wall.js'
import KeyboardInput from '../Utils/KeyboardInput.js'
import AIInput from '../Utils/AIInput.js'
import RandomInput from '../Utils/RandomInput.js'

import { DragControls } from 'three/examples/jsm/controls/DragControls'


export default class Map
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene

        // size of the map is a rectangle
        // deafault is 50 x 50
        this.sizeX = 50
        this.sizeZ = 50

        // create empty map
        this.generateMap()
    }

    generateMap(){
        // the map is a grid
        this.grid = []
        // the size of the grid is twice the map units
        // or each unit in the grid represents 0.5 unit in the scene
        var highX = this.sizeX*2 + 2 // increment an extra unit to represent border
        var highZ = this.sizeZ*2 + 2

        for(var x=0; x<highX; x++) {
            this.grid[x] = [];
            for(var z=0; z<highZ; z++) {
                if (x==0 || z==0 || x==highX || z==highZ){
                    this.grid[x][z] = true;
                }
                this.grid[x][z] = false;
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

    generateBoundaries(){
        this.matrix = []
        var highX = this.gridSize.x*2+2
        var highZ = this.gridSize.z*2+2
        for(var x=0; x<highX; x++) {
            this.matrix[x] = [];
            for(var z=0; z<highZ; z++) {
                if (x==0 || z==0 || x==highX || z==highZ){
                    this.matrix[x][z] = true;
                }
                this.matrix[x][z] = false;
            }
        }
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
}