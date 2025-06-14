import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

const PlanetTracker = () => {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [showInfo, setShowInfo] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const planetObjectsRef = useRef([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const targetPosition = useRef({ x: 0, y: 0, z: 300 });
  const currentPosition = useRef({ x: 0, y: 0, z: 300 });
  const [debugInfo, setDebugInfo] = useState({
    milkyWayVisible: true,
    nebulaeVisible: true,
    galaxiesVisible: true,
    effectsIntensity: 1.0,
    showDebugPanel: true
  });
  
  // Add info panel styles
  const infoPanelStyle = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '350px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: '20px',
    borderRadius: '10px',
    color: 'white',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 10
  };

  const planetButtonStyle = {
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '5px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  const selectedPlanetButtonStyle = {
    ...planetButtonStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    boxShadow: '0 0 10px rgba(255, 255, 255, 0.2)'
  };

  const statBoxStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '10px'
  };

  // Planets data
  const planets = {
    Sun: {
      size: 20,
      distance: 0,
      period: 0,
      tilt: 0,
      color: '#FFD700',
      description: 'The Sun is the star at the center of the Solar System. It is a nearly perfect sphere of hot plasma, with internal convective motion that generates a magnetic field.',
      temperature: '5,778 K',
      mass: '1.989 × 10^30 kg',
      diameter: '1,392,700 km',
      type: 'G-type main-sequence star'
    },
    Mercury: {
      size: 3.8,
      distance: 50,
      period: 0.24,
      tilt: 0.034,
      color: '#A9A9A9',
      description: 'The smallest and innermost planet in the Solar System.'
    },
    Venus: {
      size: 9.5,
      distance: 75,
      period: 0.62,
      tilt: 0.001,
      color: '#E6E6FA',
      description: 'The second planet from the Sun, often called Earth\'s sister planet.'
    },
    Earth: {
      size: 10,
      distance: 100,
      period: 1,
      tilt: 0.409,
      color: '#4169E1',
      description: 'Our home planet, the only known planet to harbor life.'
    },
    Mars: {
      size: 5.3,
      distance: 150,
      period: 1.88,
      tilt: 0.439,
      color: '#CD5C5C',
      description: 'The Red Planet, known for its iron oxide surface.'
    },
    Jupiter: {
      size: 30,
      distance: 250,
      period: 11.86,
      tilt: 0.055,
      color: '#DEB887',
      description: 'The largest planet in our Solar System.'
    },
    Saturn: {
      size: 25,
      distance: 350,
      period: 29.46,
      tilt: 0.466,
      color: '#F4A460',
      description: 'Known for its prominent ring system.'
    },
    Uranus: {
      size: 15,
      distance: 450,
      period: 84.01,
      tilt: 1.706,
      color: '#87CEEB',
      description: 'The first planet discovered with a telescope.'
    },
    Neptune: {
      size: 15,
      distance: 550,
      period: 164.79,
      tilt: 0.494,
      color: '#1E90FF',
      description: 'The farthest known planet from the Sun.'
    }
  };

  const spaceObjects = {
    'Milky Way': {
      type: 'Galaxy',
      description: 'Our home galaxy, a barred spiral galaxy containing billions of stars.',
      diameter: '100,000 light-years',
      age: '13.6 billion years',
      stars: '100-400 billion',
      features: 'Central bar, spiral arms, dark matter halo'
    },
    'Orion Nebula': {
      type: 'Emission Nebula',
      description: 'One of the brightest nebulae visible to the naked eye, a stellar nursery.',
      distance: '1,344 light-years',
      size: '24 light-years',
      age: '3 million years',
      features: 'Star formation, Trapezium cluster'
    },
    'Crab Nebula': {
      type: 'Supernova Remnant',
      description: 'Remains of a supernova explosion observed in 1054 AD.',
      distance: '6,500 light-years',
      size: '11 light-years',
      age: '969 years',
      features: 'Pulsar, expanding gas cloud'
    },
    'Eagle Nebula': {
      type: 'Star-forming Region',
      description: 'Famous for the "Pillars of Creation" where new stars are being born.',
      distance: '7,000 light-years',
      size: '70 light-years',
      age: '5.5 million years',
      features: 'Pillars of Creation, young star clusters'
    }
  };

  // Helper functions
  const createStars = () => {
    const starCount = 10000;
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: false
    });

    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 1000 + 500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const brightness = Math.random() * 0.5 + 0.5;
      colors[i3] = brightness;
      colors[i3 + 1] = brightness;
      colors[i3 + 2] = brightness;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return new THREE.Points(starGeometry, starMaterial);
  };

  const createAsteroidBelt = () => {
    const asteroidGroup = new THREE.Group();
    const asteroidCount = 2000;
    const asteroidGeometry = new THREE.SphereGeometry(0.2, 4, 4);
    const asteroidMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.7,
      metalness: 0.1
    });

    for (let i = 0; i < asteroidCount; i++) {
      const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
      const angle = (Math.random() * Math.PI * 2);
      const radius = 85 + Math.random() * 15; // Between Mars and Jupiter
      const yOffset = (Math.random() - 0.5) * 5;
      
      asteroid.position.x = Math.cos(angle) * radius;
      asteroid.position.z = Math.sin(angle) * radius;
      asteroid.position.y = yOffset;
      asteroid.rotation.x = Math.random() * Math.PI;
      asteroid.rotation.y = Math.random() * Math.PI;
      asteroid.rotation.z = Math.random() * Math.PI;
      asteroid.scale.set(
        Math.random() * 0.5 + 0.1,
        Math.random() * 0.5 + 0.1,
        Math.random() * 0.5 + 0.1
      );
      
      asteroidGroup.add(asteroid);
    }
    
    return asteroidGroup;
  };

  const createOrbitLine = (radius) => {
    const segments = 128;
    const orbitGeometry = new Float32Array((segments + 1) * 3);

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      orbitGeometry[i * 3] = Math.cos(angle) * radius;
      orbitGeometry[i * 3 + 1] = 0;
      orbitGeometry[i * 3 + 2] = Math.sin(angle) * radius;
    }

    const orbitMaterial = new THREE.LineBasicMaterial({ 
      color: 0x444444,
      transparent: true,
      opacity: 0.3,
      linewidth: 2
    });

    return new THREE.Line(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(orbitGeometry, 3)), orbitMaterial);
  };

  const createPlanetLabel = (name) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;

    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = 'Bold 40px Arial';
    context.textAlign = 'center';
    context.fillStyle = 'white';
    context.fillText(name, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true,
      opacity: 0.8
    });

    return new THREE.Sprite(spriteMaterial);
  };

  const createSun = () => {
    const sunGeometry = new THREE.SphereGeometry(20, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 1
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    
    // Add glow effect using a simple sprite
    const glowGeometry = new THREE.SphereGeometry(25, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    sun.add(glow);

    // Add point light at sun's position
    const sunLight = new THREE.PointLight(0xffffff, 2, 1000);
    sunLight.position.set(0, 0, 0);
    sun.add(sunLight);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    sun.add(ambientLight);

    return sun;
  };

  const createPlanetTexture = (size, color, roughness = 0.7) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');

    // Create base color
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise and details
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 2;
      const alpha = Math.random() * 0.1;
      
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      context.fill();
    }

    return new THREE.CanvasTexture(canvas);
  };

  const createPlanets = async () => {
    const objects = [];
    console.log('Starting planet creation...');

    // Create planets
    for (const [name, planet] of Object.entries(planets)) {
      if (name === 'Sun') continue; // Skip sun as it's created separately
      
      console.log(`Creating ${name}...`);
      
      // Create planet geometry and material
      const geometry = new THREE.SphereGeometry(planet.size, 64, 64);
      const texture = createPlanetTexture(planet.size, planet.color);
      
      const material = new THREE.MeshPhongMaterial({
        map: texture,
        shininess: 5,
        specular: new THREE.Color(0x333333),
        bumpScale: 0.05
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.planetName = name; // Store planet name in mesh for reference

      // Set initial position
      const angle = Math.random() * Math.PI * 2;
      mesh.position.x = Math.cos(angle) * planet.distance;
      mesh.position.z = Math.sin(angle) * planet.distance;
      mesh.position.y = 0;

      // Create orbit
      const orbitGeometry = new THREE.RingGeometry(planet.distance - 0.1, planet.distance + 0.1, 128);
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0x444444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      sceneRef.current.add(orbit);

      // Create label
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 64;
      context.fillStyle = '#ffffff';
      context.font = '24px Arial';
      context.textAlign = 'center';
      context.fillText(name, canvas.width / 2, canvas.height / 2);

      const labelTexture = new THREE.CanvasTexture(canvas);
      const labelMaterial = new THREE.SpriteMaterial({
        map: labelTexture,
        transparent: true
      });
      const label = new THREE.Sprite(labelMaterial);
      label.scale.set(20, 5, 1);
      label.position.set(0, planet.size + 5, 0);
      mesh.add(label);

      // Add rings for Saturn
      if (name === 'Saturn') {
        const ringsGeometry = new THREE.RingGeometry(
          planet.size * 1.5,
          planet.size * 2.5,
          64
        );
        const ringsMaterial = new THREE.MeshPhongMaterial({
          color: 0xcccccc,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8
        });
        const rings = new THREE.Mesh(ringsGeometry, ringsMaterial);
        rings.rotation.x = Math.PI / 2;
        mesh.add(rings);
      }

      sceneRef.current.add(mesh);
      console.log(`${name} added to scene at position:`, mesh.position);
      
      objects.push({
        mesh,
        orbit,
        rotationSpeed: 0.01,
        label
      });
    }

    console.log('All planets created successfully');
    return objects;
  };

  const focusOnPlanet = (planetName) => {
    if (!planetObjectsRef.current) return;
    
    if (planetName === 'Sun') {
      // Focus on sun
      targetPosition.current = {
        x: 0,
        y: 0,
        z: 100
      };
      setIsTransitioning(true);
      setSelectedPlanet(planetName);
      return;
    }
    
    // Find the planet object in our ref
    const planetObject = planetObjectsRef.current.find(obj => {
      const planetMesh = obj.mesh;
      return planetMesh.userData.planetName === planetName;
    });

    if (!planetObject) {
      console.error(`Planet ${planetName} not found in scene`);
      return;
    }

    const planet = planets[planetName];
    
    // Calculate target position to focus on the planet
    const distance = planet.distance * 1.5; // Distance from planet to view it
    const angle = Math.atan2(planetObject.mesh.position.z, planetObject.mesh.position.x);
    
    targetPosition.current = {
      x: planetObject.mesh.position.x + Math.cos(angle) * distance,
      y: 0,
      z: planetObject.mesh.position.z + Math.sin(angle) * distance
    };
    
    setIsTransitioning(true);
    setSelectedPlanet(planetName);
  };

  const createMilkyWay = () => {
    // Create a large sphere for the galaxy background
    const geometry = new THREE.SphereGeometry(1000, 60, 40);
    // Flip the geometry inside out
    geometry.scale(-1, 1, 1);

    // Create a procedural Milky Way texture
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add stars
    for (let i = 0; i < 10000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 1.5;
      const opacity = Math.random() * 0.8 + 0.2;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
    }

    // Add Milky Way band
    const centerY = canvas.height / 2;
    const bandHeight = canvas.height * 0.4;
    
    for (let y = 0; y < canvas.height; y++) {
      const distanceFromCenter = Math.abs(y - centerY) / (bandHeight / 2);
      if (distanceFromCenter < 1) {
        const opacity = (1 - distanceFromCenter) * 0.5; // Increased opacity
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fillRect(0, y, canvas.width, 1);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      transparent: true,
      opacity: 1.0 // Increased opacity
    });

    const milkyWay = new THREE.Mesh(geometry, material);
    milkyWay.userData.type = 'milkyWay';
    sceneRef.current.add(milkyWay);

    return milkyWay;
  };

  const createNebulae = () => {
    const nebulae = [];
    
    // Create multiple nebulae with different colors and positions
    const nebulaColors = [
      { color: 0xff00ff, intensity: 0.5 }, // Pink - increased intensity
      { color: 0x00ffff, intensity: 0.4 }, // Cyan - increased intensity
      { color: 0xff8800, intensity: 0.45 }, // Orange - increased intensity
      { color: 0x8800ff, intensity: 0.4 }  // Purple - increased intensity
    ];

    nebulaColors.forEach(({ color, intensity }, index) => {
      const geometry = new THREE.SphereGeometry(300, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(color) },
          time: { value: 0 },
          intensity: { value: intensity }
        },
        vertexShader: `
          varying vec3 vPosition;
          void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform float time;
          uniform float intensity;
          varying vec3 vPosition;
          
          float noise(vec3 p) {
            return fract(sin(dot(p, vec3(12.9898, 78.233, 45.5432))) * 43758.5453);
          }
          
          void main() {
            float n = noise(vPosition * 0.1 + time * 0.1);
            vec3 finalColor = color * n * intensity;
            gl_FragColor = vec4(finalColor, n * intensity);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
      });

      const nebula = new THREE.Mesh(geometry, material);
      nebula.userData.type = 'nebula';
      
      // Position nebulae at different locations
      const angle = (index / nebulaColors.length) * Math.PI * 2;
      const distance = 800;
      nebula.position.set(
        Math.cos(angle) * distance,
        (Math.random() - 0.5) * 200,
        Math.sin(angle) * distance
      );
      
      sceneRef.current.add(nebula);
      nebulae.push(nebula);
    });

    return nebulae;
  };

  const createDistantGalaxies = () => {
    const galaxies = [];
    
    // Create multiple distant galaxies
    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.SphereGeometry(50, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color(0xffffff) }
        },
        vertexShader: `
          varying vec3 vPosition;
          void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 color;
          varying vec3 vPosition;
          
          float spiral(vec2 st) {
            float r = length(st);
            float theta = atan(st.y, st.x);
            return sin(r * 10.0 + theta * 5.0 + time) * 0.5 + 0.5;
          }
          
          void main() {
            vec2 st = vPosition.xy * 0.5;
            float pattern = spiral(st);
            gl_FragColor = vec4(color * pattern, pattern * 0.5);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
      });

      const galaxy = new THREE.Mesh(geometry, material);
      
      // Position galaxies at different locations
      const angle = (i / 5) * Math.PI * 2;
      const distance = 1200;
      galaxy.position.set(
        Math.cos(angle) * distance,
        (Math.random() - 0.5) * 400,
        Math.sin(angle) * distance
      );
      
      sceneRef.current.add(galaxy);
      galaxies.push(galaxy);
    }

    return galaxies;
  };

  const initScene = async () => {
    try {
      console.log('Initializing scene...');
      
      // Create scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      sceneRef.current = scene;
      console.log('Scene created');

      // Create camera
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
      );
      camera.position.set(0, 50, 200);
      cameraRef.current = camera;
      console.log('Camera created');

      // Create renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;
      console.log('Renderer created');

      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
      scene.add(ambientLight);

      // Create Milky Way background
      const milkyWay = createMilkyWay();
      console.log('Milky Way created');

      // Create nebulae
      const nebulae = createNebulae();
      console.log('Nebulae created');

      // Create distant galaxies
      const galaxies = createDistantGalaxies();
      console.log('Distant galaxies created');

      // Create sun
      const sunGeometry = new THREE.SphereGeometry(10, 64, 64);
      const sunTexture = new THREE.TextureLoader().load('/sun.jpg');
      const sunMaterial = new THREE.MeshBasicMaterial({
        map: sunTexture,
        emissive: 0xffff00,
        emissiveIntensity: 0.5
      });
      const sun = new THREE.Mesh(sunGeometry, sunMaterial);
      sun.castShadow = true;
      scene.add(sun);

      // Add sun glow
      const sunGlowGeometry = new THREE.SphereGeometry(12, 32, 32);
      const sunGlowMaterial = new THREE.ShaderMaterial({
        uniforms: {
          viewVector: { type: "v3", value: camera.position }
        },
        vertexShader: `
          uniform vec3 viewVector;
          varying float intensity;
          void main() {
            vec3 vNormal = normalize(normalMatrix * normal);
            vec3 vNormel = normalize(normalMatrix * viewVector);
            intensity = pow(0.7 - dot(vNormal, vNormel), 2.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying float intensity;
          void main() {
            vec3 glow = vec3(1.0, 0.7, 0.3) * intensity;
            gl_FragColor = vec4(glow, 1.0);
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      });
      const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
      sun.add(sunGlow);
      console.log('Sun created with glow effect');

      // Create stars
      const starsGeometry = new THREE.BufferGeometry();
      const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.8
      });

      const starsVertices = [];
      for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
      }

      starsGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(starsVertices, 3)
      );
      const stars = new THREE.Points(starsGeometry, starsMaterial);
      scene.add(stars);
      console.log('Stars created');

      // Create planets
      const planetObjects = await createPlanets();
      planetObjectsRef.current = planetObjects;
      console.log('Planets created');

      // Update animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        
        // Rotate Milky Way very slowly
        if (milkyWay) {
          milkyWay.rotation.y += 0.0001;
        }

        // Animate nebulae
        nebulae.forEach((nebula, index) => {
          nebula.material.uniforms.time.value += 0.001;
          nebula.rotation.y += 0.0002;
        });

        // Animate galaxies
        galaxies.forEach((galaxy, index) => {
          galaxy.material.uniforms.time.value += 0.002;
          galaxy.rotation.z += 0.0003;
        });

        // Update sun glow
        if (sunGlow) {
          sunGlow.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(
            camera.position,
            sun.position
          );
        }

        // ... rest of the animation code ...
      };

      animate();
      console.log('Animation loop started');

    } catch (error) {
      console.error('Error initializing scene:', error);
      setError('Failed to initialize the solar system. Please try refreshing the page.');
    }
  };

  useEffect(() => {
    let mounted = true;
    let animationFrameId = null;
    let currentZoom = 300;

    const initScene = () => {
      try {
        console.log('Initializing scene...');
        if (!containerRef.current) {
          throw new Error('Container ref is not available');
        }

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        sceneRef.current = scene;
        console.log('Scene created');

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
          45,
          containerRef.current.clientWidth / containerRef.current.clientHeight,
          0.1,
          2000
        );
        camera.position.z = currentZoom;
        cameraRef.current = camera;
        console.log('Camera created and positioned at:', camera.position);

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true, 
          alpha: true,
          logarithmicDepthBuffer: true
        });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        rendererRef.current = renderer;
        console.log('Renderer created with size:', containerRef.current.clientWidth, containerRef.current.clientHeight);

        // Clear any existing content
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
        containerRef.current.appendChild(renderer.domElement);
        console.log('Renderer appended to container');

        // Create and add sun
        const sun = createSun();
        scene.add(sun);
        console.log('Sun added at position:', sun.position);

        // Create stars
        const stars = createStars();
        scene.add(stars);
        console.log('Stars added');

        // Create asteroid belt
        const asteroidBelt = createAsteroidBelt();
        scene.add(asteroidBelt);
        console.log('Asteroid belt added');

        // Initialize planets
        console.log('Starting planet creation...');
        createPlanets().then(objects => {
          if (!mounted) return;
          console.log('Planets created successfully:', objects.length);
          planetObjectsRef.current = objects;
          
          // Log planet positions
          objects.forEach(({ mesh }, index) => {
            console.log(`Planet ${index + 1} position:`, mesh.position);
          });
          
          setLoading(false);
          animate();
        }).catch(err => {
          if (!mounted) return;
          console.error('Error creating planets:', err);
          setError('Failed to create planets: ' + err.message);
          setLoading(false);
        });

        // Animation loop
        const animate = () => {
          if (!mounted) return;
          
          animationFrameId = requestAnimationFrame(animate);

          // Handle camera transition
          if (isTransitioning) {
            const transitionSpeed = 0.05;
            currentPosition.current.x += (targetPosition.current.x - currentPosition.current.x) * transitionSpeed;
            currentPosition.current.y += (targetPosition.current.y - currentPosition.current.y) * transitionSpeed;
            currentPosition.current.z += (targetPosition.current.z - currentPosition.current.z) * transitionSpeed;

            // Check if transition is complete
            const distance = Math.sqrt(
              Math.pow(targetPosition.current.x - currentPosition.current.x, 2) +
              Math.pow(targetPosition.current.y - currentPosition.current.y, 2) +
              Math.pow(targetPosition.current.z - currentPosition.current.z, 2)
            );

            if (distance < 0.1) {
              setIsTransitioning(false);
            }

            cameraRef.current.position.set(
              currentPosition.current.x,
              currentPosition.current.y,
              currentPosition.current.z
            );
            
            if (selectedPlanet) {
              const planetIndex = Object.keys(planets).indexOf(selectedPlanet);
              if (planetIndex !== -1) {
                const { mesh } = planetObjectsRef.current[planetIndex];
                cameraRef.current.lookAt(mesh.position);
              }
            }
          } else {
            // Normal camera rotation
            currentRotation.x += (targetRotation.x - currentRotation.x) * 0.1;
            currentRotation.y += (targetRotation.y - currentRotation.y) * 0.1;

            cameraRef.current.position.x = currentZoom * Math.sin(currentRotation.y) * Math.cos(currentRotation.x);
            cameraRef.current.position.y = currentZoom * Math.sin(currentRotation.x);
            cameraRef.current.position.z = currentZoom * Math.cos(currentRotation.y) * Math.cos(currentRotation.x);
            cameraRef.current.lookAt(0, 0, 0);
          }

          // Update planets
          if (planetObjectsRef.current && planetObjectsRef.current.length > 0) {
            planetObjectsRef.current.forEach(({ mesh, orbit, rotationSpeed, label }, index) => {
              const planet = Object.values(planets)[index];
              const time = Date.now() * 0.001;
              const angle = (time / (planet.period * 10)) % (Math.PI * 2);
              
              mesh.position.x = Math.cos(angle) * planet.distance;
              mesh.position.z = Math.sin(angle) * planet.distance;
              
              if (label) {
                label.material.rotation = -mesh.rotation.y;
              }
              
              mesh.rotation.y += rotationSpeed;
            });
          }

          // Rotate asteroid belt and stars
          if (asteroidBelt) {
            asteroidBelt.rotation.y += 0.0001;
          }
          if (stars) {
            stars.rotation.y += 0.0001;
          }

          rendererRef.current.render(sceneRef.current, cameraRef.current);
        };

        // Handle window resize
        const handleResize = () => {
          if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
          
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;

          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        // Mouse controls
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let currentRotation = { x: 0, y: 0 };
        let targetRotation = { x: 0, y: 0 };

        const onMouseDown = (event) => {
          isDragging = true;
          previousMousePosition = {
            x: event.clientX,
            y: event.clientY
          };
        };

        const onMouseMove = (event) => {
          if (!isDragging) return;

          const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
          };

          targetRotation.y += deltaMove.x * 0.01;
          targetRotation.x += deltaMove.y * 0.01;
          targetRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotation.x));

          previousMousePosition = {
            x: event.clientX,
            y: event.clientY
          };
        };

        const onMouseUp = () => {
          isDragging = false;
        };

        const onWheel = (event) => {
          event.preventDefault();
          const zoomFactor = 0.001;
          const zoomDelta = event.deltaY * zoomFactor;
          currentZoom = Math.max(50, Math.min(2000, currentZoom * (1 + zoomDelta)));
        };

        containerRef.current.addEventListener('mousedown', onMouseDown);
        containerRef.current.addEventListener('mousemove', onMouseMove);
        containerRef.current.addEventListener('mouseup', onMouseUp);
        containerRef.current.addEventListener('mouseleave', onMouseUp);
        containerRef.current.addEventListener('wheel', onWheel);

        return () => {
          mounted = false;
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
          window.removeEventListener('resize', handleResize);
          if (containerRef.current) {
            containerRef.current.removeEventListener('mousedown', onMouseDown);
            containerRef.current.removeEventListener('mousemove', onMouseMove);
            containerRef.current.removeEventListener('mouseup', onMouseUp);
            containerRef.current.removeEventListener('mouseleave', onMouseUp);
            containerRef.current.removeEventListener('wheel', onWheel);
            
            if (rendererRef.current) {
              containerRef.current.removeChild(rendererRef.current.domElement);
            }
          }
        };
      } catch (err) {
        console.error('Error in PlanetTracker setup:', err);
        setError('Failed to initialize solar system: ' + err.message);
        setLoading(false);
      }
    };

    initScene();
  }, []);

  return (
    <div className="planet-tracker-container relative w-full h-screen bg-black">
      <div ref={containerRef} className="planet-tracker-canvas w-full h-full" style={{ position: 'relative', zIndex: 1 }} />
      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-lg text-white text-center">Loading Solar System...</p>
        </div>
      )}
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white p-4 rounded-lg z-10">
          <h3 className="text-xl font-bold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}
      {showInfo && !error && !loading && (
        <div style={infoPanelStyle}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Solar System Explorer</h2>
            <button 
              onClick={() => setShowInfo(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Select a Celestial Body</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => focusOnPlanet('Sun')}
                style={selectedPlanet === 'Sun' ? selectedPlanetButtonStyle : planetButtonStyle}
                className="transition-all duration-200 hover:bg-opacity-20"
              >
                Sun
              </button>
              {Object.keys(planets).filter(planet => planet !== 'Sun').map(planet => (
                <button
                  key={planet}
                  onClick={() => focusOnPlanet(planet)}
                  style={selectedPlanet === planet ? selectedPlanetButtonStyle : planetButtonStyle}
                  className="transition-all duration-200 hover:bg-opacity-20"
                >
                  {planet}
                </button>
              ))}
            </div>
          </div>

          {selectedPlanet && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: planets[selectedPlanet].color }}
                />
                <h3 className="text-xl font-semibold" style={{ color: planets[selectedPlanet].color }}>
                  {selectedPlanet}
                </h3>
              </div>

              <div style={statBoxStyle}>
                <p className="text-gray-300 mb-3">
                  {planets[selectedPlanet].description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedPlanet === 'Sun' ? (
                  <>
                    <div style={statBoxStyle}>
                      <p className="text-sm text-gray-400 mb-1">Surface Temperature</p>
                      <p className="text-lg font-semibold">
                        {planets[selectedPlanet].temperature}
                      </p>
                    </div>
                    <div style={statBoxStyle}>
                      <p className="text-sm text-gray-400 mb-1">Mass</p>
                      <p className="text-lg font-semibold">
                        {planets[selectedPlanet].mass}
                      </p>
                    </div>
                    <div style={statBoxStyle}>
                      <p className="text-sm text-gray-400 mb-1">Diameter</p>
                      <p className="text-lg font-semibold">
                        {planets[selectedPlanet].diameter}
                      </p>
                    </div>
                    <div style={statBoxStyle}>
                      <p className="text-sm text-gray-400 mb-1">Type</p>
                      <p className="text-lg font-semibold">
                        {planets[selectedPlanet].type}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={statBoxStyle}>
                      <p className="text-sm text-gray-400 mb-1">Orbital Period</p>
                      <p className="text-lg font-semibold">
                        {planets[selectedPlanet].period} Earth years
                      </p>
                    </div>
                    <div style={statBoxStyle}>
                      <p className="text-sm text-gray-400 mb-1">Distance from Sun</p>
                      <p className="text-lg font-semibold">
                        {planets[selectedPlanet].distance} million km
                      </p>
                    </div>
                    <div style={statBoxStyle}>
                      <p className="text-sm text-gray-400 mb-1">Size</p>
                      <p className="text-lg font-semibold">
                        {planets[selectedPlanet].size} units
                      </p>
                    </div>
                    <div style={statBoxStyle}>
                      <p className="text-sm text-gray-400 mb-1">Axial Tilt</p>
                      <p className="text-lg font-semibold">
                        {planets[selectedPlanet].tilt} radians
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 text-sm text-gray-400">
                <p>Click and drag to rotate view</p>
                <p>Scroll to zoom in/out</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Space Effects Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '20px',
        borderRadius: '15px',
        color: 'white',
        zIndex: 1000,
        minWidth: '280px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '15px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          paddingBottom: '10px'
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#fff',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>Space Effects</h3>
          <button
            onClick={() => setDebugInfo(prev => ({ ...prev, showDebugPanel: !prev.showDebugPanel }))}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '20px',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            {debugInfo.showDebugPanel ? '−' : '+'}
          </button>
        </div>

        {debugInfo.showDebugPanel && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ 
                margin: '0 0 12px 0',
                fontSize: '1.1rem',
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}>Visibility</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { name: 'Milky Way', type: 'milkyWay' },
                  { name: 'Nebulae', type: 'nebula' },
                  { name: 'Distant Galaxies', type: 'galaxy' }
                ].map(({ name, type }) => (
                  <label key={name} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}>
                    <input
                      type="checkbox"
                      checked={debugInfo[`${type}Visible`]}
                      onChange={(e) => {
                        setDebugInfo(prev => ({ ...prev, [`${type}Visible`]: e.target.checked }));
                        sceneRef.current?.children.forEach(child => {
                          if (child.userData.type === type) {
                            child.visible = e.target.checked;
                          }
                        });
                      }}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ 
                      fontSize: '1rem',
                      color: '#fff',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}>{name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ 
                margin: '0 0 12px 0',
                fontSize: '1.1rem',
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}>Effects Intensity</h4>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px'
              }}>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={debugInfo.effectsIntensity}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setDebugInfo(prev => ({ ...prev, effectsIntensity: value }));
                    sceneRef.current?.children.forEach(child => {
                      if (child.userData.type === 'milkyWay' || child.userData.type === 'nebula') {
                        if (child.material.opacity !== undefined) {
                          child.material.opacity = value;
                        }
                        if (child.material.uniforms?.intensity) {
                          child.material.uniforms.intensity.value = value;
                        }
                      }
                    });
                  }}
                  style={{ 
                    flex: 1,
                    height: '6px',
                    WebkitAppearance: 'none',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '3px',
                    outline: 'none'
                  }}
                />
                <span style={{ 
                  minWidth: '40px', 
                  textAlign: 'right',
                  color: '#fff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}>
                  {debugInfo.effectsIntensity.toFixed(1)}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ 
                margin: '0 0 12px 0',
                fontSize: '1.1rem',
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}>Camera Position</h4>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px'
              }}>
                {['X', 'Y', 'Z'].map((axis) => (
                  <div key={axis} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    color: '#fff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}>
                    <span style={{ minWidth: '60px' }}>{axis}:</span>
                    <span>{cameraRef.current?.position[axis.toLowerCase()].toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (cameraRef.current) {
                  cameraRef.current.position.set(0, 50, 200);
                  targetPosition.current = { x: 0, y: 0, z: 200 };
                }
              }}
              style={{
                background: 'rgba(74, 144, 226, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(74, 144, 226, 0.9)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(74, 144, 226, 0.8)'}
            >
              Reset Camera
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PlanetTracker; 