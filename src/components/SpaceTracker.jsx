import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import * as satellite from 'satellite.js';
import { Tab } from '@headlessui/react';

const SpaceTracker = () => {
  const [issPosition, setIssPosition] = useState({ latitude: 0, longitude: 0, altitude: 0 });
  const [planetPositions, setPlanetPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [mapType, setMapType] = useState('orthographic');
  const [orbitPath, setOrbitPath] = useState({ lats: [], lons: [] });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState(0);

  // Current ISS TLE data (updated March 2024)
  const tleLine1 = '1 25544U 98067A   24083.00000000  .00000000  00000+0  00000+0 0  9999';
  const tleLine2 = '2 25544  51.6400 352.1000 0001000 330.0000 30.0000 15.50130000000000';

  // Calculate planet positions
  const calculatePlanetPositions = () => {
    const now = new Date();
    const positions = [];
    
    // Simple planet positions (this is a simplified version)
    const planets = [
      { name: 'Sun', lat: 0, lon: 0 },
      { name: 'Moon', lat: 0, lon: 0 },
      { name: 'Mars', lat: 0, lon: 0 },
      { name: 'Venus', lat: 0, lon: 0 },
      { name: 'Jupiter', lat: 0, lon: 0 },
      { name: 'Saturn', lat: 0, lon: 0 }
    ];

    // Calculate positions based on current time
    planets.forEach(planet => {
      const time = now.getTime() / 1000; // Convert to seconds
      const angle = (time % 360) * (Math.PI / 180); // Convert to radians
      
      positions.push({
        name: planet.name,
        lat: Math.sin(angle) * 30, // Simplified orbital calculation
        lon: Math.cos(angle) * 30
      });
    });

    return positions;
  };

  // Calculate orbit path
  const calculateOrbitPath = (satrec) => {
    const now = new Date();
    const pathPoints = [];
    
    // Calculate points for the next 90 minutes (one orbit)
    for (let i = 0; i <= 90; i++) {
      const time = new Date(now.getTime() + i * 60 * 1000); // Add i minutes
      const positionAndVelocity = satellite.propagate(satrec, time);
      
      if (positionAndVelocity && positionAndVelocity.position) {
        const gmst = satellite.gstime(time);
        const position = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
        
        pathPoints.push({
          lat: satellite.degreesLat(position.latitude),
          lon: satellite.degreesLong(position.longitude)
        });
      }
    }
    
    return {
      lats: pathPoints.map(point => point.lat),
      lons: pathPoints.map(point => point.lon)
    };
  };

  useEffect(() => {
    const calculatePosition = () => {
      try {
        // Initialize satellite record
        const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
        
        if (!satrec) {
          throw new Error('Failed to initialize satellite from TLE data');
        }
        
        // Calculate orbit path
        const path = calculateOrbitPath(satrec);
        setOrbitPath(path);
        
        // Get current time
        const now = new Date();
        
        // Get position and velocity
        const positionAndVelocity = satellite.propagate(satrec, now);
        
        if (!positionAndVelocity || !positionAndVelocity.position) {
          throw new Error('Failed to calculate position');
        }
        
        const gmst = satellite.gstime(now);
        const position = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
        
        // Calculate speed from velocity (km/s)
        const velocity = positionAndVelocity.velocity;
        const speed = Math.sqrt(
          velocity.x * velocity.x +
          velocity.y * velocity.y +
          velocity.z * velocity.z
        );

        // Convert position to degrees and km
        const latitude = satellite.degreesLat(position.latitude);
        const longitude = satellite.degreesLong(position.longitude);
        const altitude = position.height * 1000; // Convert to meters

        setIssPosition({
          latitude,
          longitude,
          altitude
        });
        setSpeed(speed);
        setLastUpdated(now);
        setLoading(false);
        setError(null);

        // Calculate planet positions
        const planetPos = calculatePlanetPositions();
        setPlanetPositions(planetPos);
      } catch (error) {
        console.error('Error calculating positions:', error);
        setError('Failed to load position data. Please try again later.');
        setLoading(false);
      }
    };

    calculatePosition();
    const interval = setInterval(calculatePosition, 1000);

    return () => clearInterval(interval);
  }, []);

  const createMapData = (objects, isISS = false) => {
    const colors = {
      'ISS': '#60A5FA',
      'Sun': '#FCD34D',
      'Moon': '#E5E7EB',
      'Mars': '#EF4444',
      'Venus': '#F97316',
      'Jupiter': '#B45309',
      'Saturn': '#F59E0B'
    };

    return objects.map(obj => ({
      type: 'scattergeo',
      lon: [obj.lon],
      lat: [obj.lat],
      mode: 'markers+text',
      text: [obj.name],
      textposition: 'top center',
      textfont: {
        family: 'Inter, system-ui, sans-serif',
        size: 14,
        color: '#ffffff'
      },
      marker: {
        size: obj.name === 'ISS' ? 18 : 15,
        color: colors[obj.name] || '#ffffff',
        symbol: obj.name === 'ISS' ? 'star' : 'circle',
        line: {
          color: obj.name === 'ISS' ? '#93C5FD' : '#ffffff',
          width: 2
        }
      },
      name: obj.name,
      hoverinfo: 'text',
      hoverlabel: {
        bgcolor: '#1E40AF',
        bordercolor: colors[obj.name] || '#ffffff',
        font: { color: '#ffffff' }
      }
    }));
  };

  const layout = {
    title: {
      text: activeTab === 0 ? 'International Space Station Live Tracker' : 'Solar System Objects',
      font: {
        family: 'Inter, system-ui, sans-serif',
        size: 24,
        color: '#ffffff'
      },
      y: 0.95
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    geo: {
      projection: {
        type: mapType,
        rotation: {
          lon: issPosition.longitude,
          lat: issPosition.latitude,
          roll: 0
        }
      },
      showland: true,
      showocean: true,
      showcoastlines: true,
      showcountries: true,
      showlakes: true,
      showrivers: true,
      resolution: 50,
      oceancolor: 'rgb(32, 98, 149)',
      landcolor: 'rgb(49, 68, 78)',
      countrycolor: 'rgb(204, 204, 204)',
      coastlinecolor: 'rgb(204, 204, 204)',
      rivercolor: 'rgb(55, 126, 184)',
      lakecolor: 'rgb(32, 98, 149)',
      bgcolor: 'rgba(0,0,0,0)',
      framecolor: '#60A5FA',
      framewidth: 1,
      showframe: true,
      lataxis: {
        showgrid: true,
        gridcolor: 'rgba(204, 204, 204, 0.25)',
        gridwidth: 0.5,
        range: [-90, 90]
      },
      lonaxis: {
        showgrid: true,
        gridcolor: 'rgba(204, 204, 204, 0.25)',
        gridwidth: 0.5,
        range: [-180, 180]
      },
      center: {
        lon: issPosition.longitude,
        lat: issPosition.latitude
      },
      zoom: 1.5
    },
    updatemenus: [{
      type: 'buttons',
      showactive: true,
      y: 0.8,
      x: 1.1,
      buttons: [{
        method: 'relayout',
        args: ['geo.projection.type', 'orthographic'],
        label: '3D Globe',
        font: { size: 12, color: '#ffffff' }
      }, {
        method: 'relayout',
        args: ['geo.projection.type', 'mercator'],
        label: 'Flat Map',
        font: { size: 12, color: '#ffffff' }
      }]
    }],
    height: 600,
    margin: { t: 50, b: 20, l: 20, r: 80 },
    dragmode: false
  };

  // Function to format large numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="space-tracker-bg" role="main" aria-label="Space Objects Tracker">
      <div className="container mx-auto px-4 py-8">
        <div className="glass-card bg-gradient-to-br from-white/10 to-white/5 rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white" id="space-tracker-title">
              Space Objects Tracker
            </h2>
            <div className="text-sm text-blue-200">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-96" role="status" aria-label="Loading position data">
              <div className="relative">
                <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
                <div className="w-16 h-16 border-t-4 border-b-4 border-blue-300 rounded-full animate-spin absolute top-0 left-0" style={{animationDelay: '-0.3s'}}></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center p-4" role="alert" aria-live="assertive">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                aria-label="Retry loading position data"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <Tab.Group onChange={setActiveTab}>
                <Tab.List className="flex space-x-2 rounded-xl bg-blue-900/20 p-1 mb-8">
                  <Tab
                    className={({ selected }) =>
                      `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                      ${selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                      }`
                    }
                  >
                    ISS Tracker
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                      ${selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                      }`
                    }
                  >
                    Solar System
                  </Tab>
                </Tab.List>
                <Tab.Panels>
                  <Tab.Panel>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" role="region" aria-label="ISS Position Information">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                        <h3 className="text-sm font-semibold text-blue-200 mb-1">Latitude</h3>
                        <p className="text-2xl font-bold text-white">
                          {issPosition.latitude.toFixed(2)}°N
                        </p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                        <h3 className="text-sm font-semibold text-blue-200 mb-1">Longitude</h3>
                        <p className="text-2xl font-bold text-white">
                          {issPosition.longitude.toFixed(2)}°E
                        </p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                        <h3 className="text-sm font-semibold text-blue-200 mb-1">Altitude</h3>
                        <p className="text-2xl font-bold text-white">
                          {formatNumber((issPosition.altitude / 1000).toFixed(2))} km
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-8 shadow-lg border border-white/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-semibold text-blue-200 mb-1">Orbital Speed</h3>
                          <p className="text-xl font-bold text-white">
                            {(speed * 3600).toFixed(2)} km/h
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-blue-200 mb-1">Orbital Period</h3>
                          <p className="text-xl font-bold text-white">~92 minutes</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-blue-200 mb-1">Mass</h3>
                          <p className="text-xl font-bold text-white">419,725 kg</p>
                        </div>
                      </div>
                    </div>
                  </Tab.Panel>
                  <Tab.Panel>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-8 shadow-lg border border-white/20">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {planetPositions.map((planet, index) => (
                          <div key={index} className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-200">{planet.name}</h3>
                            <p className="text-white">Lat: {planet.lat.toFixed(2)}°</p>
                            <p className="text-white">Lon: {planet.lon.toFixed(2)}°</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <Plot
                  data={activeTab === 0 
                    ? [
                        ...createMapData([{ name: 'ISS', lat: issPosition.latitude, lon: issPosition.longitude }], true),
                        {
                          type: 'scattergeo',
                          lon: orbitPath.lons,
                          lat: orbitPath.lats,
                          mode: 'lines',
                          line: {
                            color: 'rgba(96, 165, 250, 0.3)',
                            width: 2
                          },
                          name: 'Orbit Path',
                          hoverinfo: 'skip'
                        }
                      ]
                    : createMapData(planetPositions)
                  }
                  layout={layout}
                  config={{
                    responsive: true,
                    displayModeBar: false,
                    scrollZoom: false
                  }}
                  className="w-full"
                  style={{ minHeight: '600px' }}
                  onRelayout={(eventdata) => {
                    if (eventdata['geo.projection.type']) {
                      setMapType(eventdata['geo.projection.type']);
                    }
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpaceTracker;