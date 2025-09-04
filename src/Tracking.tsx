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
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
  const [loading, setLoading] = useState(false);

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

  // Handle track button click
  const handleTrack = async (boat: Boat) => {
    setSelectedBoat(boat);
    setLoading(true);

    const { data, error } = await supabase
      .from("boat_location_logs")
      .select("latitude, longitude, recorded_at")
      .eq("boat_id", boat.boat_id) // query by UUID
      .order("recorded_at", { ascending: true });

    setLoading(false);

    if (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
      return;
    }

    if (!data || data.length === 0) {
      console.log(`No logs found for boat_id: ${boat.boat_id}`);
      setLogs([]);
    } else {
      console.log("Fetched logs:", data);
      setLogs(data);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left: Boat List */}
      <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
        <h2>Boat List</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Boat Name</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Registration Number</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {boats.map((boat) => (
              <tr key={boat.boat_id}>
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{boat.boat_name}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{boat.registration_number}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                  <button
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
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

        {/* Loading / No logs message */}
        {loading && <p>Loading logs...</p>}
        {!loading && selectedBoat && logs.length === 0 && (
          <p>No logs found for <strong>{selectedBoat.boat_name}</strong>.</p>
        )}
      </div>

      {/* Right: Map */}
      <div style={{ flex: 1 }}>
        <MapContainer
          center={[13.7563, 121.0583]} // default center
          zoom={12}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Auto-zoom when logs update */}
          <MapUpdater logs={logs} />

          {/* Show markers */}
          {logs.map((log, index) => (
            <Marker key={index} position={[log.latitude, log.longitude]} icon={boatIcon}>
              <Popup>
                <strong>{selectedBoat?.boat_name}</strong>
                <br />
                {new Date(log.recorded_at).toLocaleString()}
              </Popup>
            </Marker>
          ))}

          {/* Draw polyline */}
          {logs.length > 1 && (
            <Polyline
    positions={logs.map((log) => [log.latitude, log.longitude])}
    pathOptions={{ color: 'grey', weight: 3, dashArray: '8, 6' }}
  />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
