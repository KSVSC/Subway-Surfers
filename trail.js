var scene,camera,renderer,mesh;
var meshFloor, ambientLight, light;

var keyboard = {};
var player = { height: 1.0, speed: 0.5, turnSpeed: 0.5};
var USE_WIREFRAME = false;

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
var Jump = 0,Duck = 0;
var time, time2,timed, timed2;

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
        receiveShadow:false
    },
    track: {
        obj: "./Track.obj",
        mtl: "./Track.mtl",
        mesh: null        
    },
    coin: {
        obj: "./coinGold.obj",
        mtl: "./coinGold.mtl",
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
    }
    
};

//mesh index
var meshes = {};
var coins = {};
var world = {};
var End = {};

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
        console.log("loaded all resources");
        RESOURCES_LOADED = true;
        onResourcesLoaded();
    };

    //loading textures
    var textureLoader = new THREE.TextureLoader(loadingManager);
    mesh_texture = textureLoader.load("wall.jpg");
    floor_texture = textureLoader.load("water.jpg");
    // crateNormalMap = textureLoader.load("crate0/crate0_normal.png");

    //floor
    meshFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 500, 10, 10),
        new THREE.MeshPhongMaterial({
            color: 0xffffff,
            // wireframe: USE_WIREFRAME,
            map: mesh_texture
        })
    );
    meshFloor.rotation.x -= Math.PI / 2;
    meshFloor.receiveShadow = true;
    meshFloor.position.set(0, 0, 250);
    scene.add(meshFloor);

    //wall1
    poster1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 5, 400),
        new THREE.MeshPhongMaterial({
            color: 0xffffff,
            wireframe: USE_WIREFRAME,
            map: floor_texture
        })
    );
    poster1.receiveShadow = true;
    poster1.position.set(4.5, 2.5, 200);
    scene.add(poster1);

    //wall2
    poster2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 5, 400),
        new THREE.MeshPhongMaterial({
            color: 0xffffff,
            wireframe: USE_WIREFRAME,
            map: floor_texture
        })
    );
    poster2.receiveShadow = true;
    poster2.position.set(-4, 2.5, 200);
    scene.add(poster2);

    //obstacle1
    obstacle1[i] = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 5, 400),
        new THREE.MeshPhongMaterial({
            color: 0xffffff,
            wireframe: USE_WIREFRAME,
            map: floor_texture
        })
    );
    obstacle1[i].receiveShadow = true;
    obstacle1[i].position.set(4.5, 2.5, 200);
    scene.add(obstacle1[i]);
        

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

    animate(); 

}

function onResourcesLoaded() {
    Surfer = models.player.mesh.clone();
    Police = models.police.mesh.clone();
    for (i = 0; i < 3; i++){
        End[i] = models.flag.mesh.clone();        
    }
    for (i = 0; i < 10 * 4; i = i + 4) {
        world[i] = models.wall.mesh.clone();
        world[i + 1] = models.wall.mesh.clone();
        world[i + 2] = models.track.mesh.clone();
        world[i + 3] = models.track.mesh.clone();
    }
    for (i = 0; i < 2000; i++)
    {
        coins[i] = models.coin.mesh.clone();
    }


    for (i = 0, j = 30, k = 0; i < 10 * 4; i = i + 4){
        world[i].position.set(-4, 0, j);
        scene.add(world[i]);
        world[i].scale.set(1, 2, 10);
        
        world[i + 1].position.set(4, 0, j);
        scene.add(world[i+1]);
        world[i + 1].scale.set(1, 2, 10);
        
        world[i + 2].position.set(-0.55, 0.001, k);
        scene.add(world[i+2]);
        world[i + 2].scale.set(2, 3, 20);

        world[i + 3].position.set(2.55, 0.001, k);
        scene.add(world[i+3]);
        world[i + 3].scale.set(2, 3, 20);
        k += 40;
        j += 40; 
    }

    Surfer.position.set(0, 0, 10);
    scene.add(Surfer);
    Surfer.scale.set(0.015, 0.015, 0.015);

    Police.position.set(1, 0, 5);
    // scene.add(Police);
    Police.rotation.y -= Math.PI / 2;
    Police.scale.set(0.015, 0.013, 0.007);

    for (i = 0, x = -1, y = 0.01, z = 10; i < 200; i++){
        if (i == 15) {
            z = 125;
            x = 2;
            y = 2;
        }
        coins[i].position.set(x, y, z);
        coins[i].scale.set(1, 1, 1);
        coins[i].rotation.y = Math.PI / 2;
        scene.add(coins[i]);
        z += 3;
    }

    for (i = 0,j=-1; i < 3; i=i+1){
        End[i].position.set(j, 0, 380);
        End[i].scale.set(10, 3, 1);
        End[i].rotation.y = Math.PI / 2;        
        scene.add(End[i]);
        j = j + 2;
    }

}

function animate() {
    if (RESOURCES_LOADED == false) {
        requestAnimationFrame(animate);

        loadingScreen.box.position.x -= 0.05;
        if (loadingScreen.box.position.x < -10) loadingScreen.box.position.x = 10;
        loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);

        renderer.render(loadingScreen.scene, loadingScreen.camera);
        return;
    }
    
    requestAnimationFrame(animate);
    if (Jump == 1) {
        time2 = Date.now() * 0.0005;
        delta = time2 - time;

        if (delta < 0.5) {
            Surfer.position.y += 0.1;
        }
        else {
            Surfer.position.y -= 0.1;
        }
        if (Surfer.position.y < 0)
            Jump = 0;
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

    if (Surfer.position.z < 380){
        Surfer.position.z += player.speed;        
        Police.position.z += player.turnSpeed;
        player.turnSpeed -= 0.001;
    }
    // console.log(Surfer.position);
    camera.position.set(Surfer.position.x, Surfer.position.y + 3, Surfer.position.z - 25);
    camera.lookAt(new THREE.Vector3(Surfer.position.x, Surfer.position.y + 1, Surfer.position.z));
    
    
    //key functions
    if (keyboard[87]) {//Wkey
        console.log("key W")

        camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
        camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
    }
    if (keyboard[83]) {//Skey
        console.log("key S")

        camera.position.x += Math.sin(camera.rotation.y) * player.speed;
        camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
    }
    if (keyboard[65]) {//Akey
        console.log("key A")

        camera.position.x += Math.sin(camera.rotation.y + Math.PI / 2) * player.speed;
        camera.position.z += -Math.cos(camera.rotation.y + Math.PI / 2) * player.speed;
    }
    if (keyboard[68]) {//Dkey
        console.log("key D")

        camera.position.x += Math.sin(camera.rotation.y - Math.PI / 2) * player.speed;
        camera.position.z += -Math.cos(camera.rotation.y - Math.PI / 2) * player.speed;
    }
    if (keyboard[37]) {//left arrow
        console.log("key left")
        if (Surfer.position.x + player.speed < 3 && Surfer.position.x + player.speed > -2.5) {
            Surfer.position.x += player.speed;            
        }
        // camera.rotation.y -= player.turnSpeed;
    }
    if (keyboard[39]) {//right arrow
        console.log("right")
        if (Surfer.position.x - player.speed < 3 && Surfer.position.x - player.speed > -2.5) {
            Surfer.position.x -= player.speed;            
        }
        // camera.rotation.y += player.turnSpeed;
    }
    if (keyboard[32]) {//spacebar
        console.log("space")
        Jump = 1;
        time = Date.now() * 0.0005;
        Surfer.position.y += 0.1;
    }
    if (keyboard[40]) {//Downarrow
        console.log("duck")
        Duck = 1;
        time = Date.now() * 0.0005;
        Surfer.scale.set(0.01, 0.01, 0.01);
    }

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