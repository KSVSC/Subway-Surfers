var scene, camera, renderer, composer, mesh;
var meshFloor, ambientLight, light, poster1, poster2;

var keyboard = {};
var player = { height: 1.0, speed: 1.5, zspeed: 0.55, yspeed: 0.1, turnSpeed: 0.5, alive: 10 };
var USE_WIREFRAME = false;

//mesh index
var Surfer;
var SurferBB;
var Police;
var PoliceBB;
var meshes = {};
var coin1 = {};
var coin1BB = {};
var coin2 = {};
var coin2BB = {};
var world = {};
var End = {};
var obs1 = {};
var obs1BB = {};
var Tree = {};
var obs2 = {};
var obs2BB = {};
var Pole = {};
var Fly = {};
var FlyBB = {};
var Boot = {};
var BootBB = {};
var Train = {};
var TrainBB = {};

var loadingScreen = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(90, 1280 / 720, 0.1, 1000),
    box: new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.MeshBasicMaterial({ color: 0x4444ff })
    )

};

var LOADING_MANAGER = null;
var RESOURCES_LOADED = false;
var Jump = 0, Duck = 0;
var Boot_time = 2;
var time, time2, timed, timed2;
var Fly_Over = 0;
var Boot_Jump = 0;
var Gray = 0;
var timef1, timef2;
var x = 0;
var score = 0;
// document.getElementById("score").innerHTML = score;
// document.getElementById("life").innerHTML = alive;

//models index
var models = {
    player: {
        obj: "character/luigi textured obj.obj",
        mtl: "character/luigi textured obj.mtl",
        mesh: null
    },
    wall: {
        obj: "./Wall.obj",
        mtl: "./Wall.mtl",
        mesh: null,
        receiveShadow: false
    },
    track: {
        obj: "./Track.obj",
        mtl: "./Track.mtl",
        mesh: null
    },
    coin1: {
        obj: "./coinGold.obj",
        mtl: "./coinGold.mtl",
        mesh: null
    },
    coin2: {
        obj: "./coinSilver.obj",
        mtl: "./coinSilver.mtl",
        mesh: null
    },
    flag: {
        obj: "./flag.obj",
        mtl: "./flag.mtl",
        mesh: null
    },
    police: {
        obj: "./police/bb8.obj",
        mtl: "./police/bb8.mtl",
        mesh: null
    },
    dog: {
        obj: "./cartDog.obj",
        mtl: "./cartDog.mtl",
        mesh: null
    },
    obj1: {
        obj: "./overheadRoundColored.obj",
        mtl: "./overheadRoundColored.mtl",
        mesh: null
    },
    tree: {
        obj: "./treeLarge.obj",
        mtl: "./treeLarge.mtl",
        mesh: null
    },
    obj2: {
        obj: "./barrierWall.obj",
        mtl: "./barrierWall.mtl",
        mesh: null
    },
    tree: {
        obj: "./treeLarge.obj",
        mtl: "./treeLarge.mtl",
        mesh: null
    },
    pole: {
        obj: "./Lightpost_01.obj",
        mtl: "./Lightpost_01.mtl",
        mesh: null
    },
    flyover: {
        obj: "./button.obj",
        mtl: "./button.mtl",
        mesh: null
    },
    boot: {
        obj: "./boot/21943_Mushroom_v1.obj",
        mtl: "./boot/21943_Mushroom_v1.mtl",
        mesh: null
    },
    train: {
        obj: "./train/814_4.obj",
        mtl: "./train/814_4.mtl",
        mesh: null
    }

};

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(20, 1280 / 720, 0.1, 1000);

    loadingScreen.box.position.set(0, 0, 5);
    loadingScreen.camera.lookAt(loadingScreen.box.position);
    loadingScreen.scene.add(loadingScreen.box);

    loadingManager = new THREE.LoadingManager();

    loadingManager.onProgress = function (item, loaded, total) {
        console.log(item, loaded, total);
    };

    loadingManager.onLoad = function () {
        RESOURCES_LOADED = true;
        onResourcesLoaded();
    };


    //loading textures
    var textureLoader = new THREE.TextureLoader(loadingManager);
    mesh_texture = textureLoader.load("wall.jpg");
    floor_texture = textureLoader.load("water.jpg");

    //floor
    meshFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 1200, 10, 10),
        new THREE.MeshPhongMaterial({
            color: 0x000fff,
            wireframe: USE_WIREFRAME,
            map: mesh_texture
        })
    );
    meshFloor.rotation.x -= Math.PI / 2;
    meshFloor.receiveShadow = true;
    meshFloor.position.set(0, 0, 600);
    scene.add(meshFloor);

    //wall1
    poster1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 5, 1000),
        new THREE.MeshPhongMaterial({
            color: 0xffffff,
            // wireframe: USE_WIREFRAME,
            map: floor_texture,
            transparent: true
        })
    );
    poster1.receiveShadow = true;
    poster1.position.set(5.5, 2.5, 500);
    scene.add(poster1);

    //wall2
    poster2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 5, 1000),
        new THREE.MeshPhongMaterial({
            color: 0xffffff,
            // wireframe: USE_WIREFRAME,
            map: floor_texture,
            transparent: true
        })
    );
    poster2.receiveShadow = true;
    poster2.position.set(-5, 2.5, 500);
    scene.add(poster2);

    ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    light = new THREE.PointLight(0xffffff, 0.8, 18);
    light.position.set(-3, 6, -3);
    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 25;
    scene.add(light);


    //load models
    for (var _key in models) {
        (function (key) {
            var mtlLoader = new THREE.MTLLoader(loadingManager);
            mtlLoader.load(models[key].mtl, function (materials) {
                materials.preload();

                var objLoader = new THREE.OBJLoader(loadingManager);

                objLoader.setMaterials(materials);
                objLoader.load(models[key].obj, function (mesh) {
                    mesh.traverse(function (node) {
                        if (node instanceof THREE.Mesh) {
                            if ('castShadow' in models[key])
                                node.castShadow = models[key].castShadow;
                            else
                                node.castShadow = true;
                            if ('receiveShadow' in models[key])
                                node.receiveShadow = models[key].receiveShadow;
                            else
                                node.receiveShadow = true;
                        }
                    });
                    models[key].mesh = mesh;

                });
            });
        })(_key);
    }

    camera.position.set(0, player.height, -5);
    camera.lookAt(new THREE.Vector3(0, player.height, 0));

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(1280, 720);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    document.body.appendChild(renderer.domElement);


    //grayscale
    composer = new THREE.EffectComposer(renderer);
    var renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    var effectGrayScale = new THREE.ShaderPass(THREE.LuminosityShader);
    effectGrayScale.renderToScreen = true;
    composer.addPass(effectGrayScale);

    animate();

}

function onResourcesLoaded() {
    Surfer = models.player.mesh.clone();
    Police = models.police.mesh.clone();
    Dog = models.dog.mesh.clone();

    for (i = 0; i < 2; i++) {
        Train[i] = models.train.mesh.clone();
    }
    for (i = 0; i < 2; i++) {
        Fly[i] = models.flyover.mesh.clone();
    }
    for (i = 0; i < 2; i++) {
        Boot[i] = models.boot.mesh.clone();
    }
    for (i = 0; i < 6; i++) {
        obs1[i] = models.obj1.mesh.clone();
    }
    for (i = 0; i < 16; i++) {
        Tree[i] = models.tree.mesh.clone();
    }
    for (i = 0; i < 16; i++) {
        Pole[i] = models.pole.mesh.clone();
    }
    for (i = 0; i < 10; i++) {
        obs2[i] = models.obj2.mesh.clone();
    }
    for (i = 0; i < 3; i++) {
        End[i] = models.flag.mesh.clone();
    }
    for (i = 0; i < 25 * 4; i = i + 4) {
        world[i] = models.wall.mesh.clone();
        world[i + 1] = models.wall.mesh.clone();
        world[i + 2] = models.track.mesh.clone();
        world[i + 3] = models.track.mesh.clone();
    }
    for (i = 0; i < 130; i++) {
        coin1[i] = models.coin1.mesh.clone();
        coin2[i] = models.coin2.mesh.clone();
    }


    for (i = 0, j = 30, k = 0; i < 25 * 4; i = i + 4) {
        world[i].position.set(-5, 0, j);
        scene.add(world[i]);
        world[i].scale.set(1, 2, 10);

        world[i + 1].position.set(5, 0, j);
        scene.add(world[i + 1]);
        world[i + 1].scale.set(1, 2, 10);

        world[i + 2].position.set(-0.55, 0.001, k);
        scene.add(world[i + 2]);
        world[i + 2].scale.set(2, 3, 20);

        world[i + 3].position.set(2.55, 0.001, k);
        scene.add(world[i + 3]);
        world[i + 3].scale.set(2, 3, 20);
        k += 40;
        j += 40;
    }

    Surfer.scale.set(0.015, 0.015, 0.015);
    Surfer.position.set(-1.54, 0, 10);
    scene.add(Surfer);

    Police.position.set(1, 0, 5);
    scene.add(Police);
    Police.rotation.y -= Math.PI / 2;
    Police.scale.set(0.015, 0.013, 0.007);

    Dog.position.set(-2, 1, 5);
    scene.add(Dog);
    Dog.scale.set(0.15, 0.1, 0.002);

    Train[0].position.set(2.25, 1, 95);
    Train[1].position.set(-1.54, 1, 620);
    for (i = 0; i < 2; i++) {
        Train[i].scale.set(0.25, 0.25, 1);
        scene.add(Train[i]);
    }

    Fly[0].position.set(-2.5, 0, 112);
    Fly[1].position.set(0.5, 0, 510);
    for (i = 0; i < 2; i++) {
        scene.add(Fly[i]);
        Fly[i].scale.set(2, 3, 1);
    }

    Boot[0].position.set(-1.2, 0, 308);
    Boot[1].position.set(1.5, 0, 812);
    for (i = 0; i < 2; i++) {
        Boot[i].scale.set(0.1, 0.1, 0.1);
        Boot[i].rotation.x -= Math.PI / 2;
        scene.add(Boot[i]);
    }

    for (i = 0, j = 20; i < 6; i++) {
        obs1[i].position.set(3.9, 0.001, j);
        obs1[i].scale.set(4, 3, 1);
        scene.add(obs1[i]);
        j = j + 100;
    }

    for (i = 0, j = 15; i < 16; i++) {
        Tree[i].position.set(0, 0.001, j);
        Tree[i].scale.set(2, 4, 1);
        scene.add(Tree[i]);

        j = j + 50;
    }

    for (i = 0, j = 100; i < 10; i++) {
        if (i % 2 == 0)
            x = -0.55;
        else
            x = 2.55;
        obs2[i].position.set(x, 0.001, j);
        obs2[i].scale.set(2, 7, 1);
        scene.add(obs2[i]);
        j = j + 80;
    }

    for (i = 0, j = 40; i < 16; i++) {
        Pole[i].scale.set(2, 5, 1);
        Pole[i].position.set(-0.55, 0.001, j);
        scene.add(Pole[i]);

        j = j + 50;
    }

    for (i = 0, z = 10; i < 15; i++) {
        coin1[i].position.set(-1.2, 0, z);
        coin1[i].scale.set(1, 1, 1);
        coin1[i].rotation.y = Math.PI / 2;
        scene.add(coin1[i]);

        coin2[i].position.set(-1.2, 0, z + 3);
        coin2[i].scale.set(1, 1, 1);
        coin2[i].rotation.y = Math.PI / 2;
        scene.add(coin2[i]);
        z += 6;
    }

    for (i = 15, z = 120; i < 15 + 15; i++) {
        coin1[i].position.set(2, 0, z);
        coin1[i].scale.set(1, 1, 1);
        coin1[i].rotation.y = Math.PI / 2;
        scene.add(coin1[i]);

        coin2[i].position.set(2, 0, z + 3);
        coin2[i].scale.set(1, 1, 1);
        coin2[i].rotation.y = Math.PI / 2;
        scene.add(coin2[i]);
        z += 6;
    }

    for (i = 30, z = 250; i < 15 + 30; i++) {
        coin1[i].position.set(-1.2, 1.5, z);
        coin1[i].scale.set(1, 1, 1);
        coin1[i].rotation.y = Math.PI / 2;
        scene.add(coin1[i]);

        coin2[i].position.set(-1.2, 1.5, z + 3);
        coin2[i].scale.set(1, 1, 1);
        coin2[i].rotation.y = Math.PI / 2;
        scene.add(coin2[i]);
        z += 6;
    }

    for (i = 45, z = 400; i < 15 + 45; i++) {
        coin1[i].position.set(2, 1.5, z);
        coin1[i].scale.set(1, 1, 1);
        coin1[i].rotation.y = Math.PI / 2;
        scene.add(coin1[i]);

        coin2[i].position.set(2, 1.5, z + 3);
        coin2[i].scale.set(1, 1, 1);
        coin2[i].rotation.y = Math.PI / 2;
        scene.add(coin2[i]);
        z += 6;
    }

    for (i = 60, z = 570; i < 15 + 60; i++) {
        coin1[i].position.set(-1.2, 2, z);
        coin1[i].scale.set(1, 1, 1);
        coin1[i].rotation.y = Math.PI / 2;
        scene.add(coin1[i]);

        coin2[i].position.set(-1.2, 2, z + 3);
        coin2[i].scale.set(1, 1, 1);
        coin2[i].rotation.y = Math.PI / 2;
        scene.add(coin2[i]);
        z += 6;
    }

    for (i = 75, z = 820; i < 15 + 75; i++) {
        coin1[i].position.set(2, 0, z);
        coin1[i].scale.set(1, 1, 1);
        coin1[i].rotation.y = Math.PI / 2;
        scene.add(coin1[i]);

        coin2[i].position.set(2, 0, z + 3);
        coin2[i].scale.set(1, 1, 1);
        coin2[i].rotation.y = Math.PI / 2;
        scene.add(coin2[i]);
        z += 6;
    }

    for (i = 90, z = 110; i < 15 + 90; i++) {
        coin1[i].position.set(-1.2, 5, z);
        coin1[i].scale.set(1, 1, 1);
        coin1[i].rotation.y = Math.PI / 2;
        scene.add(coin1[i]);

        coin2[i].position.set(-1.2, 5, z + 3);
        coin2[i].scale.set(1, 1, 1);
        coin2[i].rotation.y = Math.PI / 2;
        scene.add(coin2[i]);
        z += 6;
    }

    for (i = 115, z = 500; i < 130; i++) {
        coin1[i].position.set(2, 5, z);
        coin1[i].scale.set(1, 1, 1);
        coin1[i].rotation.y = Math.PI / 2;
        scene.add(coin1[i]);

        coin2[i].position.set(2, 5, z + 3);
        coin2[i].scale.set(1, 1, 1);
        coin2[i].rotation.y = Math.PI / 2;
        scene.add(coin2[i]);
        z += 6;
    }

    for (i = 0, j = -1; i < 3; i = i + 1) {
        End[i].position.set(j, 0, 980);
        End[i].scale.set(10, 3, 1);
        End[i].rotation.y = Math.PI / 2;
        scene.add(End[i]);
        j = j + 2;
    }

}

function animate() {
    if (player.alive == 0) {
        console.log("gameover");
        console.log("score :");
        console.log(score);
        console.log("life");
        console.log(player.alive);
    }
    if (RESOURCES_LOADED == false) {
        requestAnimationFrame(animate);

        loadingScreen.box.position.x -= 0.05;
        if (loadingScreen.box.position.x < -10) loadingScreen.box.position.x = 10;
        loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);

        renderer.render(loadingScreen.scene, loadingScreen.camera);
        return;
    }

    requestAnimationFrame(animate);

    PoliceBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    PoliceBB.setFromObject(Police);

    SurferBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    SurferBB.setFromObject(Surfer);

    if (x < 10) {
        x = x + 1;
    }
    else {
        // player.zspeed = 0.5;
        if (poster1.material.opacity == 1) {
            poster1.material.opacity = 0.8;
            poster2.material.opacity = 0.8;
        }
        else {
            poster1.material.opacity = 1;
            poster2.material.opacity = 1;
        }
        x = 0;
    }

    if (Fly_Over == 1) {

        timef2 = Date.now() * 0.0005;
        delta3 = timef2 - timef1;
        if (delta3 < 3) {
            Surfer.position.y = 5;
        }
        else {
            Surfer.position.y = 0;
            Fly_Over = 0;
        }
    }

    if (Jump == 1 || Boot_Jump == 1) {
        time2 = Date.now() * 0.0005;
        delta = time2 - time;
        if (Boot_Jump) {
            Jump_time = 2;
        }
        else {
            Jump_time = 0.1;
        }
        if (delta < Jump_time) {
            Surfer.position.y += player.yspeed;
        }
        else {
            Surfer.position.y -= player.yspeed;
        }
        if (Surfer.position.y < 0) {
            Boot_Jump = 0;
            Jump = 0;

        }
    }
    if (Duck == 1) {
        timed2 = Date.now() * 0.0005;
        delta2 = timed2 - timed;

        if (delta2 < 0.07) {
            Surfer.scale.set(0.01, 0.01, 0.01);
        }
        else {
            Surfer.scale.set(0.015, 0.015, 0.015);
            Duck = 0;
        }
    }

    if (Surfer.position.z < 980) {
        Surfer.position.z += player.zspeed;
        Police.position.z += player.turnSpeed;
        player.turnSpeed -= 0.001;
    }
    // console.log(Surfer.position);
    camera.position.set(Surfer.position.x, Surfer.position.y + 3, Surfer.position.z - 25);
    camera.lookAt(new THREE.Vector3(Surfer.position.x, Surfer.position.y + 1, Surfer.position.z));

    Dog.position.z = Surfer.position.z - 5;
    Dog.position.x = Surfer.position.x - 1;
    if (Surfer.position.y < 2)
        Dog.position.y = Surfer.position.y + 1;
    else
        Dog.position.y = 1;


    // collisions coins
    for (i = 0; i < 130; i++) {
        coin1BB[i] = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        coin1BB[i].setFromObject(coin1[i]);
        coin2BB[i] = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        coin2BB[i].setFromObject(coin2[i]);

        if (coin1BB[i].intersectsBox(SurferBB)) {
            scene.remove(coin1[i]);
            score += 10;
        }
        if (coin2BB[i].intersectsBox(SurferBB)) {
            scene.remove(coin2[i]);
            score += 20;
        }
    }


    //collisions train
    for (i = 0; i < 2; i++) {
        TrainBB[i] = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        TrainBB[i].setFromObject(Train[i]);
        if (TrainBB[i].intersectsBox(SurferBB)) {
            player.alive -= 1;
        }
    }

    //collisions Fly
    for (i = 0; i < 2; i++) {
        FlyBB[i] = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        FlyBB[i].setFromObject(Fly[i]);
        if (FlyBB[i].intersectsBox(SurferBB)) {
            scene.remove(Fly[i]);
            score += 50;
            Fly_Over = 1;
            timef1 = Date.now() * 0.0005;
        }
    }

    //collisions Boot
    for (i = 0; i < 2; i++) {
        BootBB[i] = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        BootBB[i].setFromObject(Boot[i]);
        if (BootBB[i].intersectsBox(SurferBB)) {
            scene.remove(Boot[i]);
            score += 30;
            Boot_Jump = 1;
            time = Date.now() * 0.0005;
            Surfer.position.y += player.yspeed;
        }
    }

    //collisions Obs1
    for (i = 0; i < 6; i++) {
        obs1BB[i] = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        obs1BB[i].setFromObject(obs1[i]);
        if (obs1BB[i].intersectsBox(SurferBB)) {
            // player.zspeed -= 0.005;
        }
    }

    //collisions Obs2
    for (i = 0; i < 6; i++) {
        obs2BB[i] = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        obs2BB[i].setFromObject(obs2[i]);
        if (obs2BB[i].intersectsBox(SurferBB)) {
            player.alive -= 1;
        }
    }



    //key functions
    if (keyboard[87]) {//Wkey
        camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
        camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
    }
    if (keyboard[83]) {//Skey
        camera.position.x += Math.sin(camera.rotation.y) * player.speed;
        camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
    }
    if (keyboard[65]) {//Akey
        camera.position.x += Math.sin(camera.rotation.y + Math.PI / 2) * player.speed;
        camera.position.z += -Math.cos(camera.rotation.y + Math.PI / 2) * player.speed;
    }
    if (keyboard[68]) {//Dkey
        camera.position.x += Math.sin(camera.rotation.y - Math.PI / 2) * player.speed;
        camera.position.z += -Math.cos(camera.rotation.y - Math.PI / 2) * player.speed;
    }
    if (keyboard[37]) {//left arrow
        if (Surfer.position.x + player.speed < 2 && Surfer.position.x + player.speed > -2.5) {
            Surfer.position.x += player.speed;
        }
        // camera.rotation.y -= player.turnSpeed;
    }
    if (keyboard[39]) {//right arrow
        if (Surfer.position.x - player.speed < 2 && Surfer.position.x - player.speed > -2.5) {
            Surfer.position.x -= player.speed;
        }
        // camera.rotation.y += player.turnSpeed;
    }
    if (keyboard[32]) {//spacebar
        Jump = 1;
        time = Date.now() * 0.0005;
        Surfer.position.y += player.yspeed;
    }
    if (keyboard[40]) {//Downarrow
        Duck = 1;
        time = Date.now() * 0.0005;
        Surfer.scale.set(0.01, 0.01, 0.01);
    }
    if (keyboard[90]) {//Downarrow
        if (Gray == 0)
            Gray = 1;
        else
            Gray = 0;
    }

    if (Gray)
        composer.render();
    else
        renderer.render(scene, camera);
}

function keyDown(event) {
    console.log("key press")

    keyboard[event.keyCode] = true;
}

function keyUp(event) {
    console.log("key release")
    keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);
window.onload = init;
