"use client";

import { useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix missing Leaflet marker icons in Next.js
const markerIcon = new L.Icon({
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Map interaction hook
function LocationMarker({ setLat, setLon }: { setLat: (lat: string) => void; setLon: (lon: string) => void }) {
    useMapEvents({
        click(e) {
            setLat(e.latlng.lat.toFixed(6));
            setLon(e.latlng.lng.toFixed(6));
        },
    });
    return null;
}

export default function MapComponent() {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [latitude, setLatitude] = useState("37.7749"); // Default: SF
    const [longitude, setLongitude] = useState("-122.4194"); // Default: SF
    const [date, setDate] = useState("2025-01-15"); // Default: Recent Date

    // Fetch NASA satellite image
    const fetchImage = async () => {
        setLoading(true);
        setError(null);
        setImageSrc(null);

        try {
            const API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY;
            if (!API_KEY) throw new Error("Missing NASA API Key");

            const response = await axios.get("https://api.nasa.gov/planetary/earth/imagery", {
                params: {
                    lat: latitude,
                    lon: longitude,
                    dim: 0.1,
                    date: date,
                    api_key: API_KEY,
                },
                responseType: "blob",
            });

            const imageBlob = response.data;
            const imageObjectURL = URL.createObjectURL(imageBlob);
            setImageSrc(imageObjectURL);
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error("Error fetching NASA data:", err.message);
                setError(`Failed to fetch satellite image: ${err.message}`);
            } else {
                console.error("Unknown error fetching NASA data.");
                setError("An unknown error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-3xl">
            {/* Interactive Map */}
            <MapContainer center={[parseFloat(latitude), parseFloat(longitude)]} zoom={5} className="h-80 w-full rounded-lg shadow-lg">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[parseFloat(latitude), parseFloat(longitude)]} icon={markerIcon} />
                <LocationMarker setLat={setLatitude} setLon={setLongitude} />
            </MapContainer>

            {/* Input Fields */}
            <div className="flex flex-col gap-4 mt-6 w-full">
                <div className="flex gap-4">
                    <input
                        type="number"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="Latitude"
                        className="p-3 bg-gray-800 border border-gray-700 rounded w-1/2 text-center"
                    />
                    <input
                        type="number"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="Longitude"
                        className="p-3 bg-gray-800 border border-gray-700 rounded w-1/2 text-center"
                    />
                </div>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="p-3 bg-gray-800 border border-gray-700 rounded text-center"
                />
                <button
                    onClick={fetchImage}
                    className="p-3 bg-blue-600 hover:bg-blue-500 rounded font-bold w-full"
                >
                    Fetch Image
                </button>
            </div>

            {/* Display Satellite Image */}
            <div className="mt-6 w-full">
                {loading ? (
                    <p>Loading satellite image...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    imageSrc && (
                        <img
                            src={imageSrc}
                            alt="NASA Satellite View"
                            className="w-full rounded-lg shadow-lg"
                        />
                    )
                )}
            </div>
        </div>
    );
}