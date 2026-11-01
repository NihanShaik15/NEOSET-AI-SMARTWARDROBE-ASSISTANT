import { WeatherData } from '../types';

export interface CitySearchResult {
  name: string;
  country: string;
  admin1?: string;
  lat: number;
  lon: number;
}

// Map WMO weather codes to condition category & labels
export function mapWmoToCondition(code: number, tempC: number): {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'chilly' | 'snowy';
  conditionLabel: string;
} {
  // Freezing / Snow
  if ([71, 73, 75, 77, 85, 86].includes(code) || (code >= 56 && code <= 57) || tempC <= 1) {
    return {
      condition: 'snowy',
      conditionLabel: code >= 85 ? 'Snow Showers' : code === 77 ? 'Snow Grains' : 'Snowfall',
    };
  }

  // Thunderstorm / Rain / Drizzle / Showers
  if ([95, 96, 99].includes(code)) {
    return { condition: 'rainy', conditionLabel: 'Thunderstorm' };
  }
  if ([61, 63, 65, 80, 81, 82].includes(code)) {
    return {
      condition: 'rainy',
      conditionLabel: code === 65 || code === 82 ? 'Heavy Rain' : code === 61 ? 'Light Rain' : 'Rain Showers',
    };
  }
  if ([51, 53, 55].includes(code)) {
    return { condition: 'rainy', conditionLabel: 'Drizzle' };
  }

  // Fog
  if ([45, 48].includes(code)) {
    return { condition: 'cloudy', conditionLabel: 'Foggy / Mist' };
  }

  // Cloudy / Overcast
  if (code === 3) {
    return { condition: 'cloudy', conditionLabel: 'Overcast' };
  }
  if (code === 2) {
    return { condition: 'cloudy', conditionLabel: 'Partly Cloudy' };
  }
  if (code === 1) {
    return { condition: 'sunny', conditionLabel: 'Mainly Clear' };
  }
  if (code === 0) {
    return { condition: 'sunny', conditionLabel: 'Clear Sky' };
  }

  // Chilly fallback based on temp
  if (tempC <= 10) {
    return { condition: 'chilly', conditionLabel: 'Brisk & Chilly' };
  }

  return { condition: 'sunny', conditionLabel: 'Fair Weather' };
}

// Generate smart clothing & styling advice based on real-time weather
export function getClothingAdvice(
  tempC: number,
  condition: 'sunny' | 'cloudy' | 'rainy' | 'chilly' | 'snowy',
  windSpeed: number,
  precipitation: number = 0
): string {
  if (condition === 'rainy' || precipitation > 0.5) {
    return 'Water-resistant outerwear or trench coat recommended. Pair with closed-toe leather footwear.';
  }
  if (condition === 'snowy' || tempC <= 3) {
    return 'Sub-zero insulation required: wool overcoat, thermal knit sweater, and sturdy insulated boots.';
  }
  if (tempC <= 12) {
    return windSpeed > 15
      ? 'Chilly wind chill: Layer a structured jacket over a knit crewneck with tailored trousers.'
      : 'Crisp & cool: A versatile blazer, light jacket, or cozy cardigan works best.';
  }
  if (tempC <= 19) {
    return 'Mild & comfortable: Perfect for layered transitional looks, overshirts, and classic sneakers.';
  }
  if (tempC <= 25) {
    return 'Warm & pleasant: Breathable cottons, lightweight button-downs, and relaxed chinos or skirts.';
  }
  return 'Hot & sunny: High-breathability linen, relaxed tees, UV sunglasses, and open sandals or loafers.';
}

export const POPULAR_CITIES: CitySearchResult[] = [
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { name: 'Milan', country: 'Italy', lat: 45.4642, lon: 9.19 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'New York', country: 'United States', admin1: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.978 },
];

/**
 * Fetch real-time weather for given coordinates or city name using Open-Meteo.
 */
export async function fetchRealtimeWeather(
  target: string | { lat: number; lon: number; cityName?: string; countryName?: string }
): Promise<WeatherData> {
  let lat: number;
  let lon: number;
  let cityName = 'Current Location';
  let countryName: string | undefined;

  if (typeof target === 'string') {
    // City name provided -> Geocode first
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      target.trim()
    )}&count=1&language=en&format=json`;

    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) {
      throw new Error(`Failed to find location for "${target}"`);
    }

    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`Location "${target}" not found`);
    }

    const topResult = geoData.results[0];
    lat = topResult.latitude;
    lon = topResult.longitude;
    cityName = topResult.name;
    countryName = topResult.country;
  } else {
    lat = target.lat;
    lon = target.lon;
    if (target.cityName) cityName = target.cityName;
    if (target.countryName) countryName = target.countryName;
  }

  // Fetch real-time current weather metrics from Open-Meteo
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;

  const weatherRes = await fetch(forecastUrl);
  if (!weatherRes.ok) {
    throw new Error('Failed to retrieve real-time weather from Open-Meteo');
  }

  const weatherJson = await weatherRes.json();
  const current = weatherJson.current;

  if (!current) {
    throw new Error('No current weather reading available');
  }

  const tempC = Math.round(current.temperature_2m);
  const tempF = Math.round((tempC * 9) / 5 + 32);
  const apparentC = Math.round(current.apparent_temperature ?? tempC);
  const apparentF = Math.round((apparentC * 9) / 5 + 32);
  const code = current.weather_code ?? 0;
  const { condition, conditionLabel } = mapWmoToCondition(code, tempC);
  const humidity = Math.round(current.relative_humidity_2m ?? 50);
  const windSpeed = Math.round(current.wind_speed_10m ?? 10);
  const precipitation = current.precipitation ?? 0;
  const isDay = current.is_day === 1;

  const clothingAdvice = getClothingAdvice(tempC, condition, windSpeed, precipitation);

  return {
    city: cityName,
    country: countryName,
    latitude: lat,
    longitude: lon,
    temp: tempC,
    tempF,
    apparentTemp: apparentC,
    apparentTempF: apparentF,
    condition,
    conditionLabel,
    humidity,
    windSpeed,
    precipitation,
    isDay,
    clothingAdvice,
    isRealTime: true,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Search cities for autocomplete
 */
export async function searchCities(query: string): Promise<CitySearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query.trim()
  )}&count=6&language=en&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];

    return data.results.map((r: any) => ({
      name: r.name,
      country: r.country || '',
      admin1: r.admin1,
      lat: r.latitude,
      lon: r.longitude,
    }));
  } catch (err) {
    console.error('Error searching cities:', err);
    return [];
  }
}

/**
 * Detect user's current GPS location via browser navigator.geolocation
 */
export async function detectUserCoordinates(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      (err) => {
        reject(err);
      },
      {
        timeout: 10000,
        maximumAge: 60000,
        enableHighAccuracy: false,
      }
    );
  });
}
