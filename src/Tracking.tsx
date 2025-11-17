// Tracking.tsx
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const boatIcon = new L.Icon({
  iconUrl: "/boat.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

type Boat = {
  boat_id: string; // UUID
  boat_name: string;
  registration_number: string;
};

type BoatLog = {
  latitude: number;
  longitude: number;
  recorded_at: string;
};

function MapUpdater({ logs }: { logs: BoatLog[] }) {
  const map = useMap();

  useEffect(() => {
    if (logs.length > 0) {
      const bounds = logs.map((log) => [log.latitude, log.longitude]) as [number, number][];
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [logs, map]);

  return null;
}

export default function Tracking() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [logs, setLogs] = useState<BoatLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<BoatLog[]>([]);
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsMapFullscreen(!isMapFullscreen);
  };

  // Fetch all boats
  useEffect(() => {
    const fetchBoats = async () => {
      const { data, error } = await supabase
        .from("boats_info")
        .select("boat_id, boat_name, registration_number");

      if (error) {
        console.error("Error fetching boats:", error);
      } else {
        setBoats(data || []);
      }
    };

    fetchBoats();
  }, []);

  // Handle ESC key to exit fullscreen
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

  // Handle track button click
  const handleTrack = async (boat: Boat) => {
    setSelectedBoat(boat);
    setLoading(true);
    setSelectedDate(""); // Reset date filter

    const { data, error } = await supabase
      .from("boat_location_logs")
      .select("latitude, longitude, recorded_at")
      .eq("boat_id", boat.boat_id)
      .order("recorded_at", { ascending: true });

    setLoading(false);

    if (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
      setFilteredLogs([]);
      return;
    }

    if (!data || data.length === 0) {
      console.log(`No logs found for boat_id: ${boat.boat_id}`);
      setLogs([]);
      setFilteredLogs([]);
    } else {
      console.log("Fetched logs:", data);
      setLogs(data);
      setFilteredLogs(data); // Initially show all logs
    }
  };

  // Handle date filter
  const handleDateFilter = (date: string) => {
    setSelectedDate(date);
    
    if (!date) {
      setFilteredLogs(logs); // Show all if no date selected
      return;
    }

    const filtered = logs.filter(log => {
      const logDate = new Date(log.recorded_at).toISOString().split('T')[0];
      return logDate === date;
    });

    setFilteredLogs(filtered);
  };

  // Clear date filter
  const clearDateFilter = () => {
    setSelectedDate("");
    setFilteredLogs(logs);
  };

  // Get unique dates from logs
  const getAvailableDates = () => {
    if (logs.length === 0) return [];
    
    const dates = logs.map(log => new Date(log.recorded_at).toISOString().split('T')[0]);
    return Array.from(new Set(dates)).sort(); // Remove duplicates and sort
  };

  // Get date range for the selected boat's logs
  const getDateRangeInfo = () => {
    if (logs.length === 0) return null;
    
    const dates = logs.map(log => new Date(log.recorded_at));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    return {
      min: minDate.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0]
    };
  };

  const dateRangeInfo = getDateRangeInfo();
  const availableDates = getAvailableDates();

  return (
    <div style={{ 
      display: "flex", 
      height: "100vh",
      background: `linear-gradient(135deg, rgba(145, 9, 9, 0.8) 0%, rgba(192, 20, 20, 0.7) 100%), url('/sunset.jpg') center/cover no-repeat`,
    }}>
      {/* Fullscreen Map - Rendered outside normal layout */}
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
            center={[13.7563, 121.0583]}
            zoom={12}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom={true as any}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapUpdater logs={filteredLogs} />

            {filteredLogs.map((log, index) => (
              <Marker key={index} position={[log.latitude, log.longitude]} icon={boatIcon}>
                <Popup>
                  <strong>{selectedBoat?.boat_name}</strong>
                  <br />
                  {new Date(log.recorded_at).toLocaleString()}
                </Popup>
              </Marker>
            ))}

            {filteredLogs.length > 1 && (
              <Polyline
                positions={filteredLogs.map((log) => [log.latitude, log.longitude])}
                pathOptions={{ color: 'grey', weight: 3, dashArray: '8, 6' }}
              />
            )}
          </MapContainer>
        </div>
      )}

      {/* Normal Dashboard Layout - Hidden when map is fullscreen */}
      {!isMapFullscreen && (
        <>
          {/* Left: Boat List */}
          <div style={{ 
            flex: 1, 
            padding: "1.5rem", 
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}>
            <div style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: "1rem",
              padding: "1.5rem",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}>
              <h2 style={{ color: "#fff", marginBottom: "1rem", textAlign: "center" }}>Boat List</h2>
              
              <div style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(8px)",
                borderRadius: "0.8rem",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}>
                <table style={{ 
                  width: "100%", 
                  borderCollapse: "collapse", 
                  textAlign: "left",
                }}>
                  <thead>
                    <tr style={{ 
                      background: "rgba(109, 36, 36, 0.6)",
                    }}>
                      <th style={{ 
                        color: "#fff",
                        padding: "1rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      }}>Boat Name</th>
                      <th style={{ 
                        color: "#fff",
                        padding: "1rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      }}>Registration Number</th>
                      <th style={{ 
                        color: "#fff",
                        padding: "1rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boats.map((boat) => (
                      <tr key={boat.boat_id} style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        transition: "background-color 0.2s",
                      }}>
                        <td style={{ 
                          color: "#fff",
                          padding: "1rem",
                        }}>{boat.boat_name}</td>
                        <td style={{ 
                          color: "#fff",
                          padding: "1rem",
                        }}>{boat.registration_number}</td>
                        <td style={{ 
                          padding: "1rem",
                        }}>
                          <button
                            style={{
                              padding: "0.5rem 1rem",
                              backgroundColor: "rgba(255, 255, 255, 0.2)",
                              color: "#fff",
                              border: "1px solid rgba(255, 255, 255, 0.3)",
                              borderRadius: "0.5rem",
                              cursor: "pointer",
                              backdropFilter: "blur(5px)",
                              transition: "all 0.2s",
                              fontWeight: "bold",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
                              e.currentTarget.style.transform = "scale(1.05)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                            onClick={() => handleTrack(boat)}
                          >
                            TRACK
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Loading / No logs message */}
              <div style={{ marginTop: "1rem" }}>
                {loading && (
                  <p style={{ 
                    color: "#fff", 
                    textAlign: "center",
                    background: "rgba(255, 255, 255, 0.1)",
                    padding: "0.8rem",
                    borderRadius: "0.5rem",
                    backdropFilter: "blur(5px)",
                  }}>
                    Loading logs...
                  </p>
                )}
                {!loading && selectedBoat && logs.length === 0 && (
                  <p style={{ 
                    color: "#fff", 
                    textAlign: "center",
                    background: "rgba(255, 255, 255, 0.1)",
                    padding: "0.8rem",
                    borderRadius: "0.5rem",
                    backdropFilter: "blur(5px)",
                  }}>
                    No logs found for <strong>{selectedBoat.boat_name}</strong>.
                  </p>
                )}
              </div>
            </div>

            {/* Selected Boat Info Card */}
            {selectedBoat && (
              <div style={{
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: "1rem",
                padding: "1.5rem",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}>
                <h3 style={{ color: "#fff", marginBottom: "1rem" }}>Selected Boat</h3>
                <div style={{ color: "#fff", marginBottom: "1rem" }}>
                  <p><strong>Name:</strong> {selectedBoat.boat_name}</p>
                  <p><strong>Registration:</strong> {selectedBoat.registration_number}</p>
                  <p><strong>Total Logs:</strong> {logs.length}</p>
                  <p><strong>Showing:</strong> {filteredLogs.length} logs</p>
                  {dateRangeInfo && (
                    <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                      <strong>Date Range:</strong> {new Date(dateRangeInfo.min).toLocaleDateString()} - {new Date(dateRangeInfo.max).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Date Filter Section */}
                {logs.length > 0 && (
                  <div style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "0.5rem",
                    padding: "1rem",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}>
                    <h4 style={{ color: "#fff", marginBottom: "0.8rem" }}>Filter by Day</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                      <div>
                        <label style={{ color: "#fff", fontSize: "0.9rem", display: "block", marginBottom: "0.3rem" }}>
                          Select Date
                        </label>
                        <select
                          value={selectedDate}
                          onChange={(e) => handleDateFilter(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            borderRadius: "0.3rem",
                            border: "1px solid rgba(249, 237, 237, 0.3)",
                            background: "rgba(250, 245, 245, 0.8)",
                            color: "#ed0606ff",
                            backdropFilter: "blur(5px)",
                          }}
                        >
                          <option value="">All Dates</option>
                          {availableDates.map(date => (
                            <option key={date} value={date}>
                              {new Date(date).toLocaleDateString()}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={clearDateFilter}
                          style={{
                            padding: "0.5rem 1rem",
                            backgroundColor: "rgba(244, 67, 54, 0.3)",
                            color: "#fff",
                            border: "1px solid rgba(244, 67, 54, 0.5)",
                            borderRadius: "0.3rem",
                            cursor: "pointer",
                            backdropFilter: "blur(5px)",
                            flex: 1,
                          }}
                        >
                          Show All
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Map */}
          <div style={{ 
            flex: 1,
            padding: "1.5rem",
          }}>
            <div style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: "1rem",
              padding: "1.5rem",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              height: "calc(100% - 3rem)",
              overflow: "hidden",
              position: "relative",
            }}>
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
                center={[13.7563, 121.0583]} // default center
                zoom={12}
                style={{ width: "100%", height: "100%", borderRadius: "0.8rem" }}
                scrollWheelZoom={true as any}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Auto-zoom when logs update */}
                <MapUpdater logs={filteredLogs} />

                {/* Show markers */}
                {filteredLogs.map((log, index) => (
                  <Marker key={index} position={[log.latitude, log.longitude]} icon={boatIcon}>
                    <Popup>
                      <strong>{selectedBoat?.boat_name}</strong>
                      <br />
                      {new Date(log.recorded_at).toLocaleString()}
                    </Popup>
                  </Marker>
                ))}

                {/* Draw polyline */}
                {filteredLogs.length > 1 && (
                  <Polyline
                    positions={filteredLogs.map((log) => [log.latitude, log.longitude])}
                    pathOptions={{ color: 'grey', weight: 3, dashArray: '8, 6' }}
                  />
                )}
              </MapContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}