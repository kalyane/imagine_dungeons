import Experience from '../Experience.js'
import EventEmitter from '../Utils/EventEmitter.js'
import * as THREE from '/node_modules/three/build/three.module.js'
import Floor from './Floor.js'

// modular
import Wall from './models/Modular/Wall.js'
import Fence90 from './models/Modular/Fence90.js'
import FenceEnd from './models/Modular/FenceEnd.js'
import FenceStraight from './models/Modular/FenceStraight.js'
import ColumnSquare from './models/Modular/ColumnSquare.js'
import ColumnCircle from './models/Modular/ColumnCircle.js'
import Arch from './models/Modular/Arch.js'
import EndDoor from './models/Modular/EndDoor.js'
import ArchBars from './models/Modular/ArchBars.js'

// player
import Rogue from './models/Player/Rogue.js'
import Cleric from './models/Player/Cleric.js'
import Ranger from './models/Player/Ranger.js'

// monster
import Alien from './models/Monster/Alien.js'
import AlienTall from './models/Monster/AlienTall.js'
import Bat from './models/Monster/Bat.js'
import Cthulhu from './models/Monster/Cthulhu.js'
import Cyclops from './models/Monster/Cyclops.js'
import Demon from './models/Monster/Demon.js'
import Ghost from './models/Monster/Ghost.js'
import GreenDemon from './models/Monster/GreenDemon.js'
import YellowDragon from './models/Monster/YellowDragon.js'
import Yeti from './models/Monster/Yeti.js'

// lights
import Torch from './models/Light/Torch.js'
import Woodfire from './models/Light/Woodfire.js'

// decor
import Banner from './Models/Decor/Banner.js'
import Barrel from './Models/Decor/Barrel.js'
import Chair from './Models/Decor/Chair.js'
import Crate from './Models/Decor/Crate.js'
import StatueHorse from './Models/Decor/StatueHorse.js'
import TableBig from './Models/Decor/TableBig.js'
import TableSmall from './Models/Decor/TableSmall.js'

// weapons
import Sword from './Models/Weapon/Sword.js'
import SwordBig from './Models/Weapon/SwordBig.js'
import SwordGolden from './Models/Weapon/SwordGolden.js'
import Axe from './Models/Weapon/Axe.js'
import AxeDouble from './Models/Weapon/AxeDouble.js'
import AxeSmall from './Models/Weapon/AxeSmall.js'
import Claymore from './Models/Weapon/Claymore.js'
import Dagger from './Models/Weapon/Dagger.js'
import Hammer from './Models/Weapon/Hammer.js'
import Scythe from './Models/Weapon/Scythe.js'
import ShieldCeltic from './Models/Weapon/ShieldCeltic.js'
import ShieldHeater from './Models/Weapon/ShieldHeater.js'
import ShieldRound from './Models/Weapon/ShieldRound.js'

// controls
import { DragControls } from '/node_modules/three/examples/jsm/controls/DragControls.js'
import { TransformControls } from '/node_modules/three/examples/jsm/controls/TransformControls.js'

export default class World extends EventEmitter
{
    constructor(assetsDB)
    {
        super()
        this.assetsDB = assetsDB;
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.canvas = this.experience.canvas

        this.player = null;
        this.monsters = [];
        this.weapons = [];
        this.solidModels = []
        this.assets = []
        this.assetsDragBox = []
        this.interactables = []
        this.interactableModels = []
        this.dictModels = {}

        this.gridSize = this.experience.gridSize

        this.possible_win = {
            none: "none",
            kill_all_monsters: "kill_all_monsters",
            find_exit: "find_exit"
        }

        this.type_win = this.possible_win.none

        // direction vectors 360 degrees
        this.directions = []
        for (let i = 0; i < 360; i += 3) {
            this.directions.push(new THREE.Vector3(Math.cos(i), 0, Math.sin(i)));
        }

        this.map = new Map()
        this.floor = new Floor()

        // Wait for resources
        this.resources.on('ready', () =>
        {
            // Setup
            this.modelClasses = {
                // modular
                "wall" : Wall,
                "fence_90" : Fence90,
                "fence_end" : FenceEnd,
                "fence_straight" : FenceStraight,
                "column_square" : ColumnSquare,
                "column_circle" : ColumnCircle,
                "arch" : Arch,
                "end_door" : EndDoor,
                "arch_bars" : ArchBars,

                // light
                "torch" : Torch,
                "woodfire" : Woodfire,

                // player
                "rogue" : Rogue,
                "cleric" : Cleric,
                "ranger" : Ranger,

                // monster
                "alien" : Alien,
                "alien_tall" : AlienTall,
                "bat" : Bat,
                "cthulhu" : Cthulhu,
                "cyclops" : Cyclops,
                "demon" : Demon,
                "ghost" : Ghost,
                "green_demon" : GreenDemon,
                "yellow_dragon" : YellowDragon,
                "yeti" : Yeti,

                // object
                "banner" : Banner,
                "barrel" : Barrel,
                "chair" : Chair,
                "crate" : Crate,
                "statue_horse" : StatueHorse,
                "table_big" : TableBig,
                "table_small" : TableSmall,

                // weapon
                "sword" : Sword,
                "sword_big" : SwordBig,
                "sword_golden" : SwordGolden,
                "axe" : Axe,
                "axe_double" : AxeDouble,
                "axe_small" : AxeSmall,
                "claymore" : Claymore,
                "dagger" : Dagger,
                "hammer" : Hammer,
                "scythe" : Scythe,
                "shield_celtic" : ShieldCeltic,
                "shield_heater" : ShieldHeater,
                "shield_round" : ShieldRound
            }
            
            this.trigger("ready")
        })
        
    }

    setTransformControl(){
        // creating transform controls to use when editing the assets
        this.transformControls = new TransformControls(this.experience.camera.instance, this.canvas);
        this.scene.add(this.transformControls);

        this.setRotate()

        this.transformControls.addEventListener('change', () => {
            if (this.transformControls.object) {
                // stop orbitControls
                this.experience.camera.controls.enabled = false;
                this.trigger("start_transform");
            } else {
                this.experience.camera.controls.enabled = true;
                this.trigger("stop_transform");
            }
        });

        window.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyG':
                    this.setTranslate()
                    break
                case 'KeyR':
                    this.setRotate()
                    break
            }
        })

        this.canvas.addEventListener('mousedown', (event) => this.onMouseDown(event), false);
    }

    setTranslate(){
        this.transformControls.setMode('translate')
        this.transformControls.setTranslationSnap(0.5)
        this.transformControls.showY = false;
        this.transformControls.showZ = true;
        this.transformControls.showX = true;
    }

    setRotate(){
        this.transformControls.setMode('rotate')
        this.transformControls.setRotationSnap(Math.PI/2);
        this.transformControls.showY = true;
        this.transformControls.showZ = false;
        this.transformControls.showX = false;
    }

    setDragControl(){
        this.dragControls = new DragControls(this.assetsDragBox, this.experience.camera.instance, this.canvas)

        this.dragControls.addEventListener('dragstart', (event) =>
        {
            // change opacity to make it evident that asset is being dragged
            event.object.material.opacity = 0.33
        })

        this.dragControls.addEventListener('dragend', (event) =>
        {
            // change opacity to indicate drag stopped
            event.object.material.opacity = 0
        })

        // when dragging
        this.dragControls.addEventListener('drag', (event) =>
        {
            // make object position in a discrete space, only intergers
            event.object.position.x = this.roundToHalf(event.object.position.x)
            event.object.position.z = this.roundToHalf(event.object.position.z)
            // the y direction is fixed
            event.object.position.y = 0

            this.checkBoundaries(event.object)
            
        })
    }

    onMouseDown(event) {
        let raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();
        //this.transformControls.attach(this.assetsDragBox[0]);
        // update the mouse variable
        var rect = this.canvas.getBoundingClientRect();
        mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
        mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;
    
        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, this.experience.camera.instance);
    
        // calculate objects intersecting the picking ray
        var intersects = raycaster.intersectObjects(this.assetsDragBox);
    
        if (intersects.length === 0 && !this.transformControls.dragging) {
            for (var key in this.dictModels){
                this.dictModels[key].boxHelper.visible = false
            }
            this.transformControls.detach();
        }
        if (intersects.length > 0) {
            for (var key in this.dictModels){
                this.dictModels[key].boxHelper.visible = false
            }
            this.dictModels[intersects[0].object.userData].boxHelper.visible = true
            // detach the previous object
            this.transformControls.detach();
            // attach the newly selected object
            this.transformControls.attach(intersects[0].object);
        }
    }

    classifyAssets(){
        for (var i=0; i < this.assets.length; i++){
            if (this.assets[i].constructor.type == "player"){
                if (this.player != null){
                    this.experience.messages.push({text: "Can only have a single player in the game", type: "error", button: {text: "Back to Editing", href: "/games/edit/"+window.game._id}})
                    this.experience.trigger("message")
                }
                this.player = this.assets[i]
            }
            if (this.assets[i].constructor.type == "monster"){
                this.monsters.push(this.assets[i])
                if (this.type_win == this.possible_win.none){
                    this.type_win = this.possible_win.kill_all_monsters;
                }
            }
            if (this.assets[i].constructor.type == "weapon"){
                this.weapons.push(this.assets[i])
            }
            if (this.assets[i].constructor.type == "modular" || this.assets[i].constructor.type == "decor"){
                if (this.assets[i].separateBoxes){
                    for (var j = 0; j < this.assets[i].separateBoxes.length; j++){
                        this.solidModels.push(this.assets[i].separateBoxes[j])
                    }
                } else {
                    this.solidModels.push(this.assets[i].modelDragBox)
                }
            }

            if (this.assets[i].interact){
                this.interactables.push(this.assets[i])
                this.interactableModels.push(this.assets[i].modelDragBox)

                if (this.assets[i].exit){
                    this.type_win = this.possible_win.find_exit
                }
            }
        }

        if (this.type_win == this.possible_win.none){
            this.experience.gameOver = true
        }

        if (this.player == null){
            this.experience.messages.push({text: "The game needs to have a player", type: "error", button: {text: "Back to Editing", href: "/games/edit/"+window.game._id}})
            this.experience.trigger("message")
        }

        this.trigger("classified")
    }

    checkCollision(model1, model2)
    {
        // manually calculate intersection
        let modelBox = new THREE.Box3();
        modelBox.copy(model1.modelDragBox.geometry.boundingBox);
        modelBox.applyMatrix4(model1.modelDragBox.matrixWorld);

        let otherBox = new THREE.Box3();
        otherBox.copy(model2.modelDragBox.geometry.boundingBox);
        otherBox.applyMatrix4(model2.modelDragBox.matrixWorld);
        if (modelBox.intersectsBox(otherBox)){
            return true
        } 
        return false
    }
    
    addModel(asset_name, name = null)
    {
        const model = this.modelClasses[asset_name]
        if (name == null){
            name = asset_name
            let count = 0
            while (name in this.dictModels){
                count += 1
                name = asset_name + "." + count
            }
        }

        this.dictModels[name] = new model(name)
        this.assetsDragBox.push(this.dictModels[name].modelDragBox)
        this.assets.push(this.dictModels[name])
    }

    deleteModel(name){
        const index = this.assets.indexOf(this.dictModels[name]);
        if (index > -1) { // only splice array when item is found
            this.assets.splice(index, 1); // 2nd parameter means remove one item only
            this.assetsDragBox.splice(index, 1); 
        }
        if (this.dictModels[name].constructor.type == "monster"){
            this.monsters.splice(this.monsters.indexOf(this.dictModels[name]), 1);
        }
        this.dictModels[name].delete()
        delete this.dictModels[name]
    }

    deleteAllModels(){
        for (var key in this.dictModels){
            this.dictModels[key].delete()
        }

        this.player = null;
        this.monsters = [];
        this.weapons = [];
        this.solidModels = []
        this.assets = []
        this.assetsDragBox = []
        this.interactables = []
        this.interactableModels = []
        this.dictModels = {}
    }

    reset(){
        this.deleteAllModels()
        for (var i = 0; i < this.assetsDB.length; i++){
            this.addModel(this.assetsDB[i].asset_name, this.assetsDB[i].unique_name);
            var curr_asset = this.dictModels[this.assetsDB[i].unique_name]
            curr_asset.modelDragBox.position.x = this.assetsDB[i].position_x
            curr_asset.modelDragBox.position.z = this.assetsDB[i].position_z
            curr_asset.modelDragBox.quaternion.y = this.assetsDB[i].quaternion_y
            curr_asset.modelDragBox.quaternion.w = this.assetsDB[i].quaternion_w
            if (curr_asset.life){
                curr_asset.life = this.assetsDB[i].life
            }
            if (curr_asset.strength){
                curr_asset.strength = this.assetsDB[i].strength
            }
            if (curr_asset.attack_range){
                curr_asset.attack_range = this.assetsDB[i].attack_range
            }
            if (curr_asset.attack_weapon){
                curr_asset.attack_weapon = this.assetsDB[i].attack_weapon
            }
            if (curr_asset.defense_weapon){
                curr_asset.defense_weapon = this.assetsDB[i].defense_weapon
            }
        }

        if (this.experience.playing){
            this.classifyAssets()
            this.player.setControl()
            for (let monster of this.monsters){
                monster.setControl()
            }

            this.experience.trigger("ready");
        } else{
            this.setDragControl()
            this.setTransformControl()
        }
    }

    checkBoundaries(object){
        // get bounding box with rith rotation
        let copy = object.clone()
        copy.updateMatrixWorld( true );
        var bb = new THREE.Box3().setFromObject(copy);
        
        // values to subtract position because the position is at the center of the box
        var subtractX = (bb.max.x - bb.min.x)/2
        var subtractZ = (bb.max.z - bb.min.z)/2

        // check if outside the grid, if yes, put at last possible position
        if(bb.min.x < this.gridSize['x']/-2) object.position.x = this.gridSize['x']/-2 + subtractX
        if(bb.max.x > this.gridSize['x']/2) object.position.x = this.gridSize['x']/2 - subtractX

        if(bb.min.z < this.gridSize['z']/-2) object.position.z = this.gridSize['z']/-2 + subtractZ
        if(bb.max.z > this.gridSize['z']/2) object.position.z = this.gridSize['z']/2 - subtractZ
    }

    canMove(model){
        const raycaster = new THREE.Raycaster();
        var radius = 1

        for (var i=0; i<this.directions.length; i++){
            raycaster.set(model.position, this.directions[i], 0, 10);

            const intersects = raycaster.intersectObjects(this.solidModels)

            // if there is a solid distance less than radius, player can't move
            if (intersects.length > 0 && intersects[0].distance < radius){
                return false
            }
        }
        return true
    }

    checkWin(){
        if (this.type_win == this.possible_win.kill_all_monsters){
            if (this.monsters.length == 0){
                this.experience.gameOver = true
            }
        }
    }

    update()
    {
        for (var key in this.dictModels){
            this.dictModels[key].update()
        }
    }

    roundToNearest90(rad) {
        return (Math.round(rad / (Math.PI / 2)) * (Math.PI / 2));
    }
    
    roundToHalf(num) {
        return Math.round(num * 2) / 2;
    }
}