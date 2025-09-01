import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useParams, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapView = () => {
  const { location } = useParams();
  const navigate = useNavigate();
  const [coordinates, setCoordinates] = useState([20.5937, 78.9629]); // Default to India center
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const geocodeLocation = async () => {
      try {
        if (location) {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              location
            )}`
          );
          const data = await response.json();

          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            setCoordinates([parseFloat(lat), parseFloat(lon)]);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error geocoding location:", error);
        setLoading(false);
      }
    };

    geocodeLocation();
  }, [location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-md p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoArrowBack className="text-xl" />
          </button>
          <div>
            <h1 className="text-xl font-semibold">Location Map</h1>
            <p className="text-sm text-gray-600">
              {location || "Job Location"}
            </p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-full w-full pt-20">
        <MapContainer
          center={coordinates}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={coordinates}>
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold">Job Location</h3>
                <p className="text-sm text-gray-600">{location}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
