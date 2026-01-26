"use client";

import { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

declare const google: any;

const defaultMapContainerStyle = {
  width: "100%",
  height: "260px",
  borderRadius: "15px",
};

const defaultMapCenter = {
  lat: 43.8498,
  lng: 25.9534,
};

const defaultMapZoom = 16;

const defaultMapOptions = {
  zoomControl: true,
  tilt: 0,
  gestureHandling: "auto" as const,
  mapTypeId: "roadmap" as const,
};

type MapProps = {
  address?: string;
};

export function Map({ address }: MapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
  });

  useEffect(() => {
    if (!isLoaded) return;

    if (!address || !address.trim()) {
      setCenter(defaultMapCenter);
      return;
    }

    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results: any, status: string) => {
        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location;
          setCenter({ lat: location.lat(), lng: location.lng() });
        } else {
          if (process.env.NODE_ENV === "development") {
            console.error("Geocoding failed", status, results);
          }
          setCenter(defaultMapCenter);
        }
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error creating geocoder", error);
      }
      setCenter(defaultMapCenter);
    }
  }, [address, isLoaded]);

  if (loadError || !apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error loading Google Maps script", loadError);
    }
    return null;
  }

  if (!isLoaded || !center) {
    return (
      <div className="h-[260px] w-full rounded-[15px] bg-accent animate-pulse" />
    );
  }

  return (
    <div className="w-full">
      <GoogleMap
        mapContainerStyle={defaultMapContainerStyle}
        center={center}
        zoom={defaultMapZoom}
        options={defaultMapOptions}
      >
        <Marker position={center} />
      </GoogleMap>
    </div>
  );
}
