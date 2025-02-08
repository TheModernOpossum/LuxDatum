"use client";

import { useState, useEffect } from "react"; Image from "next/image";
import axios from "axios";

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY;
        if (!API_KEY) throw new Error("Missing NASA API Key");

        const response = await axios.get("https://api.nasa.gov/planetary/earth/imagery", {
          params: {
            lat: 37.7749,
            lon: -122.4194,
            dim: 0.1,
            date: "2025-01-15",
            api_key: API_KEY,
          },
          responseType: "blob", // Ensures we get binary data
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
      }
}
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, []);

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-3xl font-bold mb-4">LuxDatum Earth Imagery</h1>

        {loading ? (
            <p>Loading satellite image...</p>
        ) : error ? (
            <p className="text-red-500">{error}</p>
        ) : (
            {imageSrc && (
                <Image
                    src={imageSrc}
                    alt="NASA Satellite View"
                    width={800}
                    height={400}
                    unoptimized={true}  // ✅ Fixes Next.js warning
                    className="w-full max-w-3xl rounded-lg shadow-lg"
                />
            )}
        )}
      </div>
  );
}