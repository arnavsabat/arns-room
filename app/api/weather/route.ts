import { NextRequest, NextResponse } from "next/server";

/**
 * WEATHER — proxies Open-Meteo (free, no API key) and reduces its weather
 * codes to the four kinds the sky knows how to draw. Cached for 15 minutes.
 * Fails soft: any error returns a calm clear night.
 */

export const revalidate = 900;

function kindFromCode(code: number): "clear" | "cloudy" | "rain" | "snow" {
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return "rain";
  if (code >= 2) return "cloudy";
  return "clear";
}

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lon = Number(req.nextUrl.searchParams.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ kind: "clear", temp: null });
  }
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`,
      { next: { revalidate: 900 } },
    );
    if (!res.ok) throw new Error("upstream error");
    const data = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
    };
    return NextResponse.json({
      kind: kindFromCode(data.current?.weather_code ?? 0),
      temp: data.current?.temperature_2m != null ? Math.round(data.current.temperature_2m) : null,
    });
  } catch {
    return NextResponse.json({ kind: "clear", temp: null });
  }
}
