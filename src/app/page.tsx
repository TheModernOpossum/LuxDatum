"use client"; // Force this file to be a client component

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import Leaflet map (client-side only)
const MapComponent = dynamic(() => import("../components/MapComponent"), {
    ssr: false, // Ensures Leaflet only loads on the client
});

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-4xl font-bold mb-6">Lux~Datum : NASA Satellite Imagery</h1>

            {/* Map - Loaded on Client Only */}
            <Suspense fallback={<p>Hang in there, we're working on it...</p>}>
                <MapComponent />
            </Suspense>
        </div>
    );
}