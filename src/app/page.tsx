"use client";

import { useState } from "react"; 
import axios from "axios";
import Image from "next/image";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [latitude, setLatitude] = useState("37.7749"); // Default: SF
  const [longitude, setLongitude] = useState("-122.4194"); // Default: SF
  const [date, setDate] = useState("2025-01-15"); // Default: Recent Date
  const [layer, setLayer] = useState("natural"); // Default dataset

  const fetchImage = async () => {
    setLoading(true);
    setError(null);
    setImageSrc(null);

    try {
      const API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY;
      if (!API_KEY) throw new Error("Missing NASA API Key");

      const response = await axios.get("https://api.nasa.gov/planetary/earth/assets", {
        params: {
          lat: latitude,
          lon: longitude,
          dim: 0.1,
          date: date,
          api_key: API_KEY,
          layer: layer, // Selected NASA dataset
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

  // Map Click Handler: Updates lat/lon on click
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setLatitude(e.latlng.lat.toFixed(4));
        setLongitude(e.latlng.lng.toFixed(4));
      },
    });
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">LuxDatum Earth Imagery</h1>

      {/* Inputs for Coordinates and Date */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-4">
          <input
            type="number"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="Latitude"
            className="p-2 bg-gray-800 border border-gray-700 rounded text-white"
          />
          <input
            type="number"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="Longitude"
            className="p-2 bg-gray-800 border border-gray-700 rounded text-white"
          />
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 bg-gray-800 border border-gray-700 rounded text-white"
        />

        {/* NASA Dataset Selector */}
        <select
          value={layer}
          onChange={(e) => setLayer(e.target.value)}
          className="p-2 bg-gray-800 border border-gray-700 rounded hover:shadow-lg transition-shadow text-white"
        >
          <option value="natural">🌍 Natural Color</option>
          <option value="vegetation">🌱 Vegetation Index (NDVI)</option>
          <option value="thermal">🔥 Thermal Infrared</option>
        </select>

        <button
          onClick={fetchImage}
          className="p-3 bg-blue-600 hover:bg-blue-500 rounded font-bold transition-transform transform hover:scale-105 hover:shadow-lg"
        >
          Fetch Image
        </button>
      </div>

      {/* Interactive Map */}
      <div className="w-full h-96 border border-gray-600 rounded-lg shadow-md">
        <MapContainer center={[parseFloat(latitude), parseFloat(longitude)]} zoom={4} className="w-full h-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[parseFloat(latitude), parseFloat(longitude)]} />
          <MapClickHandler />
        </MapContainer>
      </div>

      {/* Image Display */}
      <div className="mt-6">
        {loading ? (
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          imageSrc && (
            <Image
              src={imageSrc}
              alt="NASA Satellite View"
              width={800}
              height={400}
              unoptimized
              className="w-full max-w-3xl rounded-lg shadow-lg border border-gray-600"
            />
          )
        )}
      </div>
    </div>
  );
}
