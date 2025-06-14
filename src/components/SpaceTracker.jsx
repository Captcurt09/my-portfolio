import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import * as satellite from 'satellite.js';
import { Tab } from '@headlessui/react';
import { FaSatellite, FaGlobe, FaRocket, FaClock, FaEye, FaInfoCircle } from 'react-icons/fa';

const SpaceTracker = () => {
  const [issPosition, setIssPosition] = useState({ latitude: 0, longitude: 0, altitude: 0 });
  const [speed, setSpeed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState(0);
  const [planetPositions, setPlanetPositions] = useState([]);
  const [mapType, setMapType] = useState('orthographic');
  const [orbitPath, setOrbitPath] = useState({ lats: [], lons: [] });
  const [issInfo, setIssInfo] = useState({
    crew: '7 astronauts',
    mission: 'Expedition 71',
    launchDate: 'March 21, 2024',
    nextPass: 'Calculating...',
    visibility: 'Visible'
  });

  // Current ISS TLE data
  const tleLine1 = '1 25544U 98067A   24083.00000000  .00000000  00000+0  00000+0 0  9999';
  const tleLine2 = '2 25544  51.6400 352.1000 0001000 330.0000 30.0000 15.50130000000000';

  const planetData = [
    {
      name: 'Sun',
      type: 'Star',
      diameter: '1,392,700 km',
      temperature: '5,778 K',
      age: '4.6 billion years',
      color: '#FFD700',
      size: 20
    },
    {
      name: 'Mercury',
      type: 'Terrestrial',
      diameter: '4,879 km',
      distance: '57.9 million km',
      orbitalPeriod: '88 days',
      color: '#A0522D',
      size: 5
    },
    {
      name: 'Venus',
      type: 'Terrestrial',
      diameter: '12,104 km',
      distance: '108.2 million km',
      orbitalPeriod: '225 days',
      color: '#DEB887',
      size: 8
    },
    {
      name: 'Earth',
      type: 'Terrestrial',
      diameter: '12,742 km',
      distance: '149.6 million km',
      orbitalPeriod: '365 days',
      color: '#4169E1',
      size: 9
    },
    {
      name: 'Mars',
      type: 'Terrestrial',
      diameter: '6,779 km',
      distance: '227.9 million km',
      orbitalPeriod: '687 days',
      color: '#CD5C5C',
      size: 7
    },
    {
      name: 'Jupiter',
      type: 'Gas Giant',
      diameter: '139,820 km',
      distance: '778.5 million km',
      orbitalPeriod: '4,333 days',
      color: '#DAA520',
      size: 15
    },
    {
      name: 'Saturn',
      type: 'Gas Giant',
      diameter: '116,460 km',
      distance: '1.4 billion km',
      orbitalPeriod: '10,759 days',
      color: '#F4A460',
      size: 14
    },
    {
      name: 'Uranus',
      type: 'Ice Giant',
      diameter: '50,724 km',
      distance: '2.9 billion km',
      orbitalPeriod: '30,687 days',
      color: '#87CEEB',
      size: 12
    },
    {
      name: 'Neptune',
      type: 'Ice Giant',
      diameter: '49,244 km',
      distance: '4.5 billion km',
      orbitalPeriod: '60,190 days',
      color: '#1E90FF',
      size: 12
    }
  ];

  const calculatePlanetPositions = () => {
    try {
      const now = new Date();
      const positions = planetData.map(planet => {
        const orbitalPeriod = planet.orbitalPeriod ? parseInt(planet.orbitalPeriod) : 365;
        const angle = (now.getTime() / (orbitalPeriod * 24 * 60 * 60 * 1000)) * 2 * Math.PI;
        
        const distance = planet.distance ? 
          parseInt(planet.distance.split(' ')[0]) / 1000000 : 
          (planet.name === 'Sun' ? 0 : 50 + Math.random() * 50);
        
        return {
          name: planet.name,
          latitude: Math.sin(angle) * distance,
          longitude: Math.cos(angle) * distance,
          info: {
            type: planet.type,
            diameter: planet.diameter,
            distance: planet.distance,
            orbitalPeriod: planet.orbitalPeriod,
            temperature: planet.temperature,
            age: planet.age
          },
          color: planet.color,
          size: planet.size
        };
      });
      return positions;
    } catch (error) {
      console.error('Error calculating planet positions:', error);
      return [];
    }
  };

  // Calculate orbit path
  const calculateOrbitPath = (satrec) => {
    const now = new Date();
    const pathPoints = [];
    
    // Calculate points for the next 90 minutes (one orbit)
    for (let i = 0; i <= 90; i++) {
      const time = new Date(now.getTime() + i * 60 * 1000);
      const positionAndVelocity = satellite.propagate(satrec, time);
      
      if (positionAndVelocity && positionAndVelocity.position) {
        const gmst = satellite.gstime(time);
        const position = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
        
        pathPoints.push({
          lat: satellite.degreesLat(position),
          lon: satellite.degreesLong(position)
        });
      }
    }
    
    return {
      lats: pathPoints.map(point => point.lat),
      lons: pathPoints.map(point => point.lon)
    };
  };

  const calculateNextPass = (lat, lon) => {
    // Simplified calculation - in reality, this would be more complex
    const now = new Date();
    const nextPass = new Date(now.getTime() + 90 * 60 * 1000); // 90 minutes from now
    return nextPass.toLocaleTimeString();
  };

  const calculateVisibility = (lat, lon) => {
    // Simplified visibility calculation
    const hour = new Date().getHours();
    return (hour >= 18 || hour <= 6) ? 'Visible' : 'Not Visible';
  };

  useEffect(() => {
    try {
      setLoading(true);
      const calculatePosition = () => {
        const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
        
        if (!satrec) {
          throw new Error('Failed to initialize satellite from TLE data');
        }
        
        const path = calculateOrbitPath(satrec);
        setOrbitPath(path);
        
        const now = new Date();
        const positionAndVelocity = satellite.propagate(satrec, now);
        
        if (!positionAndVelocity || !positionAndVelocity.position) {
          throw new Error('Failed to calculate position');
        }
        
        const gmst = satellite.gstime(now);
        const position = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
        
        const velocity = positionAndVelocity.velocity;
        const speed = Math.sqrt(
          velocity.x * velocity.x +
          velocity.y * velocity.y +
          velocity.z * velocity.z
        );

        const latitude = satellite.degreesLat(position);
        const longitude = satellite.degreesLong(position);
        const altitude = position.height / 1000;
        
        setIssPosition({
          latitude,
          longitude,
          altitude
        });
        setSpeed(speed / 1000);
        setLastUpdated(now);
        setError(null);

        const planetPos = calculatePlanetPositions();
        setPlanetPositions(planetPos);

        // Update ISS information
        setIssInfo(prev => ({
          ...prev,
          nextPass: calculateNextPass(latitude, longitude),
          visibility: calculateVisibility(latitude, longitude)
        }));
      };

      calculatePosition();
      const interval = setInterval(calculatePosition, 1000);
      
      setLoading(false);
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error in useEffect:', error);
      setError('An error occurred while initializing the tracker. Please refresh the page.');
      setLoading(false);
    }
  }, []);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2
    }).format(num);
  };

  const createMapData = (objects, isISS = false) => {
    try {
      return objects.map(obj => ({
        type: 'scattergeo',
        lon: [obj.longitude],
        lat: [obj.latitude],
        mode: isISS ? 'markers+text' : 'markers',
        text: isISS ? ['ISS'] : [`${obj.name}<br>${obj.info.type}<br>${obj.info.diameter}`],
        textposition: isISS ? 'top center' : undefined,
        textfont: isISS ? {
          family: 'Inter, system-ui, sans-serif',
          size: 16,
          color: '#ffffff'
        } : undefined,
        marker: {
          size: isISS ? 15 : obj.size,
          color: isISS ? '#FF0000' : obj.color,
          symbol: isISS ? 'star' : 'circle',
          line: {
            color: isISS ? '#FFD700' : '#FFFFFF',
            width: 2
          }
        },
        name: obj.name,
        hoverinfo: 'text',
        hoverlabel: {
          bgcolor: '#1E40AF',
          bordercolor: isISS ? '#FF0000' : obj.color,
          font: { color: '#ffffff' }
        }
      }));
    } catch (error) {
      console.error('Error creating map data:', error);
      return [];
    }
  };

  const layout = {
    title: {
      text: 'International Space Station Live Tracker',
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
        type: 'orthographic',
        rotation: {
          lon: issPosition.longitude,
          lat: issPosition.latitude,
          roll: 0
        },
        scale: 1.2
      },
      showland: true,
      showocean: true,
      showcoastlines: true,
      showcountries: true,
      oceancolor: 'rgb(32, 98, 149)',
      landcolor: 'rgb(49, 68, 78)',
      countrycolor: 'rgba(204,204,204,0.5)',
      coastlinecolor: 'rgba(204,204,204,0.3)',
      lataxis: {
        showgrid: true,
        gridcolor: 'rgba(204, 204, 204, 0.10)',
        gridwidth: 0.5,
        range: [-90, 90]
      },
      lonaxis: {
        showgrid: true,
        gridcolor: 'rgba(204, 204, 204, 0.10)',
        gridwidth: 0.5,
        range: [-180, 180]
      },
      bgcolor: 'rgba(0,0,0,0)',
      framecolor: 'rgba(0,0,0,0)',
      framewidth: 0,
      showframe: false
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 text-white p-4 flex items-center justify-center">
        <div className="bg-red-900/50 p-6 rounded-xl border border-red-700 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Space Objects Tracker
          </h1>
          <p className="text-gray-300">Real-time tracking of the ISS and solar system objects</p>
        </div>

        <Tab.Group onChange={setActiveTab}>
          <Tab.List className="flex space-x-4 mb-8 justify-center">
            <Tab className={({ selected }) =>
              `px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                selected
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`
            }>
              <FaSatellite className="text-lg" />
              <span>ISS Tracker</span>
            </Tab>
            <Tab className={({ selected }) =>
              `px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                selected
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`
            }>
              <FaGlobe className="text-lg" />
              <span>Solar System</span>
            </Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              {loading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="relative">
                    <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
                    <div className="w-16 h-16 border-t-4 border-b-4 border-purple-500 rounded-full animate-spin absolute top-0 left-0" style={{animationDelay: '-0.3s'}}></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300">
                      <div className="flex items-center space-x-3 mb-4">
                        <FaSatellite className="text-2xl text-blue-400" />
                        <h3 className="text-xl font-semibold">Current Position</h3>
                      </div>
                      <div className="space-y-2 text-gray-300">
                        <p className="flex justify-between">
                          <span>Latitude:</span>
                          <span className="font-mono">{formatNumber(issPosition.latitude)}°</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Longitude:</span>
                          <span className="font-mono">{formatNumber(issPosition.longitude)}°</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Altitude:</span>
                          <span className="font-mono">{formatNumber(issPosition.altitude)} km</span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300">
                      <div className="flex items-center space-x-3 mb-4">
                        <FaRocket className="text-2xl text-blue-400" />
                        <h3 className="text-xl font-semibold">Speed</h3>
                      </div>
                      <div className="space-y-2 text-gray-300">
                        <p className="flex justify-between">
                          <span>Current:</span>
                          <span className="font-mono">{formatNumber(speed)} km/s</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Per Hour:</span>
                          <span className="font-mono">{formatNumber(speed * 3600)} km/h</span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300">
                      <div className="flex items-center space-x-3 mb-4">
                        <FaInfoCircle className="text-2xl text-blue-400" />
                        <h3 className="text-xl font-semibold">Mission Info</h3>
                      </div>
                      <div className="space-y-2 text-gray-300">
                        <p className="flex justify-between">
                          <span>Crew:</span>
                          <span>{issInfo.crew}</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Mission:</span>
                          <span>{issInfo.mission}</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Launch:</span>
                          <span>{issInfo.launchDate}</span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300">
                      <div className="flex items-center space-x-3 mb-4">
                        <FaEye className="text-2xl text-blue-400" />
                        <h3 className="text-xl font-semibold">Visibility</h3>
                      </div>
                      <div className="space-y-2 text-gray-300">
                        <p className="flex justify-between">
                          <span>Next Pass:</span>
                          <span>{issInfo.nextPass}</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Status:</span>
                          <span className={issInfo.visibility === 'Visible' ? 'text-green-400' : 'text-red-400'}>
                            {issInfo.visibility}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span>Updated:</span>
                          <span>{lastUpdated.toLocaleTimeString()}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                    <div className="flex justify-center items-center" style={{ minHeight: 600 }}>
                      <div className="relative flex justify-center items-center" style={{ width: 600, height: 600 }}>
                        <div className="absolute inset-0 rounded-full shadow-[0_0_60px_20px_rgba(96,165,250,0.4)] pointer-events-none"></div>
                        <div className="bg-transparent rounded-full overflow-hidden" style={{ width: 600, height: 600 }}>
                          <Plot
                            data={[
                              ...createMapData([{ name: 'ISS', ...issPosition }], true),
                              {
                                type: 'scattergeo',
                                lon: orbitPath.lons,
                                lat: orbitPath.lats,
                                mode: 'lines',
                                line: {
                                  color: '#60A5FA',
                                  width: 3,
                                  dash: 'dot'
                                },
                                name: 'Orbit Path',
                                hoverinfo: 'skip'
                              },
                              {
                                type: 'scattergeo',
                                lon: [issPosition.longitude],
                                lat: [issPosition.latitude],
                                mode: 'markers',
                                marker: {
                                  size: 20,
                                  color: 'rgba(255, 0, 0, 0.3)',
                                  symbol: 'circle',
                                  line: {
                                    color: '#FF0000',
                                    width: 2
                                  }
                                },
                                name: 'Current Location',
                                hoverinfo: 'skip'
                              }
                            ]}
                            layout={layout}
                            style={{ width: '100%', height: '100%' }}
                            config={{ responsive: true }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Tab.Panel>

            <Tab.Panel>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {planetPositions.map((planet, index) => (
                    <div key={index} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300">
                      <div className="flex items-center space-x-3 mb-4">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: planet.color }}
                        ></div>
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                          {planet.name}
                        </h3>
                      </div>
                      <div className="space-y-3 text-gray-300">
                        <p className="flex justify-between">
                          <span>Type:</span>
                          <span>{planet.info.type}</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Diameter:</span>
                          <span>{planet.info.diameter}</span>
                        </p>
                        {planet.info.distance && (
                          <p className="flex justify-between">
                            <span>Distance:</span>
                            <span>{planet.info.distance}</span>
                          </p>
                        )}
                        {planet.info.orbitalPeriod && (
                          <p className="flex justify-between">
                            <span>Orbital Period:</span>
                            <span>{planet.info.orbitalPeriod}</span>
                          </p>
                        )}
                        {planet.info.temperature && (
                          <p className="flex justify-between">
                            <span>Temperature:</span>
                            <span>{planet.info.temperature}</span>
                          </p>
                        )}
                        {planet.info.age && (
                          <p className="flex justify-between">
                            <span>Age:</span>
                            <span>{planet.info.age}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                  <Plot
                    data={createMapData(planetPositions)}
                    layout={{
                      ...layout,
                      geo: {
                        ...layout.geo,
                        center: { lon: 0, lat: 0 },
                        zoom: 1,
                        projection: {
                          type: 'orthographic'
                        }
                      },
                      title: {
                        text: 'Solar System View',
                        font: {
                          size: 24,
                          color: '#FFFFFF'
                        }
                      }
                    }}
                    style={{ width: '100%', height: '600px' }}
                    config={{ responsive: true }}
                  />
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default SpaceTracker;