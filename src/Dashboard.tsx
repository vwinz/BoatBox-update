import './Dashboard.css';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
  update_status: boolean;
}

export default function Dashboard() {
  const [registeredBoats, setRegisteredBoats] = useState<number>(0);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [boatLocations, setBoatLocations] = useState<BoatLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  function getDayName(date: Date) {
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  }

  useEffect(() => {
    async function fetchBoatLocations() {
      setLoading(true);
      const { data, error } = await supabase
        .from('boat_current_location')
        .select(
          'boat_id, last_updated, latitude, longitude, update_status, boats_info(registration_number)'
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
          update_status: row.update_status,
        }));
        setBoatLocations(mapped);
      }
      setLoading(false);
    }

    // Fetch immediately on mount
    fetchBoatLocations();

    // Poll every 5 seconds
    const interval = setInterval(() => {
      fetchBoatLocations();
    }, 5000);

    // Cleanup
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
  async function fetchRegisteredBoats() {
    const { count, error } = await supabase
      .from('boats_info')
      .select('*', { count: 'exact', head: true }); // head: true fetches count only
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

  function FitBounds({ locations }: { locations: BoatLocation[] }) {
    const map = useMap();
    useEffect(() => {
      if (locations.length === 0) return;
      const bounds = locations.map((loc) => [loc.latitude, loc.longitude]);
      if (bounds.length > 0) {
        map.fitBounds(bounds as [number, number][]);
      }
    }, [locations, map]);
    return null;
  }

  return (
    <div
      className="dashboard-layout"
      style={{
        background: 'linear-gradient(135deg, #0a2342 0%, #19376d 100%)',
        minHeight: '100vh',
        width: '100vw',
        maxHeight: '100vh',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
      }}
    >
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
            background: '#fff',
            borderRadius: '1.5rem',
            margin: '0 0 0 1vw',
            padding: '1.5vw',
            boxShadow: '0 2px 16px #0001',
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
         <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
  {/* Registered Boats Card */}
  <div
    style={{
      background: '#1f2c56',
      color: '#fff',
      padding: '1rem',
      borderRadius: '1rem',
      flex: 1,
      textAlign: 'center',
    }}
  >
    <h3>Boats Registered</h3>
    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{registeredBoats}</p>
  </div>

  {/* Date & Time Card */}
  <div
    style={{
      background: '#0a2342',
      color: '#fff',
      padding: '1rem',
      borderRadius: '1rem',
      flex: 1,
      textAlign: 'center',
    }}
  >
    <h3>Current Date & Time</h3>
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

  {/* Weather Card */}
  {weather && (
    <div
      style={{
        background: '#19376d',
        color: '#fff',
        padding: '1rem',
        borderRadius: '1rem',
        flex: 1,
        textAlign: 'center',
      }}
    >
      <h3>Current Weather</h3>
      <p>Temperature: {weather.temperature}°C</p>
      <p>Wind Speed: {weather.windspeed} km/h</p>
      <p>Date: {new Date(weather.time).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}</p>
    </div>
  )}
</div>


          {/* header and stats remain the same */}
          {/* ... */}

          <section
            className="messages-section"
            style={{
              background: 'rgba(255,255,255,0.97)',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 2px 8px #0002',
              minHeight: '300px',
              height: 'auto',
            }}
          >
            <h2 style={{ color: '#19376d' }}>Recent Messages</h2>
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
                <tr style={{ background: '#25406d' }}>
                  <th
                    style={{
                      color: '#fff',
                      textAlign: 'center',
                      padding: '0.5rem 0.5rem',
                      fontWeight: 'bold',
                      width: '22%',
                    }}
                  >
                    Registration Number
                  </th>
                  <th
                    style={{
                      color: '#fff',
                      textAlign: 'center',
                      padding: '0.5rem 0.5rem',
                      fontWeight: 'bold',
                      width: '28%',
                    }}
                  >
                    Last Updated
                  </th>
                  <th
                    style={{
                      color: '#fff',
                      textAlign: 'center',
                      padding: '0.5rem 0.5rem',
                      fontWeight: 'bold',
                      width: '35%',
                    }}
                  >
                    Location
                  </th>
                  <th
                    style={{
                      color: '#fff',
                      textAlign: 'center',
                      padding: '0.5rem 0.5rem',
                      fontWeight: 'bold',
                      width: '15%',
                    }}
                  >
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
                      <td
                        colSpan={4}
                        style={{ textAlign: 'center', color: '#19376d', padding: '1rem' }}
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : boatLocations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{ textAlign: 'center', color: '#19376d', padding: '1rem' }}
                      >
                        No data found.
                      </td>
                    </tr>
                  ) : (
                    boatLocations.map((loc, idx) => (
                      <tr key={idx}>
                        <td
                          style={{
                            padding: '0.5rem 0.5rem',
                            color: '#19376d',
                            width: '22%',
                            textAlign: 'center',
                          }}
                        >
                          {loc.registration_number}
                        </td>
                        <td
                          style={{
                            padding: '0.5rem 0.5rem',
                            color: '#19376d',
                            width: '28%',
                            textAlign: 'center',
                          }}
                        >
                          {new Date(loc.last_updated).toLocaleString()}
                        </td>
                        <td
                          style={{
                            padding: '0.5rem 0.5rem',
                            color: '#19376d',
                            width: '35%',
                            textAlign: 'center',
                          }}
                        >{`${loc.latitude}, ${loc.longitude}`}</td>
                        <td
                          style={{
                            padding: '0.5rem 0.5rem',
                            color: loc.update_status ? '#27ae60' : '#e74c3c',
                            fontWeight: 'bold',
                            width: '15%',
                            textAlign: 'center',
                          }}
                        >
                          {loc.update_status ? 'Normal' : 'Emergency'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>


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
              background: '#b3b8e0',
              borderRadius: '1.5rem',
              boxShadow: '0 2px 16px #0001',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              color: '#25406d',
              margin: '0 2vw 0 1vw',
            }}
          >
            <MapContainer
              center={[14.6, 120.98]}
              zoom={13}
              style={{ width: '100%', height: '100%', borderRadius: '1.5rem' }}
              scrollWheelZoom={true as any}
            >
              <FitBounds locations={boatLocations} />
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
                      Status: {loc.update_status ? 'Normal' : 'Emergency'}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
