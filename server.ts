import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiEnabled: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Real-time weather endpoint (Open-Meteo proxy)
app.get('/api/weather/current', async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    let targetLat = Number(lat);
    let targetLon = Number(lon);
    let targetCity = typeof city === 'string' ? city : '';
    let targetCountry = '';

    if ((!targetLat || !targetLon) && targetCity) {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(targetCity)}&count=1&language=en&format=json`
      );
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          targetLat = geoData.results[0].latitude;
          targetLon = geoData.results[0].longitude;
          targetCity = geoData.results[0].name;
          targetCountry = geoData.results[0].country;
        }
      }
    }

    if (!targetLat || !targetLon) {
      // Default to Paris fashion capital
      targetLat = 48.8566;
      targetLon = 2.3522;
      targetCity = 'Paris';
      targetCountry = 'France';
    }

    const forecastRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`
    );

    if (!forecastRes.ok) {
      return res.status(502).json({ error: 'Failed to fetch weather from provider' });
    }

    const forecastData = await forecastRes.json();
    const current = forecastData.current;

    const tempC = Math.round(current.temperature_2m);
    const tempF = Math.round((tempC * 9) / 5 + 32);
    const apparentC = Math.round(current.apparent_temperature ?? tempC);
    const apparentF = Math.round((apparentC * 9) / 5 + 32);

    res.json({
      city: targetCity || 'Paris',
      country: targetCountry,
      latitude: targetLat,
      longitude: targetLon,
      temp: tempC,
      tempF,
      apparentTemp: apparentC,
      apparentTempF: apparentF,
      weatherCode: current.weather_code,
      humidity: Math.round(current.relative_humidity_2m ?? 50),
      windSpeed: Math.round(current.wind_speed_10m ?? 10),
      precipitation: current.precipitation ?? 0,
      isDay: current.is_day === 1,
      isRealTime: true,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Weather API error:', err);
    res.status(500).json({ error: err.message || 'Internal weather error' });
  }
});

// Real-time city search endpoint
app.get('/api/weather/search', async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!q || q.length < 2) {
      return res.json({ results: [] });
    }

    const searchRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`
    );

    if (!searchRes.ok) {
      return res.json({ results: [] });
    }

    const searchData = await searchRes.json();
    res.json({ results: searchData.results || [] });
  } catch (err: any) {
    console.error('Weather search error:', err);
    res.json({ results: [] });
  }
});

// AI Outfit Recommendation Endpoint
app.post('/api/ai/recommend', async (req, res) => {
  try {
    const { wardrobe, occasion, vibe, weather } = req.body;

    if (!wardrobe || !Array.isArray(wardrobe) || wardrobe.length === 0) {
      return res.status(400).json({ error: 'No wardrobe items provided' });
    }

    const ai = getGeminiClient();

    // If Gemini is configured, invoke gemini-3.8-flash
    if (ai) {
      try {
        const simplifiedWardrobe = wardrobe.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          subCategory: item.subCategory,
          color: item.colorName || item.color,
          weather: item.weather,
          occasions: item.occasions,
          tags: item.tags,
        }));

        const prompt = `You are a high-end personal stylist for the app NeoSet.
Recommend ONE perfect outfit strictly selected from the user's existing wardrobe items.
Context:
- Destination/Occasion: ${occasion || 'casual outing'}
- Mood/Vibe: ${vibe || 'effortless chic'}
- Weather: ${weather ? `${weather.temp}°C (${weather.conditionLabel}, ${weather.condition}) in ${weather.city}` : '20°C mild'}

User's existing wardrobe:
${JSON.stringify(simplifiedWardrobe, null, 2)}

Instructions:
1. You MUST pick exactly one topwear id, one bottomwear id, and one footwear id from the wardrobe list above.
2. If available, also pick one accessory id.
3. Write an insightful stylist note explaining why these pieces complement each other, fit the temperature, and suit the occasion.
4. Output JSON matching the required schema.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: 'Chic title for the look' },
                topwearId: { type: Type.STRING, description: 'ID of chosen topwear' },
                bottomwearId: { type: Type.STRING, description: 'ID of chosen bottomwear' },
                footwearId: { type: Type.STRING, description: 'ID of chosen footwear' },
                accessoryId: { type: Type.STRING, description: 'ID of chosen accessory or empty' },
                weatherReason: { type: Type.STRING, description: 'Brief sentence on why it fits the weather' },
                stylistAdvice: { type: Type.STRING, description: 'Styling advice and outfit harmony tips' },
                colorPalette: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Array of 3 hex or color names in this outfit',
                },
                matchScore: { type: Type.INTEGER, description: 'Match percentage between 90 and 99' },
              },
              required: ['title', 'topwearId', 'bottomwearId', 'footwearId', 'stylistAdvice', 'weatherReason'],
            },
          },
        });

        const rawText = response.text?.trim() || '{}';
        const parsed = JSON.parse(rawText);

        return res.json({
          success: true,
          aiGenerated: true,
          recommendation: parsed,
        });
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to rule-based engine:', geminiError?.message);
      }
    }

    // Fallback: Intelligent styling algorithm
    const tops = wardrobe.filter((i: any) => i.category === 'topwear');
    const bottoms = wardrobe.filter((i: any) => i.category === 'bottomwear');
    const shoes = wardrobe.filter((i: any) => i.category === 'footwear');
    const accessories = wardrobe.filter((i: any) => i.category === 'accessories');

    // Score items based on occasion and weather
    const scoreItem = (item: any) => {
      let score = 0;
      if (item.occasions?.includes(occasion)) score += 3;
      if (weather && (item.weather?.includes(weather.condition) || item.weather?.includes('all'))) score += 2;
      if (item.isFavorite) score += 1;
      return score;
    };

    const bestTop = [...tops].sort((a, b) => scoreItem(b) - scoreItem(a))[0] || tops[0];
    const bestBottom = [...bottoms].sort((a, b) => scoreItem(b) - scoreItem(a))[0] || bottoms[0];
    const bestShoes = [...shoes].sort((a, b) => scoreItem(b) - scoreItem(a))[0] || shoes[0];
    const bestAccessory = accessories.length > 0 ? accessories[0] : null;

    return res.json({
      success: true,
      aiGenerated: false,
      recommendation: {
        title: `${occasion.charAt(0).toUpperCase() + occasion.slice(1)} Elegance`,
        topwearId: bestTop?.id,
        bottomwearId: bestBottom?.id,
        footwearId: bestShoes?.id,
        accessoryId: bestAccessory?.id || null,
        weatherReason: `Tailored for ${weather ? `${weather.temp}°C ${weather.conditionLabel}` : 'the current forecast'} with breathable, layered versatility.`,
        stylistAdvice: `Pairing the ${bestTop?.name || 'top'} with the ${bestBottom?.name || 'bottom'} creates a balanced, elongated silhouette ideal for ${occasion}.`,
        colorPalette: [bestTop?.color || '#333', bestBottom?.color || '#555', bestShoes?.color || '#fff'],
        matchScore: 96,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/ai/recommend:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Interactive AI Stylist Chat & Fashion Consultation Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history, avatarConfig, wardrobe, currentOutfit } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGeminiClient();
    const gender = avatarConfig?.gender || req.body.gender || 'boy';
    const skinTone = avatarConfig?.skinToneName || req.body.skinTone || 'Medium Neutral';
    const build = avatarConfig?.build || req.body.build || 'athletic';

    if (ai) {
      try {
        const systemPrompt = `You are Neo, an elite, knowledgeable, and empathetic AI Fashion Stylist & Color Theory Consultant at NeoSet.
The user is a ${gender} with a ${build} build and ${skinTone} skin undertone.
Worn items:
- Top: ${currentOutfit?.topwear?.name || 'None'} (${currentOutfit?.topwear?.colorName || ''})
- Bottom: ${currentOutfit?.bottomwear?.name || 'None'} (${currentOutfit?.bottomwear?.colorName || ''})
- Shoes: ${currentOutfit?.footwear?.name || 'None'} (${currentOutfit?.footwear?.colorName || ''})
- Accessory: ${currentOutfit?.accessory?.name || 'None'}

Your personality:
- Highly knowledgeable in color theory (contrast ratios, complementary vs analogous palettes, undertone matching for skin).
- Expertise in garment fit, fabric drape, body silhouette balancing, occasion etiquette (smart-casual, black tie, street-luxe, minimal athleisure).
- Concise, warm, inspiring, and actionable. Avoid generic fluff; give specific tips!
- Keep response under 150 words with 2-3 quick bullet points when relevant.`;

        const chatResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `${systemPrompt}\n\nUser Question: ${message}`,
        });

        const reply = chatResponse.text?.trim() || 'Your look has great balance!';
        return res.json({
          reply,
          aiGenerated: true,
        });
      } catch (err: any) {
        console.warn('Gemini chat failed, using expert fallback:', err?.message);
      }
    }

    // Expert Fallback Knowledge Engine
    const msg = message.toLowerCase();
    let reply = '';
    const tips: string[] = [];

    if (msg.includes('color') || msg.includes('skin') || msg.includes('tone')) {
      reply = `With your ${skinTone} complexion and ${gender === 'boy' ? 'masculine' : 'feminine'} profile, earthy neutrals like rich espresso, olive green, warm camel, and crisp optic white create high-impact contrast without washing you out.`;
      tips.push('Use the 60-30-10 color rule: 60% dominant base, 30% secondary neutral, 10% accent pop.');
      tips.push('Jewel tones like emerald, cobalt, and burgundy make your skin undertone glow.');
    } else if (msg.includes('party') || msg.includes('evening') || msg.includes('night') || msg.includes('date')) {
      if (gender === 'boy') {
        reply = `For an evening out, a tailored charcoal or midnight wool blazer paired with a clean black Supima tee and dark tapered denim strikes the ideal balance between effortless coolness and refined elegance.`;
        tips.push('Swap sneakers for leather Chelsea boots or sleek penny loafers.');
        tips.push('Add a minimalist analog watch or silver pendant for subtle intrigue.');
      } else {
        reply = `For an evening vibe, pair a luxurious silk or satin slip top with tailored high-waist trousers or a pleated skirt. Add pointed-toe heels to elongate the silhouette.`;
        tips.push('Monochrome tones like burgundy or deep emerald elevate evening looks instantly.');
      }
    } else if (msg.includes('work') || msg.includes('office') || msg.includes('interview') || msg.includes('business')) {
      reply = `For modern professional settings, smart layering is key. Pair a structured blazer with a crisp button-down shirt and straight-cut trousers for a sharp, confident posture.`;
      tips.push('Keep textures crisp—poplin cotton, fine-gauge merino wool, and structured leather.');
      tips.push('Ensure trousers break cleanly at the shoe tongue without bunching.');
    } else if (msg.includes('body') || msg.includes('size') || msg.includes('build') || msg.includes('shoulders') || msg.includes('silhouette')) {
      if (build === 'athletic' || build === 'muscular') {
        reply = `For an athletic or muscular frame, focus on structured shoulders and tapered waists that emphasize a clean V-taper. Avoid overly loose or boxy fabrics that hide your definition.`;
      } else if (build === 'slim') {
        reply = `For a slim silhouette, layering adds dimension. Try a crewneck knit sweater under an open overshirt or bomber jacket to add visual breadth.`;
      } else {
        reply = `Balancing proportions is all about creating vertical flow. Pair fitted tops with relaxed straight-leg bottoms or vice versa to prevent a boxy look.`;
      }
    } else if (msg.includes('shoe') || msg.includes('sneaker') || msg.includes('boot')) {
      reply = `Shoes define the formality of any ensemble. Clean white leather minimalist sneakers dress down a suit into European smart-casual, while black Chelsea boots instantly add edge and poise.`;
    } else {
      reply = `Looking at your current ensemble, the silhouette is ${currentOutfit?.topwear && currentOutfit?.bottomwear ? 'well-proportioned and visually balanced' : 'coming together nicely'}. Try contrasting textures—like pairing smooth cotton poplin with textured wool knit or crisp denim—to add depth without visual clutter!`;
    }

    return res.json({
      reply: tips.length > 0 ? `${reply}\n\n${tips.map((t) => `• ${t}`).join('\n')}` : reply,
      aiGenerated: false,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    res.status(500).json({ error: 'Failed to process stylist chat' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NeoSet server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
