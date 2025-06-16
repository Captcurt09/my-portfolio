import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import { FaSatellite, FaRoute, FaClock, FaExclamationTriangle, FaRocket, FaUsers, FaWeight, FaTemperatureHigh, FaSun } from 'react-icons/fa';
import * as satellite from 'satellite.js';

// Starfield background component
const Starfield = () => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Create stars
    const createStars = () => {
      const stars = [];
      for (let i = 0; i < 200; i++) {
        // Random star color between white and light blue
        const color = Math.random() > 0.8 ? '#a8d8ff' : '#ffffff';
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 3 + 0.5, // More varied sizes
          speed: Math.random() * 0.3 + 0.1, // Slower, more varied speeds
          opacity: Math.random() * 0.7 + 0.3, // More varied opacity
          color: color,
          twinkleSpeed: Math.random() * 0.02 + 0.01, // Twinkling effect
          twinkleDirection: Math.random() > 0.5 ? 1 : -1
        });
      }
      return stars;
    };

    starsRef.current = createStars();

    // Animation function
    const animate = () => {
      // Clear the entire canvas with a solid color
      ctx.fillStyle = 'rgb(17, 24, 39)';
      ctx.fillRect(0, 0, width, height);

      starsRef.current.forEach(star => {
        // Update opacity for twinkling effect
        star.opacity += star.twinkleSpeed * star.twinkleDirection;
        if (star.opacity > 1 || star.opacity < 0.3) {
          star.twinkleDirection *= -1;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `${star.color}${Math.floor(star.opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();

        // Move star
        star.y += star.speed;
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}
    />
  );
};

// TLE data for ISS
const tleLine1 = '1 25544U 98067A   24054.91666667  .00016717  00000+0  31410-3 0  9992';
const tleLine2 = '2 25544  51.6416 161.5516 0004203  77.1688 282.9027 15.49791382440452';

// Initialize satellite record
const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

const ISSTracker = () => {
  const [issData, setIssData] = useState({
    latitude: 0,
    longitude: 0,
    altitude: 0,
    velocity: 0,
    timestamp: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pathPositions, setPathPositions] = useState([]);
  const [showPath, setShowPath] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('Initializing...');
  const [issInfo, setIssInfo] = useState({
    speed: 27600, // km/h
    altitude: 400, // km
    crew: 7,
    weight: 419725, // kg
    temperature: {
      internal: 23, // °C
      external: -150 // °C
    },
    solarPanels: 8,
    modules: 16,
    orbitPeriod: 92.68, // minutes
    launches: 42
  });
  const [cameraPosition, setCameraPosition] = useState({ lon: 0, lat: 0, zoom: 1 });

  // Generate random star positions
  const generateStars = () => {
    const stars = [];
    for (let i = 0; i < 1000; i++) {
      stars.push({
        longitude: Math.random() * 360 - 180,
        latitude: Math.random() * 180 - 90,
        size: Math.random() * 2 + 1
      });
    }
    return stars;
  };

  const [stars] = useState(generateStars());

  const calculateISSPosition = () => {
    try {
      const date = new Date();
      const positionAndVelocity = satellite.propagate(satrec, date);
      
      if (!positionAndVelocity.position) {
        return null;
      }

      const positionEci = positionAndVelocity.position;
      const gmst = satellite.gstime(date);
      const positionGd = satellite.eciToGeodetic(positionEci, gmst);

      const longitude = satellite.degreesLong(positionGd.longitude);
      const latitude = satellite.degreesLat(positionGd.latitude);
      const altitude = positionGd.height;

      // Calculate velocity in km/h
      const velocity = positionAndVelocity.velocity;
      const speed = Math.sqrt(
        velocity.x * velocity.x +
        velocity.y * velocity.y +
        velocity.z * velocity.z
      ) * 3.6; // Convert m/s to km/h

      return {
        latitude,
        longitude,
        altitude,
        velocity: speed,
        timestamp: date.toISOString()
      };
    } catch (err) {
      console.error('Error calculating ISS position:', err);
      return null;
    }
  };

  const fetchISSData = async () => {
    try {
      setLoading(true);
      setError(null);
      setUpdateStatus('Updating...');

      const position = calculateISSPosition();
      
      if (!position) {
        throw new Error('Failed to calculate ISS position');
      }

      setIssData(position);

      setPathPositions(prev => {
        const newPath = [...prev, {
          latitude: position.latitude,
          longitude: position.longitude,
          timestamp: position.timestamp
        }];
        return newPath.slice(-100);
      });

      setUpdateStatus('Updated');
      setLoading(false);
    } catch (err) {
      console.error('Error fetching ISS data:', err);
      setError(err.message);
      setUpdateStatus('Error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchISSData();
    const interval = setInterval(fetchISSData, 2000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (updateStatus) {
      case 'Updated':
        return 'bg-green-500';
      case 'Updating...':
        return 'bg-yellow-500';
      case 'Error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (updateStatus) {
      case 'Updated':
        return 'Live Tracking';
      case 'Updating...':
        return 'Updating...';
      case 'Error':
        return 'Connection Error';
      default:
        return 'Initializing...';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-300 text-lg">Initializing ISS Tracker...</p>
        </div>
      </div>
    );
  }

  // Prepare data for Plotly
  const currentPosition = issData ? [
    parseFloat(issData.latitude),
    parseFloat(issData.longitude)
  ] : [0, 0];

  const pathData = showPath && pathPositions.length > 1 ? {
    type: 'scattergeo',
    mode: 'lines',
    line: {
      color: '#FF4B4B',
      width: 3
    },
    lat: pathPositions.map(pos => pos.latitude),
    lon: pathPositions.map(pos => pos.longitude),
    name: 'ISS Path'
  } : null;

  const markerData = {
    type: 'scattergeo',
    mode: 'markers',
    marker: {
      size: 10,
      color: '#FF4B4B',
      symbol: 'circle'
    },
    lat: [currentPosition[0]],
    lon: [currentPosition[1]],
    name: 'ISS Current Position',
    text: [`Lat: ${issData?.latitude.toFixed(2)}° N<br>Lon: ${issData?.longitude.toFixed(2)}° E`],
    hoverinfo: 'text'
  };

  const data = [markerData];
  if (pathData) {
    data.unshift(pathData);
  }

  return (
    <div className="min-h-screen relative">
      <Starfield />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Panel - Controls and Info */}
            <div className="w-full lg:w-1/3 space-y-6">
              <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FaSatellite className="text-blue-500" />
                    ISS Tracker
                  </h1>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
                    <span className="text-sm text-gray-300">{getStatusText()}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-white mb-2">Current Position</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 rounded p-3">
                        <p className="text-sm text-gray-400">Latitude</p>
                        <p className="text-xl font-mono text-white">{issData?.latitude.toFixed(4)}° N</p>
                      </div>
                      <div className="bg-gray-800 rounded p-3">
                        <p className="text-sm text-gray-400">Longitude</p>
                        <p className="text-xl font-mono text-white">{issData?.longitude.toFixed(4)}° E</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                      <FaRocket className="text-blue-500" />
                      Speed & Altitude
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 rounded p-3">
                        <p className="text-sm text-gray-400">Speed</p>
                        <p className="text-xl font-mono text-white">{issInfo.speed.toLocaleString()} km/h</p>
                      </div>
                      <div className="bg-gray-800 rounded p-3">
                        <p className="text-sm text-gray-400">Altitude</p>
                        <p className="text-xl font-mono text-white">{issInfo.altitude} km</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                      <FaUsers className="text-blue-500" />
                      Crew & Weight
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 rounded p-3">
                        <p className="text-sm text-gray-400">Current Crew</p>
                        <p className="text-xl font-mono text-white">{issInfo.crew} astronauts</p>
                      </div>
                      <div className="bg-gray-800 rounded p-3">
                        <p className="text-sm text-gray-400">Total Weight</p>
                        <p className="text-xl font-mono text-white">{(issInfo.weight / 1000).toFixed(1)} tons</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                      <FaTemperatureHigh className="text-blue-500" />
                      Temperature
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 rounded p-3">
                        <p className="text-sm text-gray-400">Internal</p>
                        <p className="text-xl font-mono text-white">{issInfo.temperature.internal}°C</p>
                      </div>
                      <div className="bg-gray-800 rounded p-3">
                        <p className="text-sm text-gray-400">External</p>
                        <p className="text-xl font-mono text-white">{issInfo.temperature.external}°C</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                      <FaSun className="text-blue-500" />
                      Station Details
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 rounded p-3">
                        <p className="text-sm text-gray-400">Solar Panels</p>
                        <p className="text-xl font-mono text-white">{issInfo.solarPanels}</p>
                      </div>
                      <div className="bg-gray-800 rounded p-3">
                        <p className="text-sm text-gray-400">Modules</p>
                        <p className="text-xl font-mono text-white">{issInfo.modules}</p>
                      </div>
                      <div className="bg-gray-800 rounded p-3">
                        <p className="text-sm text-gray-400">Orbit Period</p>
                        <p className="text-xl font-mono text-white">{issInfo.orbitPeriod} min</p>
                      </div>
                      <div className="bg-gray-800 rounded p-3">
                        <p className="text-sm text-gray-400">Total Launches</p>
                        <p className="text-xl font-mono text-white">{issInfo.launches}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <FaRoute className="text-blue-500" />
                        Path Tracking
                      </h2>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showPath}
                          onChange={(e) => setShowPath(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <p className="text-sm text-gray-400">Tracked Points: {pathPositions.length}</p>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                      <FaClock className="text-blue-500" />
                      Last Update
                    </h2>
                    <p className="text-gray-300">{lastUpdate?.toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-amber-900/50 border border-amber-500 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-amber-500 mb-2">
                    <FaExclamationTriangle />
                    <h3 className="font-semibold">Connection Warning</h3>
                  </div>
                  <p className="text-amber-200 text-sm mb-3">{error}</p>
                  <button 
                    onClick={fetchISSData}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Retry Connection
                  </button>
                </div>
              )}
            </div>

            {/* Right Panel - Globe */}
            <div className="w-full lg:w-2/3">
              <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700" style={{ height: '600px' }}>
                <Plot
                  data={[
                    {
                      type: 'scattergeo',
                      mode: 'markers',
                      lon: [issData.longitude],
                      lat: [issData.latitude],
                      marker: {
                        size: 15,
                        color: '#00ff00',
                        symbol: 'circle',
                        line: {
                          color: '#ffffff',
                          width: 2
                        }
                      },
                      name: 'ISS',
                      hoverinfo: 'text',
                      text: `ISS Position<br>Lat: ${issData.latitude.toFixed(2)}°<br>Lon: ${issData.longitude.toFixed(2)}°<br>Alt: ${issData.altitude.toFixed(2)} km<br>Speed: ${issData.velocity.toFixed(2)} km/h`
                    },
                    {
                      type: 'scattergeo',
                      mode: 'lines',
                      lon: pathPositions.map(p => p.longitude),
                      lat: pathPositions.map(p => p.latitude),
                      line: {
                        color: '#00ff00',
                        width: 2,
                        dash: 'dot'
                      },
                      name: 'Path',
                      hoverinfo: 'none'
                    }
                  ]}
                  layout={{
                    geo: {
                      projection: {
                        type: 'orthographic',
                        rotation: {
                          lon: cameraPosition.lon,
                          lat: cameraPosition.lat,
                        },
                      },
                      showland: true,
                      showocean: true,
                      showcoastlines: true,
                      showcountries: true,
                      landcolor: '#2a2a2a',
                      oceancolor: '#1a1a1a',
                      coastlinecolor: '#404040',
                      countrycolor: '#404040',
                      bgcolor: 'transparent',
                      framecolor: 'transparent',
                      framewidth: 0,
                      margin: { l: 0, r: 0, t: 0, b: 0 },
                    },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent',
                    margin: { l: 0, r: 0, t: 0, b: 0 },
                    showlegend: false,
                    autosize: true,
                  }}
                  config={{
                    displayModeBar: false,
                    responsive: true,
                  }}
                  style={{ width: '100%', height: '100%' }}
                  onRelayout={(eventdata) => {
                    if (eventdata['geo.projection.rotation.lon'] !== undefined) {
                      setCameraPosition({
                        lon: eventdata['geo.projection.rotation.lon'],
                        lat: eventdata['geo.projection.rotation.lat'],
                        zoom: eventdata['geo.projection.scale'] || 1,
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ISSTracker; 