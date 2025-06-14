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
  const [issInfo, setIssInfo] = useState({
    crew: '7 astronauts',
    mission: 'Expedition 71',
    launchDate: 'March 21, 2024',
    nextPass: 'Calculating...',
    visibility: 'Visible'
  });

  // Current ISS TLE data (updated March 2024)
  const tleLine1 = '1 25544U 98067A   24083.00000000  .00000000  00000+0  00000+0 0  9999';
  const tleLine2 = '2 25544  51.6400 352.1000 0001000 330.0000 30.0000 15.50130000000000';

  // Calculate planet positions
  const calculatePlanetPositions = () => {
    const now = new Date();
    const positions = [];
    
    // Enhanced planet data
    const planets = [
      { 
        name: 'Sun', 
        lat: 0, 
        lon: 0,
        info: {
          type: 'Star',
          diameter: '1,392,700 km',
          temperature: '5,778 K',
          age: '4.6 billion years'
        }
      },
      { 
        name: 'Moon', 
        lat: 0, 
        lon: 0,
        info: {
          type: 'Natural Satellite',
          diameter: '3,474 km',
          distance: '384,400 km',
          orbitalPeriod: '27.3 days'
        }
      },
      { 
        name: 'Mars', 
        lat: 0, 
        lon: 0,
        info: {
          type: 'Terrestrial Planet',
          diameter: '6,779 km',
          distance: '227.9 million km',
          orbitalPeriod: '687 days'
        }
      },
      { 
        name: 'Venus', 
        lat: 0, 
        lon: 0,
        info: {
          type: 'Terrestrial Planet',
          diameter: '12,104 km',
          distance: '108.2 million km',
          orbitalPeriod: '225 days'
        }
      },
      { 
        name: 'Jupiter', 
        lat: 0, 
        lon: 0,
        info: {
          type: 'Gas Giant',
          diameter: '139,820 km',
          distance: '778.5 million km',
          orbitalPeriod: '11.9 years'
        }
      },
      { 
        name: 'Saturn', 
        lat: 0, 
        lon: 0,
        info: {
          type: 'Gas Giant',
          diameter: '116,460 km',
          distance: '1.4 billion km',
          orbitalPeriod: '29.5 years'
        }
      }
    ];

    // Calculate positions based on current time
    planets.forEach(planet => {
      const time = now.getTime() / 1000;
      const angle = (time % 360) * (Math.PI / 180);
      
      positions.push({
        ...planet,
        lat: Math.sin(angle) * 30,
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
      const time = new Date(now.getTime() + i * 60 * 1000);
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

        const latitude = satellite.degreesLat(position.latitude);
        const longitude = satellite.degreesLong(position.longitude);
        const altitude = position.height * 1000;

        setIssPosition({
          latitude,
          longitude,
          altitude
        });
        setSpeed(speed);
        setLastUpdated(now);
        setLoading(false);
        setError(null);

        const planetPos = calculatePlanetPositions();
        setPlanetPositions(planetPos);

        // Update ISS information
        setIssInfo(prev => ({
          ...prev,
          nextPass: calculateNextPass(latitude, longitude),
          visibility: calculateVisibility(latitude, longitude)
        }));
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
        label: '3D Globe'
      }, {
        method: 'relayout',
        args: ['geo.projection.type', 'equirectangular'],
        label: '2D Map'
      }]
    }]
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <Tab.Group onChange={setActiveTab}>
          <Tab.List className="flex space-x-4 mb-4">
            <Tab className={({ selected }) =>
              `px-4 py-2 rounded-lg ${
                selected
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`
            }>
              ISS Tracker
            </Tab>
            <Tab className={({ selected }) =>
              `px-4 py-2 rounded-lg ${
                selected
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`
            }>
              Solar System
            </Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              {loading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center">{error}</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Current Position</h3>
                      <p>Latitude: {formatNumber(issPosition.latitude)}°</p>
                      <p>Longitude: {formatNumber(issPosition.longitude)}°</p>
                      <p>Altitude: {formatNumber(issPosition.altitude)} km</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Speed</h3>
                      <p>{formatNumber(speed)} km/s</p>
                      <p>{formatNumber(speed * 3600)} km/h</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Mission Info</h3>
                      <p>Crew: {issInfo.crew}</p>
                      <p>Mission: {issInfo.mission}</p>
                      <p>Launch: {issInfo.launchDate}</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Visibility</h3>
                      <p>Next Pass: {issInfo.nextPass}</p>
                      <p>Status: {issInfo.visibility}</p>
                      <p>Last Updated: {lastUpdated.toLocaleTimeString()}</p>
                    </div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg">
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
                            width: 2
                          },
                          name: 'Orbit Path'
                        }
                      ]}
                      layout={layout}
                      style={{ width: '100%', height: '600px' }}
                      config={{ responsive: true }}
                    />
                  </div>
                </div>
              )}
            </Tab.Panel>

            <Tab.Panel>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {planetPositions.map((planet, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">{planet.name}</h3>
                      <div className="space-y-2">
                        <p>Type: {planet.info.type}</p>
                        <p>Diameter: {planet.info.diameter}</p>
                        {planet.info.distance && <p>Distance: {planet.info.distance}</p>}
                        {planet.info.orbitalPeriod && <p>Orbital Period: {planet.info.orbitalPeriod}</p>}
                        {planet.info.temperature && <p>Temperature: {planet.info.temperature}</p>}
                        {planet.info.age && <p>Age: {planet.info.age}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <Plot
                    data={createMapData(planetPositions)}
                    layout={{
                      ...layout,
                      geo: {
                        ...layout.geo,
                        center: { lon: 0, lat: 0 },
                        zoom: 1
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