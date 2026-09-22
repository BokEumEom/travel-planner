import { WeatherData } from '../types';

const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

export async function fetchWeatherForLocation(
  lat: number,
  lng: number,
  locationName: string = 'Location'
): Promise<WeatherData | null> {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return null;
  }

  const cacheKey = `${lat.toFixed(2)}_${lng.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `/api/weather?lat=${lat}&lng=${lng}&name=${encodeURIComponent(locationName)}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Weather API request failed with status: ${response.status}`);
      return null;
    }
    const data: WeatherData = await response.json();
    weatherCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Failed to fetch weather for location:', error);
    return null;
  }
}
