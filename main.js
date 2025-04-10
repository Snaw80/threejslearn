import * as THREE from 'three';

const w = window.innerWidth;
const h = window.innerHeight;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505); 

const camera = new THREE.PerspectiveCamera(
  75,                                     
  w / h, 
  0.1,                                    
  10                                    
);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);


window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

const raycaster = new THREE.Raycaster();
const cursor = new THREE.Vector2();
const worldCursor = new THREE.Vector3();
let mouseInScene = false;

window.addEventListener('mousemove', (event) => {
    cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
    cursor.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(cursor, camera);
    const intersects = raycaster.intersectObject(obj);
    
    if (intersects.length > 0) {
        mouseInScene = true;
        worldCursor.copy(intersects[0].point);
    } else {
        mouseInScene = false;
        worldCursor.set(cursor.x, cursor.y, 0);
    }
});

const geometry = new THREE.IcosahedronGeometry(1, 8);

const uniforms = {
    mousePosition: { value: new THREE.Vector2(0, 0) },
    lightPosition: { value: new THREE.Vector3(2, 2, 3) },
    time: { value: 0.0 }
};

const shader = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById('vertexshader').textContent,
    fragmentShader: document.getElementById('fragmentshader').textContent,
    side: THREE.DoubleSide
});

const obj = new THREE.Mesh(geometry, shader);
scene.add(obj);

const wireGeometry = new THREE.IcosahedronGeometry(1.01, 2);
const wireMat = new THREE.MeshBasicMaterial({
  color: 0x330000,
  wireframe: true,
  transparent: true,
  opacity: 0.15
});

const wireObj = new THREE.Mesh(wireGeometry, wireMat);
scene.add(wireObj);

const ambientLight = new THREE.AmbientLight(0x0a0a0a);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(2, 2, 3);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xff2200, 1.0, 5);
pointLight.position.set(0, 0, 2);
pointLight.intensity = 0.7;
scene.add(pointLight);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  const elapsedTime = clock.getElapsedTime();
  uniforms.time.value = elapsedTime;
  
  if (mouseInScene)
    {
    uniforms.mousePosition.value.x = worldCursor.x;
    uniforms.mousePosition.value.y = worldCursor.y;
    
    pointLight.position.x = worldCursor.x;
    pointLight.position.y = worldCursor.y;
    pointLight.position.z = worldCursor.z + 0.5;
    pointLight.intensity = 1.0;
  } 
  else 
  {
    pointLight.position.set(0, 0, 2);
    pointLight.intensity = 0.3 + Math.sin(elapsedTime * 1.5) * 0.1;
  }
  
  wireObj.rotation.y = elapsedTime * 0.1;
  wireObj.rotation.x = Math.sin(elapsedTime * 0.3) * 0.1;
  
  obj.rotation.y = elapsedTime * 0.1;
  
  renderer.render(scene, camera);
}

animate(); 

