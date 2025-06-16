import Navbar from "../components/Navbar";
import MapComponent from "../components/MapComponent";
import { auth } from "../services/firebase";
import './MapPage.css';

export default function MapPage() {
  const logout = () => auth.signOut();

  return (
    <div className="map-page">
      <Navbar onLogout={logout} />
      <div className="map-container">
        <MapComponent />
      </div>
    </div>
  );
}