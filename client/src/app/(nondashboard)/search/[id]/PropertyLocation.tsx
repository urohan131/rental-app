import { useGetPropertyQuery } from "@/state/api";
import { Compass, MapPin } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useEffect, useRef, useState } from "react";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const PropertyLocation = ({ propertyId }: PropertyDetailsProps) => {
  const {
    data: property,
    isError,
    isLoading,
  } = useGetPropertyQuery(propertyId);
  const mapContainerRef = useRef(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Debug logging
  console.log("PropertyLocation component render:", {
    propertyId,
    isLoading,
    isError,
    hasProperty: !!property,
    hasLocation: !!property?.location,
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      ? "Set"
      : "Missing",
  });

  useEffect(() => {
    if (isLoading || isError || !property) return;

    // Clear any previous errors
    setMapError(null);

    // Check if access token is available
    if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
      console.error("Mapbox access token is missing!");
      setMapError(
        "Mapbox access token is missing. Please configure NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN."
      );
      return;
    }

    // Check if container ref is available
    if (!mapContainerRef.current) {
      console.error("Map container ref is not available");
      setMapError("Map container is not available.");
      return;
    }

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/majesticglue/cm6u301pq008b01sl7yk1cnvb",
        center: [
          property.location.coordinates.longitude,
          property.location.coordinates.latitude,
        ],
        zoom: 14,
      });

      // Wait for map to load before adding marker
      map.on("load", () => {
        const marker = new mapboxgl.Marker()
          .setLngLat([
            property.location.coordinates.longitude,
            property.location.coordinates.latitude,
          ])
          .addTo(map);

        const markerElement = marker.getElement();
        const path = markerElement.querySelector("path[fill='#3FB1CE']");
        if (path) path.setAttribute("fill", "#000000");
      });

      return () => {
        map.remove();
      };
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError(
        `Failed to initialize map: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }, [property, isError, isLoading]);

  if (isLoading)
    return (
      <div className="py-16">
        <div className="text-gray-600">Loading map...</div>
      </div>
    );
  if (isError || !property) {
    return (
      <div className="py-16">
        <div className="text-red-600">Property not Found</div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-100">
        Map and Location
      </h3>
      <div className="flex justify-between items-center text-sm text-primary-500 mt-2">
        <div className="flex items-center text-gray-500">
          <MapPin className="w-4 h-4 mr-1 text-gray-700" />
          Property Address:
          <span className="ml-2 font-semibold text-gray-700">
            {property.location?.address || "Address not available"}
          </span>
        </div>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(
            property.location?.address || ""
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-between items-center hover:underline gap-2 text-primary-600"
        >
          <Compass className="w-5 h-5" />
          Get Directions
        </a>
      </div>
      <div
        className="relative mt-4 h-[300px] w-full rounded-lg overflow-hidden"
        ref={mapContainerRef}
        style={{ minHeight: "300px" }}
      />
      {mapError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-700 text-sm">
            <strong>Map Error:</strong> {mapError}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyLocation;
