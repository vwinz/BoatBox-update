import './Dashboard.css';
import { useEffect, useRef, useState } from 'react';
import { supabase } from './supabaseClient';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface Weather {
  temperature: number;
  windspeed: number;
  weathercode: number;
  time: string;
}

const boatIcon = new L.Icon({
  iconUrl: '/boat.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface BoatLocation {
  id: number;
  registration_number: string;
  last_updated: string;
  latitude: number;
  longitude: number;
  is_distress: boolean;
}

// SVG Icons (keep all your existing SVG icons as they are)
const BoatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 21h18M4 21h16a1 1 0 0 0 1-1v-6.28a2 2 0 0 0-1.106-1.789l-7-3.5a2 2 0 0 0-1.788 0l-7 3.5A2 2 0 0 0 3 13.72V20a1 1 0 0 0 1 1z"/>
    <path d="M12 9V2"/>
    <path d="M8 6l4-4 4 4"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const WeatherIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
  </svg>
);

const ThermometerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
  </svg>
);

const WindIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2M17.7 7.7a2.5 2.5 0 1 0-1.8-4.3"/>
    <path d="M9.5 4a2.5 2.5 0 1 1 1.8 4.3H2M9.5 4a2.5 2.5 0 1 0-1.8-4.3"/>
    <path d="M20.5 14a2.5 2.5 0 1 1 1.8 4.3H2"/>
  </svg>
);


export default function Dashboard() {
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [registeredBoats, setRegisteredBoats] = useState<number>(0);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [boatLocations, setBoatLocations] = useState<BoatLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());


  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleFullscreen = () => {
    setIsMapFullscreen(!isMapFullscreen);
  };

  useEffect(() => {
    const distressBoat = boatLocations.find((loc) => loc.is_distress);

    if (distressBoat) {
      alert(
        `🚨 EMERGENCY!\nBoat ${distressBoat.registration_number} reported distress at (${distressBoat.latitude}, ${distressBoat.longitude})`
      );

      if (audioRef.current) {
        audioRef.current.loop = true;
        audioRef.current.play().catch((err) => {
          console.warn('Autoplay prevented by browser. User interaction required.', err);
        });
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [boatLocations]);

  useEffect(() => {
    async function fetchBoatLocations() {
      setLoading(true);
      const { data, error } = await supabase
        .from('boat_current_location')
        .select(
          'boat_id, last_updated, latitude, longitude, is_distress, boats_info(registration_number)'
        )
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('Error fetching boat locations:', error);
        setBoatLocations([]);
      } else {
        const mapped = (data || []).map((row: any) => ({
          id: row.id,
          registration_number: row.boats_info?.registration_number || '',
          last_updated: row.last_updated,
          latitude: row.latitude,
          longitude: row.longitude,
          is_distress: row.is_distress,
        }));
        setBoatLocations(mapped);
      }
      setLoading(false);
    }

    fetchBoatLocations();
    const interval = setInterval(() => {
      fetchBoatLocations();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          );
          const data = await res.json();
          if (data && data.current_weather) {
            setWeather({
              temperature: data.current_weather.temperature,
              windspeed: data.current_weather.windspeed,
              weathercode: data.current_weather.weathercode,
              time: data.current_weather.time,
            });
          }
        } catch (err) {
          console.error('Error fetching weather:', err);
        }
      },
      (err) => {
        console.error('Error getting geolocation:', err);
      }
    );
  }, []);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMapFullscreen) {
        setIsMapFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isMapFullscreen]);

  useEffect(() => {
    async function fetchRegisteredBoats() {
      const { count, error } = await supabase
        .from('boats_info')
        .select('*', { count: 'exact', head: true });
      if (error) {
        console.error('Error fetching registered boats:', error);
        setRegisteredBoats(0);
      } else {
        setRegisteredBoats(count || 0);
      }
    }
    fetchRegisteredBoats();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="dashboard-layout"
      style={{
        background: `linear-gradient(135deg, rgba(145, 9, 9, 0.8) 0%, rgba(192, 20, 20, 0.7) 100%), url('/sunset.jpg') center/cover no-repeat`,
        minHeight: '100vh',
        width: '100vw',
        maxHeight: '100vh',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
      }}
    >
      <audio ref={audioRef} src="/alert.mp3" preload="auto" />
      
      {/* Fullscreen Map */}
      {isMapFullscreen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(224, 179, 179, 0.2)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          <button 
            onClick={toggleFullscreen}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              cursor: 'pointer',
              zIndex: 10000,
              fontSize: '20px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          > 
            ✕
          </button>
         <MapContainer
   center={[14.085616, 120.627538]}
                zoom={12}
  style={{ width: '100%', height: '100%' }}
  scrollWheelZoom={true}
  zoomControl={true}
>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {boatLocations.map((loc, idx) => (
              <Marker key={idx} position={[loc.latitude, loc.longitude]} icon={boatIcon}>
                <Popup>
                  <div>
                    <strong>{loc.registration_number}</strong>
                    <br />
                    {`Lat: ${loc.latitude}, Lng: ${loc.longitude}`}
                    <br />
                    Status: {loc.is_distress ? '🚨 EMERGENCY' : '✅ NORMAL'}
                  </div>
                </Popup>
              </Marker>
            ))}

            {boatLocations.map((loc, idx) =>
              loc.is_distress ? (
                <Circle
                  key={`circle-${idx}`}
                  center={[loc.latitude, loc.longitude]}
                  radius={1000}
                  pathOptions={{
                    color: 'red',
                    weight: 30,
                    fillColor: 'red',
                    fillOpacity: 0.8,
                  }}
                />
              ) : null
            )}
          </MapContainer>
        </div>
      )}

      {/* Normal Dashboard Layout */}
      {!isMapFullscreen && (
        <div
          style={{
            flex: 1,
            display: 'flex',  
            flexDirection: 'row',
            minWidth: 0,
            minHeight: '100vh',
            maxHeight: '100vh',
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2vw',
          }}
        >
          <main
            className="main-content"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1.5rem',
              margin: '0 0 0 1vw',
              padding: '1.5vw',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              flex: '1 1 700px',
              maxWidth: '900px',
              minWidth: '300px',
              alignSelf: 'center',
              width: '100%',
              minHeight: '350px',
              maxHeight: 'calc(90vh - 3vw)',
              height: 'calc(90vh - 3vw)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              overflow: 'hidden',
            }}
          >
            {/* Your existing dashboard content remains the same */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              {/* Registered Boats Card */}
              <div
                style={{
                  background: 'rgba(109, 25, 25, 0.3)',
                  color: '#fff',
                  padding: '1rem',
                  borderRadius: '1rem',
                  flex: 1,
                  textAlign: 'center',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <BoatIcon />
                  Boats Registered
                </h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{registeredBoats}</p>
              </div>

              {/* Date & Time Card */}
              <div
                style={{
                  background: 'rgba(109, 25, 25, 0.3)',
                  color: '#fff',
                  padding: '1rem',
                  borderRadius: '1rem',
                  flex: 1,
                  textAlign: 'center',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <ClockIcon />
                  Current Date & Time
                </h3>
                <p>
                  {currentTime.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <p>{currentTime.toLocaleTimeString()}</p>
              </div>

              {boatLocations.some((loc) => loc.is_distress) && (
                <div
                  style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    background: '#e74c3c',
                    color: '#fff',
                    padding: '1rem 2rem',
                    borderRadius: '0.8rem',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                  }}
                >
                  🚨 Emergency Alert: A boat is in distress!
                </div>
              )}

              {/* Weather Card */}
              {weather && (
                <div
                  style={{
                    background: 'rgba(109, 25, 25, 0.3)',
                    color: '#fff',
                    padding: '1rem',
                    borderRadius: '1rem',
                    flex: 1,
                    textAlign: 'center',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                    <WeatherIcon />
                    Current Weather
                  </h3>
                  <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0.5rem 0' }}>
                    <ThermometerIcon />
                    Temperature: {weather.temperature}°C
                  </p>
                  <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0.5rem 0' }}>
                    <WindIcon />
                    Wind Speed: {weather.windspeed} km/h
                  </p>
                </div>
              )}
            </div>

            <section
              className="messages-section"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                minHeight: '300px',
                height: 'auto',
              }}
            >
              <h2 style={{ color: '#fff' }}>Recent Messages</h2>
              <table
                className="messages-table"
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  tableLayout: 'fixed',
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                }}
              >
                <thead>
                  <tr style={{ background: 'rgba(109, 36, 36, 0.6)' }}>
                    <th style={{ color: '#fff', textAlign: 'center', padding: '0.5rem 0.5rem', fontWeight: 'bold', width: '22%' }}>
                      Registration Number
                    </th>
                    <th style={{ color: '#fff', textAlign: 'center', padding: '0.5rem 0.5rem', fontWeight: 'bold', width: '28%' }}>
                      Last Updated
                    </th>
                    <th style={{ color: '#fff', textAlign: 'center', padding: '0.5rem 0.5rem', fontWeight: 'bold', width: '35%' }}>
                      Location
                    </th>
                    <th style={{ color: '#fff', textAlign: 'center', padding: '0.5rem 0.5rem', fontWeight: 'bold', width: '15%' }}>
                      Status
                    </th>
                  </tr>
                </thead>
              </table>
              <div
                style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  borderRadius: '0.7rem',
                  marginTop: '-0.5rem',
                }}
              >
                <table
                  className="messages-table"
                  style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}
                >
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: '#fff', padding: '1rem' }}>
                          Loading...
                        </td>
                      </tr>
                    ) : boatLocations.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: '#fff', padding: '1rem' }}>
                          No data found.
                        </td>
                      </tr>
                    ) : (
                      boatLocations.map((loc, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '0.5rem 0.5rem', color: '#fff', width: '22%', textAlign: 'center' }}>
                            {loc.registration_number}
                          </td>
                          <td style={{ padding: '0.5rem 0.5rem', color: '#fff', width: '28%', textAlign: 'center' }}>
                            {new Date(loc.last_updated).toLocaleString()}
                          </td>
                          <td style={{ padding: '0.5rem 0.5rem', color: '#fff', width: '35%', textAlign: 'center' }}>
                            {`${loc.latitude}, ${loc.longitude}`}
                          </td>
                          <td style={{ 
                            padding: '0.5rem 0.5rem', 
                            color: loc.is_distress ? '#e74c3c' : '#27ae60', 
                            fontWeight: 'bold', 
                            width: '15%', 
                            textAlign: 'center' 
                          }}>
                            {loc.is_distress ? 'EMERGENCY' : 'NORMAL'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </main>

          {/* Normal Map */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 0,
              height: '100%',
              maxHeight: '100%',
            }}
          >
            <div
              className="map-container"
              style={{
                height: 'calc(90vh - 3vw)',
                width: '100%',
                maxWidth: '400px',
                background: 'rgba(224, 179, 179, 0.2)',
                backdropFilter: 'blur(5px)',
                borderRadius: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                color: '#6d2525',
                margin: '0 2vw 0 1vw',
                position: 'relative',
              }}
            >
              <button 
                onClick={toggleFullscreen}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px',
                  cursor: 'pointer',
                  zIndex: 1000,
                  fontSize: '18px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ⛶
              </button>
              
              <MapContainer
                center={[14.085616, 120.627538]}
                zoom={12}
                style={{ width: '100%', height: '100%', borderRadius: '1.5rem' }}
                scrollWheelZoom={true}
                zoomControl={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />

                {boatLocations.map((loc, idx) => (
                  <Marker key={idx} position={[loc.latitude, loc.longitude]} icon={boatIcon}>
                    <Popup>
                      <div>
                        <strong>{loc.registration_number}</strong>
                        <br />
                        {`Lat: ${loc.latitude}, Lng: ${loc.longitude}`}
                        <br />
                        Status: {loc.is_distress ? '🚨 EMERGENCY' : '✅ NORMAL'}
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {boatLocations.map((loc, idx) =>
                  loc.is_distress ? (
                    <Circle
                      key={`circle-${idx}`}
                      center={[loc.latitude, loc.longitude]}
                      radius={1000}
                      pathOptions={{
                        color: 'red',
                        weight: 30,
                        fillColor: 'red',
                        fillOpacity: 0.8,
                      }}
                    />
                  ) : null
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}