/**
 * WEATHER SERVICE — client hook that asks our own /api/weather route
 * (Open-Meteo underneath; no API key). Geolocation is optional and only
 * requested if enabled in data/config.ts; everything falls back to the
 * configured city, and any failure falls back to "clear" so the sky never
 * looks broken.
 */

import { useEffect, useState } from "react";
import { features } from "@/data/config";

export type WeatherKind = "clear" | "cloudy" | "rain" | "snow";

export type Weather = {
  kind: WeatherKind;
  /** °C, rounded; null when unknown. */
  temp: number | null;
};

const FALLBACK: Weather = { kind: "clear", temp: null };

export function useWeather(): Weather {
  const [weather, setWeather] = useState<Weather>(FALLBACK);

  useEffect(() => {
    if (!features.weather) return;
    let cancelled = false;

    const fetchFor = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        if (!res.ok) return;
        const data = (await res.json()) as Weather;
        if (!cancelled && data && data.kind) setWeather(data);
      } catch {
        /* keep fallback */
      }
    };

    const fetchFallbackCity = () =>
      fetchFor(features.fallbackCity.lat, features.fallbackCity.lon);

    if (features.weatherGeolocation && "geolocation" in navigator) {
      // permissions API lets us avoid an unprompted permission dialog:
      // only use geolocation if the user has already granted it.
      navigator.permissions
        ?.query({ name: "geolocation" })
        .then((status) => {
          if (status.state === "granted") {
            navigator.geolocation.getCurrentPosition(
              (pos) => fetchFor(pos.coords.latitude, pos.coords.longitude),
              () => fetchFallbackCity(),
              { timeout: 5000 },
            );
          } else {
            void fetchFallbackCity();
          }
        })
        .catch(() => void fetchFallbackCity());
    } else {
      void fetchFallbackCity();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return weather;
}
