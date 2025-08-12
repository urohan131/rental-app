"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import { Property } from "@/types/prismaTypes";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const Map = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const filters = useAppSelector((state) => state.global.filters);
  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  // Debug logging
  console.log("Map component render:", {
    isLoading,
    isError,
    propertiesCount: properties?.length,
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      ? "Set"
      : "Missing",
    coordinates: filters.coordinates,
  });

  useEffect(() => {
    // Check if access token is available
    if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
      console.error("Mapbox access token is missing!");
      return;
    }

    // Check if container ref is available
    if (!mapContainerRef.current) {
      console.error("Map container ref is not available");
      return;
    }

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/urohan131/cme7dxh0b000401sb18crasnj",
        center: filters.coordinates || [-74.5, 40],
        zoom: 9,
      });

      // Store map instance
      mapInstanceRef.current = map;

      const resizeMap = () => {
        if (map) setTimeout(() => map.resize(), 700);
      };
      resizeMap();

      return () => {
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, [filters.coordinates]); // Remove properties, isLoading, isError from dependencies

  // Separate effect to handle markers when properties change
  useEffect(() => {
    if (!mapInstanceRef.current || isLoading || isError || !properties) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll(".mapboxgl-marker");
    existingMarkers.forEach((marker) => marker.remove());

    // Add new markers
    properties.forEach((property) => {
      const marker = createPropertyMarker(property, mapInstanceRef.current!);
      const markerElement = marker.getElement();
      const path = markerElement.querySelector("path[fill='#3FB1CE']");
      if (path) path.setAttribute("fill", "#000000");
    });
  }, [properties, isLoading, isError]);

  return (
    <div className="basis-5/12 grow relative rounded-xl">
      <div
        className="map-container rounded-xl"
        ref={mapContainerRef}
        style={{
          height: "100%",
          width: "100%",
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-xl">
          <div className="text-gray-600">Loading map...</div>
        </div>
      )}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-xl">
          <div className="text-red-600">Failed to load properties</div>
        </div>
      )}
    </div>
  );
};

const createPropertyMarker = (property: Property, map: mapboxgl.Map) => {
  const marker = new mapboxgl.Marker()
    .setLngLat([
      property.location.coordinates.longitude,
      property.location.coordinates.latitude,
    ])
    .setPopup(
      new mapboxgl.Popup().setHTML(
        `
        <div class="marker-popup">
          <div class="marker-popup-image"></div>
          <div>
            <a href="/search/${property.id}" target="_blank" class="marker-popup-title">${property.name}</a>
            <p class="marker-popup-price">
              $${property.pricePerMonth}
              <span class="marker-popup-price-unit"> / month</span>
            </p>
          </div>
        </div>
        `
      )
    )
    .addTo(map);
  return marker;
};

export default Map;
