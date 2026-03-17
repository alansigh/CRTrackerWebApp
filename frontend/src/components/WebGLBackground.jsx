import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const WebGLBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a14, 0.001); // Match Preset B dark void

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Add canvas to DOM
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Geometry & Material
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);
    
    const color1 = new THREE.Color('#FAF8F5'); // Ivory
    const color2 = new THREE.Color('#C9A84C'); // Champagne
    const tempColor = new THREE.Color();

    for(let i = 0; i < particlesCount * 3; i++) {
        // Position
        posArray[i] = (Math.random() - 0.5) * 10;
        
        // Color (every third iteration fills rgb)
        if (i % 3 === 0) {
           const mixRatio = Math.random();
           tempColor.lerpColors(color1, color2, mixRatio);
           colorsArray[i] = tempColor.r;
           colorsArray[i+1] = tempColor.g;
           colorsArray[i+2] = tempColor.b;
        }
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    // Material with vertex colors
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.015,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 2;

    // Mouse interaction setup
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    };

    document.addEventListener('mousemove', onDocumentMouseMove);

    // Animation Loop
    let animationFrameId;

    const tick = () => {
        // Parallax drift based on mouse
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;
        
        particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
        particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);

        // Constant slow rotation
        particlesMesh.rotation.y += 0.001;
        
        // Render
        renderer.render(scene, camera);

        // Call tick again on the next frame
        animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    // Handle Resize
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('mousemove', onDocumentMouseMove);
        cancelAnimationFrame(animationFrameId);
        
        if (mountRef.current && renderer.domElement) {
            mountRef.current.removeChild(renderer.domElement);
        }
        
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    />
  );
};

export default WebGLBackground;
