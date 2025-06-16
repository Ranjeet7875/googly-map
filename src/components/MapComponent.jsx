import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import { useEffect, useState } from "react";
import { useMapEvents } from "react-leaflet";

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

function Routing({ pointA, pointB }) {
  const map = useMapEvents({});

  useEffect(() => {
    if (!pointA || !pointB) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(pointA), L.latLng(pointB)],
      routeWhileDragging: false,
      createMarker: function () { return null; },
      lineOptions: {
        styles: [{ color: '#667eea', weight: 6, opacity: 0.8 }]
      }
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [pointA, pointB, map]);

  return null;
}

async function searchCities(query) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
  return await response.json();
}

export default function MapComponent() {
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [pointA, setPointA] = useState(null);
  const [pointB, setPointB] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (fromCity.length > 2) {
        const results = await searchCities(fromCity);
        setFromSuggestions(results);
      } else {
        setFromSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [fromCity]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (toCity.length > 2) {
        const results = await searchCities(toCity);
        setToSuggestions(results);
      } else {
        setToSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [toCity]);

  const handleSearch = async () => {
    if (!fromCity.trim() || !toCity.trim()) {
      setError("Please enter both cities");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [coordA, coordB] = await Promise.all([
        searchCities(fromCity),
        searchCities(toCity)
      ]);
      setPointA([parseFloat(coordA[0].lat), parseFloat(coordA[0].lon)]);
      setPointB([parseFloat(coordB[0].lat), parseFloat(coordB[0].lon)]);
    } catch (error) {
      setError("Error finding cities: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFromCity("");
    setToCity("");
    setPointA(null);
    setPointB(null);
    setError("");
    setFromSuggestions([]);
    setToSuggestions([]);
  };

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
    const tempPoint = pointA;
    setPointA(pointB);
    setPointB(tempPoint);
  };

  return (
    <div className="map-wrapper">
      {/* Background Decoration */}
      <div className="bg-decoration">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">📍</div>
            <h1>RouteMapper</h1>
          </div>
          <div className="header-stats">
            <div className="stat">
              <span className="stat-number">2.5M+</span>
              <span className="stat-label">Routes Mapped</span>
            </div>
          </div>
        </div>
      </header>

      {/* Search Panel */}
      <div className={`search-panel ${isMinimized ? 'minimized' : ''}`}>
        <div className="panel-header">
          <div className="panel-title">
            <div className="title-icon">🗺️</div>
            <h3>Plan Your Journey</h3>
          </div>
          <button 
            className="minimize-btn"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? '📍' : '—'}
          </button>
        </div>
        
        <div className="panel-content">
          <div className="route-inputs">
            <div className="input-container from-input">
              <div className="input-header">
                <span className="input-icon departure">🟢</span>
                <label>Departure</label>
              </div>
              <input
                type="text"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                disabled={loading}
                placeholder="Enter starting city..."
              />
              {fromSuggestions.length > 0 && (
                <ul className="suggestions-list">
                  {fromSuggestions.slice(0, 5).map((item, i) => (
                    <li key={i} onClick={() => {
                      setFromCity(item.display_name);
                      setPointA([parseFloat(item.lat), parseFloat(item.lon)]);
                      setFromSuggestions([]);
                    }}>
                      <span className="suggestion-icon">📍</span>
                      <span className="suggestion-text">{item.display_name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button className="swap-button" onClick={swapCities} disabled={loading}>
              <span className="swap-icon">⇅</span>
              <span className="swap-text">Swap</span>
            </button>

            <div className="input-container to-input">
              <div className="input-header">
                <span className="input-icon destination">🔴</span>
                <label>Destination</label>
              </div>
              <input
                type="text"
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                disabled={loading}
                placeholder="Enter destination city..."
              />
              {toSuggestions.length > 0 && (
                <ul className="suggestions-list">
                  {toSuggestions.slice(0, 5).map((item, i) => (
                    <li key={i} onClick={() => {
                      setToCity(item.display_name);
                      setPointB([parseFloat(item.lat), parseFloat(item.lon)]);
                      setToSuggestions([]);
                    }}>
                      <span className="suggestion-icon">📍</span>
                      <span className="suggestion-text">{item.display_name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="primary-btn find-route-btn" 
              onClick={handleSearch} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  <span>Finding Route...</span>
                </>
              ) : (
                <>
                  <span className="btn-icon">🔍</span>
                  <span>Find Route</span>
                </>
              )}
            </button>
            <button 
              className="secondary-btn clear-btn" 
              onClick={handleClear} 
              disabled={loading}
            >
              <span className="btn-icon">🗑️</span>
              <span>Clear</span>
            </button>
          </div>

          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {pointA && pointB && (
            <div className="route-info">
              <div className="route-status">
                <span className="status-icon">✅</span>
                <span>Route calculated successfully!</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <MapContainer center={[20.5937, 78.9629]} zoom={5} className="map-container">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        {pointA && <Marker position={pointA} />}
        {pointB && <Marker position={pointB} />}
        {pointA && pointB && <Routing pointA={pointA} pointB={pointB} />}
      </MapContainer>

      <style jsx>{`
        .map-wrapper {
          position: relative;
          width: 100vw;
          height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          overflow: hidden;
        }

        /* Background Decoration */
        .bg-decoration {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .floating-shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          animation: float 20s infinite ease-in-out;
        }

        .shape-1 {
          width: 300px;
          height: 300px;
          top: 10%;
          right: 10%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 200px;
          height: 200px;
          bottom: 20%;
          right: 20%;
          animation-delay: 7s;
        }

        .shape-3 {
          width: 150px;
          height: 150px;
          top: 60%;
          left: 5%;
          animation-delay: 14s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-30px) rotate(120deg); }
          66% { transform: translateY(-60px) rotate(240deg); }
        }

        /* Header */
        .app-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 16px 24px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          font-size: 28px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .logo h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-stats {
          display: flex;
          gap: 24px;
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 16px;
          font-weight: 700;
          color: #667eea;
        }

        .stat-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Search Panel */
        .search-panel {
          position: absolute;
          top: 100px;
          left: 24px;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 
            0 32px 64px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.3);
          width: 400px;
          max-height: calc(100vh - 140px);
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .search-panel.minimized {
          width: 60px;
          height: 60px;
          border-radius: 50%;
        }

        .search-panel.minimized .panel-content {
          opacity: 0;
          pointer-events: none;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .panel-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .title-icon {
          font-size: 24px;
        }

        .panel-title h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
        }

        .minimize-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .minimize-btn:hover {
          background: rgba(102, 126, 234, 0.2);
          transform: scale(1.1);
        }

        .panel-content {
          padding: 24px;
          transition: opacity 0.3s ease;
        }

        .route-inputs {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .input-container {
          position: relative;
        }

        .input-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .input-icon {
          font-size: 12px;
        }

        .input-header label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .input-container input {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid #f1f5f9;
          border-radius: 16px;
          font-size: 16px;
          color: #1f2937;
          background: #ffffff;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
        }

        .input-container input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          transform: translateY(-2px);
        }

        .input-container input::placeholder {
          color: #9ca3af;
        }

        .swap-button {
          align-self: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 20px;
          position: relative;
          overflow: hidden;
        }

        .swap-button:hover:not(:disabled) {
          transform: rotate(180deg) scale(1.1);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .swap-text {
          position: absolute;
          font-size: 10px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .swap-button:hover .swap-text {
          opacity: 1;
        }

        .suggestions-list {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 1001;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          margin: 4px 0 0 0;
          padding: 0;
          list-style: none;
        }

        .suggestions-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #f8fafc;
          transition: all 0.2s ease;
        }

        .suggestions-list li:hover {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          color: #667eea;
        }

        .suggestion-icon {
          font-size: 14px;
        }

        .suggestion-text {
          font-size: 14px;
          color: #4b5563;
          flex: 1;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .primary-btn, .secondary-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 24px;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: relative;
          overflow: hidden;
        }

        .primary-btn {
          flex: 2;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .primary-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.6);
        }

        .secondary-btn {
          flex: 1;
          background: #f8fafc;
          color: #6b7280;
          border: 2px solid #e5e7eb;
        }

        .secondary-btn:hover:not(:disabled) {
          background: #f1f5f9;
          color: #374151;
          transform: translateY(-2px);
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          color: #dc2626;
          border: 1px solid #fecaca;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .route-info {
          padding: 16px 20px;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 1px solid #bbf7d0;
          border-radius: 12px;
        }

        .route-status {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #059669;
          font-weight: 500;
        }

        .map-container {
          width: 100% !important;
          height: 100vh !important;
          border-radius: 0;
          z-index: 1;
        }

        .leaflet-routing-container {
          visibility: hidden;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .app-header {
            padding: 12px 16px;
          }

          .header-stats {
            display: none;
          }

          .logo h1 {
            font-size: 20px;
          }

          .search-panel {
            left: 16px;
            right: 16px;
            width: auto;
            top: 80px;
          }

          .action-buttons {
            flex-direction: column;
          }

          .primary-btn, .secondary-btn {
            flex: 1;
          }
        }

        @media (max-width: 480px) {
          .panel-content {
            padding: 16px;
          }

          .input-container input {
            padding: 14px 16px;
          }

          .primary-btn, .secondary-btn {
            padding: 14px 20px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}