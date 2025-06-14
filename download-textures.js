const https = require('https');
const fs = require('fs');
const path = require('path');

const textures = {
  'mercury.jpg': 'https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/mercury_messenger_enhanced_color_map.jpg',
  'venus.jpg': 'https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004824/venus_magellan_colorized.jpg',
  'mars.jpg': 'https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/mars_viking_enhanced_color_map.jpg',
  'jupiter.jpg': 'https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004892/jupiter_cassini_cylindrical_map.jpg',
  'saturn.jpg': 'https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004851/saturn_cassini_cylindrical_map.jpg',
  'uranus.jpg': 'https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004851/uranus_voyager_cylindrical_map.jpg',
  'neptune.jpg': 'https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004851/neptune_voyager_cylindrical_map.jpg',
  'saturn-rings.png': 'https://www.solarsystemscope.com/textures/download/8k_saturn_ring_alpha.png',
  'glow.png': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/sprites/glow.png'
};

const downloadTexture = (url, filename) => {
  const targetPath = path.join(__dirname, 'public', 'textures', 'planets', filename);
  
  https.get(url, (response) => {
    if (response.statusCode === 200) {
      const fileStream = fs.createWriteStream(targetPath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        console.log(`Downloaded: ${filename}`);
        fileStream.close();
      });
    } else {
      console.error(`Failed to download ${filename}: ${response.statusCode}`);
    }
  }).on('error', (err) => {
    console.error(`Error downloading ${filename}: ${err.message}`);
  });
};

// Create directories if they don't exist
const texturesDir = path.join(__dirname, 'public', 'textures', 'planets');
if (!fs.existsSync(texturesDir)) {
  fs.mkdirSync(texturesDir, { recursive: true });
}

// Download all textures
Object.entries(textures).forEach(([filename, url]) => {
  downloadTexture(url, filename);
}); 