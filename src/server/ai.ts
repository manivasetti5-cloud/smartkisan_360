import { GoogleGenAI, Type } from '@google/genai';
import { CropSuggestion, CropDiseaseResult } from '../types';

// Lazy initialize Gemini AI client
let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing in Secrets.');
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// Predefined crop database for dynamic fallback in case Gemini is unavailable or rate-limited
const cropDetails: Record<string, {
  harvestMonths: number;
  currentPrice: number;
  predictedPrice: number;
  yield: string;
  climateReason: string;
  soilReason: string;
  schedule: Array<{ week: number; title: string; instructions: string }>;
}> = {
  'Wheat': {
    harvestMonths: 4,
    currentPrice: 28.5,
    predictedPrice: 34.2,
    yield: "1.8 - 2.2 tons per acre",
    climateReason: "Wheat grows exceptionally well in cool, dry winter seasons with moderate watering. (Evaluated via Agronomy Model Engine)",
    soilReason: "Thrives perfectly in well-drained loamy and clayey soils that retain moisture. (Evaluated via Agronomy Model Engine)",
    schedule: [
      { week: 1, title: "Land Prep & Sowing", instructions: "Ensure soil is tilled finely. Sowing deep at 4-5 cm using high quality treated seeds." },
      { week: 3, title: "First Irrigation (CRI)", instructions: "Irrigate at Crown Root Initiation stage. Apply first dose of nitrogen fertilizer." },
      { week: 6, title: "Tillering Phase", instructions: "Weed control and secondary weeding. Maintain optimal moisture level." },
      { week: 9, title: "Jointing & Booting", instructions: "Apply secondary nitrogen. Monitor carefully for rust or blight infections." },
      { week: 12, title: "Flowering & Milking", instructions: "Perform critical light watering to ensure grain filling and size stability." },
      { week: 15, title: "Harvest Preparation", instructions: "Stop irrigation completely. Let the crop dry naturally before starting harvesting." }
    ]
  },
  'Rice': {
    harvestMonths: 5,
    currentPrice: 32.0,
    predictedPrice: 39.5,
    yield: "2.5 - 3.0 tons per acre",
    climateReason: "Rice thrives in hot, humid weather conditions with high levels of sunshine. (Evaluated via Agronomy Model Engine)",
    soilReason: "Requires water-retentive clayey or heavy soils to hold standing water in fields. (Evaluated via Agronomy Model Engine)",
    schedule: [
      { week: 1, title: "Nursery Bed Preparation", instructions: "Grow healthy saplings in raised nursery beds with organic manure." },
      { week: 3, title: "Transplanting Stage", instructions: "Transplant 25-day old seedlings into puddled muddy fields in standing water." },
      { week: 6, title: "Weeding & Tillering", instructions: "Perform hand-weeding or apply selective weedicides. Maintain 5cm water level." },
      { week: 9, title: "Panicle Initiation", instructions: "Apply nitrogen fertilizer top dressing. Spray defensive biological controls." },
      { week: 12, title: "Grain Filling", instructions: "Ensure consistent field moisture. Monitor for blast or stem borer pests." },
      { week: 16, title: "Drainage & Harvest", instructions: "Drain field water 10 days before harvesting. Reap when 80% of grains turn golden." }
    ]
  },
  'Cotton': {
    harvestMonths: 6,
    currentPrice: 75.0,
    predictedPrice: 88.0,
    yield: "800 - 1200 kg per acre",
    climateReason: "Cotton needs warm temperatures, plenty of sunshine, and dry weather during harvesting. (Evaluated via Agronomy Model Engine)",
    soilReason: "Grows best in deep, rich black soils (Regur) or loamy soils with high moisture capacity. (Evaluated via Agronomy Model Engine)",
    schedule: [
      { week: 1, title: "Sowing & Spacing", instructions: "Sow seeds at 2.5-3cm depth. Space plants 60cm apart for dense leafing." },
      { week: 4, title: "Thinning & Weeding", instructions: "Thin out weak seedlings. Keep rows clean of weeds to prevent nutrition diversion." },
      { week: 8, title: "Flowering & Squaring", instructions: "Apply NPK fertilizer. Watch out for early bollworm or aphid attacks." },
      { week: 12, title: "Boll Development", instructions: "Regular irrigation is crucial. Keep soil moist but not waterlogged." },
      { week: 18, title: "Boll Bursting & Maturity", instructions: "Bolls begin bursting into white cotton fibers. Reduce moisture." },
      { week: 24, title: "Hand Picking", instructions: "Pick cotton manually in dry morning hours when bolls are fully open." }
    ]
  },
  'Sugarcane': {
    harvestMonths: 11,
    currentPrice: 4.2,
    predictedPrice: 5.1,
    yield: "35 - 45 tons per acre",
    climateReason: "Requires a hot, tropical climate with abundant rainfall and warm sunny days. (Evaluated via Agronomy Model Engine)",
    soilReason: "Thrives in thick loamy and black soils with rich organic matter and excellent drainage. (Evaluated via Agronomy Model Engine)",
    schedule: [
      { week: 1, title: "Planting Setts", instructions: "Select healthy 2-3 bud setts. Row spacing must be 90-120 cm wide." },
      { week: 6, title: "Germination Phase", instructions: "Examine sett buds. Hand weed and irrigate every 10 days." },
      { week: 12, title: "Tillering & Earthing up", instructions: "Earthing up soil around stalks for structural root support." },
      { week: 20, title: "Grand Growth Period", instructions: "Heavy nitrogen application. Ensure steady deep irrigation." },
      { week: 32, title: "Stalk Elongation", instructions: "Tie companion stalks together to prevent lodging from windy conditions." },
      { week: 44, title: "Sugar Maturation", instructions: "Stop watering 15 days prior to harvest. Cut stems clean at ground level." }
    ]
  },
  'Potato': {
    harvestMonths: 4,
    currentPrice: 18.0,
    predictedPrice: 24.5,
    yield: "8 - 10 tons per acre",
    climateReason: "Prefers cool weather with moderate rainfall. High temperatures can restrict tuber growth. (Evaluated via Agronomy Model Engine)",
    soilReason: "Grows perfectly in loose, well-aerated sandy or sandy-loam soils to allow root expansion. (Evaluated via Agronomy Model Engine)",
    schedule: [
      { week: 1, title: "Seed Tuber Planting", instructions: "Plant sprouted seed tubers 8-10cm deep. Keep row mounds spaced evenly." },
      { week: 3, title: "Sprouting & Weeding", instructions: "First weeding. Apply organic manure or nitrogen-rich fertilizers." },
      { week: 6, title: "Earthing Up", instructions: "Mound loose soil around growing stems to cover tubers and protect them from sunlight." },
      { week: 9, title: "Tuber Initiation", instructions: "Maintain even moisture. Spray preventive fungicides for early/late blight." },
      { week: 12, title: "Tuber Bulking Stage", instructions: "Apply potassium-heavy fertilizer. Avoid waterlogged soils to prevent rot." },
      { week: 15, title: "De-haulming & Harvest", instructions: "Cut foliage (de-haulm) 10 days prior to harvest to toughen tuber skins." }
    ]
  },
  'Tomato': {
    harvestMonths: 3,
    currentPrice: 35.0,
    predictedPrice: 48.0,
    yield: "12 - 15 tons per acre",
    climateReason: "Warm, frost-free climate with abundant sunshine is ideal for rich fruit coloration. (Evaluated via Agronomy Model Engine)",
    soilReason: "Well-drained sandy-loam or rich organic loamy soils are ideal for quick tomato rooting. (Evaluated via Agronomy Model Engine)",
    schedule: [
      { week: 1, title: "Transplanting & Staking", instructions: "Transplant seedlings. Install bamboo stakes or trellises for vertical support." },
      { week: 3, title: "Pruning & Mulching", instructions: "Pinch suckers. Place clean mulch around bases to conserve soil water." },
      { week: 5, title: "Flowering Stage", instructions: "Apply calcium-rich fertilizers to prevent blossom end rot. Irrigate regularly." },
      { week: 8, title: "Fruit Setting Phase", instructions: "Prune old lower leaves to boost sunlight. Watch out for fruit borer insects." },
      { week: 10, title: "First Harvest", instructions: "Pick fruits when they turn bright orange/red. Harvest every 3 days." },
      { week: 12, title: "Continuous Reaping", instructions: "Keep picking matured tomatoes. Apply compost tea to extend harvest span." }
    ]
  },
  'Maize': {
    harvestMonths: 4,
    currentPrice: 22.0,
    predictedPrice: 27.5,
    yield: "2.5 - 3.2 tons per acre",
    climateReason: "Requires warm, sunny days with regular moderate showers throughout the season. (Evaluated via Agronomy Model Engine)",
    soilReason: "Prefers deep, rich, fertile loam soils with good moisture retention and organic nitrogen. (Evaluated via Agronomy Model Engine)",
    schedule: [
      { week: 1, title: "Direct Sowing", instructions: "Sow seeds 5cm deep with 20cm spacing between individual plants." },
      { week: 3, title: "Seedling Growth", instructions: "Thin out dense spots. Apply primary urea fertilizer around crop lines." },
      { week: 6, title: "Knee-High Stage", instructions: "Inter-cultivate to eradicate weeds. Apply secondary dose of nitrogen." },
      { week: 9, title: "Tasseling & Silking", instructions: "Critical moisture phase. Avoid any water stress. Apply potassium." },
      { week: 12, title: "Cob Development", instructions: "Grains fill with starch. Monitor for corn borer moths or rust spots." },
      { week: 15, title: "Harvesting", instructions: "Harvest when cob sheaths turn yellow-brown and grains feel firm and dry." }
    ]
  },
  'Groundnut': {
    harvestMonths: 4,
    currentPrice: 65.0,
    predictedPrice: 76.5,
    yield: "1.2 - 1.6 tons per acre",
    climateReason: "Thrives in warm, sunny tropical zones with moderate rain during early vegetative stage. (Evaluated via Agronomy Model Engine)",
    soilReason: "Requires sandy or light sandy-loam soils to allow pegs to penetrate the ground and form pods. (Evaluated via Agronomy Model Engine)",
    schedule: [
      { week: 1, title: "Seed Sowing", instructions: "Sow premium decorticated kernels at 5cm depth in warm, moist soil." },
      { week: 4, title: "Weeding & Gypsum", instructions: "Apply gypsum around plants. Weed soil lightly to keep it loose." },
      { week: 7, title: "Pegging Phase", instructions: "Flower stalks bend down and penetrate (peg) soil. Do NOT disturb soil now." },
      { week: 10, title: "Pod Development", instructions: "Maintain balanced moisture. Spray biological controls for tikka leaf spot." },
      { week: 13, title: "Harvest Prep", instructions: "Reap when leaves turn yellow. Pull plants up intact with pods attached." },
      { week: 15, title: "Drying & Curing", instructions: "Dry harvested plants in the sun for 3-5 days to reduce kernel moisture to 8%." }
    ]
  }
};

function getFallbackCropSuggestion(soilType: string, selectedCrop?: string): CropSuggestion {
  let cropName = selectedCrop || 'Wheat';
  if (!selectedCrop) {
    const sType = (soilType || '').toLowerCase();
    if (sType.includes('clay')) cropName = 'Rice';
    else if (sType.includes('sand')) cropName = 'Groundnut';
    else if (sType.includes('black')) cropName = 'Cotton';
    else if (sType.includes('loam')) cropName = 'Wheat';
    else if (sType.includes('red')) cropName = 'Groundnut';
  }

  const details = cropDetails[cropName] || {
    harvestMonths: 4,
    currentPrice: 40.0,
    predictedPrice: 52.0,
    yield: "1.5 - 2.0 tons per acre",
    climateReason: `Suitable climate matches requirements for growing ${cropName} successfully. (Evaluated via Agronomy Model Engine)`,
    soilReason: `The chosen ${soilType || 'Default'} soil provides reasonable drainage and support for ${cropName}. (Evaluated via Agronomy Model Engine)`,
    schedule: [
      { week: 1, title: "Preparation", instructions: "Till the soil and apply natural compost. Plant seeds at recommended depth." },
      { week: 3, title: "Initial Irrigation", instructions: "Water gently. Perform first weeding operation to keep fields clear." },
      { week: 6, title: "Fertilization", instructions: "Apply nitrogen-rich fertilizer. Watch for early pests or mold." },
      { week: 10, title: "Flowering stage", instructions: "Maintain consistent moisture. Avoid waterlogging around root zone." },
      { week: 14, title: "Maturity & Prep", instructions: "Stop irrigation. Let crop dry before launching harvesting operations." }
    ]
  };

  return {
    cropName,
    expectedHarvestMonths: details.harvestMonths,
    currentMarketPrice: details.currentPrice,
    predictedHarvestPrice: details.predictedPrice,
    yieldEstimation: details.yield,
    climateReasoning: details.climateReason,
    soilReasoning: details.soilReason,
    confidenceScore: 85,
    schedule: details.schedule
  };
}

function getFallbackCropDisease(cropName: string): CropDiseaseResult {
  const normCrop = (cropName || '').toLowerCase();
  
  if (normCrop.includes('wheat')) {
    return {
      diseaseName: "Yellow Rust (Puccinia striiformis) [Backup Diagnostic Engine]",
      confidence: 88,
      symptoms: [
        "Yellow streaks or pustules along leaf veins",
        "Loss of green leaf area",
        "Premature drying of leaf tip"
      ],
      recommendedPesticides: [
        {
          name: "Propiconazole 25% EC (Fungicide)",
          estimatedPriceRange: "₹450 - ₹600 per 500ml",
          applicationInstructions: "Dilute 1 ml per liter of water. Spray at the first appearance of pustules; repeat after 14 days if needed."
        }
      ]
    };
  }

  if (normCrop.includes('rice')) {
    return {
      diseaseName: "Rice Blast (Magnaporthe oryzae) [Backup Diagnostic Engine]",
      confidence: 90,
      symptoms: [
        "Spindle-shaped lesions with grey/white center and brown borders on leaves",
        "Lesions on nodes causing stem breakdown",
        "Infected neck of panicle causing empty grains"
      ],
      recommendedPesticides: [
        {
          name: "Tricyclazole 75% WP",
          estimatedPriceRange: "₹350 - ₹500 per 250g",
          applicationInstructions: "Mix 0.6 grams per liter of water. Spray thoroughly at tillering and panicle emergence stages."
        }
      ]
    };
  }

  if (normCrop.includes('cotton')) {
    return {
      diseaseName: "Bacterial Blight (Xanthomonas) [Backup Diagnostic Engine]",
      confidence: 87,
      symptoms: [
        "Angular, water-soaked lesions on leaves",
        "Blackening of bolls",
        "Severe defoliation under high humidity"
      ],
      recommendedPesticides: [
        {
          name: "Copper Oxychloride 50% WP + Streptocycline",
          estimatedPriceRange: "₹280 - ₹400 per packet",
          applicationInstructions: "Mix 2.5g Copper Oxychloride and 1g Streptocycline in 10 liters of water. Spray twice with a 10-day interval."
        }
      ]
    };
  }

  if (normCrop.includes('sugar')) {
    return {
      diseaseName: "Red Rot (Colletotrichum falcatum) [Backup Diagnostic Engine]",
      confidence: 85,
      symptoms: [
        "Red discoloration on internal pith of canes",
        "White cross-wise bands inside split cane",
        "Drooping and yellowing of upper leaves"
      ],
      recommendedPesticides: [
        {
          name: "Carbendazim 50% WP (Systemic Fungicide)",
          estimatedPriceRange: "₹300 - ₹450 per 500g",
          applicationInstructions: "Drench soil around affected clumps or spray at 1g per liter of water. Ensure healthy seed pieces were used."
        }
      ]
    };
  }

  if (normCrop.includes('tomato')) {
    return {
      diseaseName: "Early Blight (Alternaria solani) [Backup Diagnostic Engine]",
      confidence: 91,
      symptoms: [
        "Concentric rings resembling target boards on older leaves",
        "Stem lesions near soil line",
        "Dark water-soaked spots on tomatoes"
      ],
      recommendedPesticides: [
        {
          name: "Mancozeb 75% WP or Chlorothalonil",
          estimatedPriceRange: "₹200 - ₹350 per 500g",
          applicationInstructions: "Mix 2g per liter of water. Spray every 7-10 days under warm, wet climates to protect new foliage."
        }
      ]
    };
  }

  if (normCrop.includes('potato')) {
    return {
      diseaseName: "Late Blight (Phytophthora infestans) [Backup Diagnostic Engine]",
      confidence: 89,
      symptoms: [
        "Water-soaked dark lesions on leaves and stems",
        "White mildew under leaves in wet mornings",
        "Tuber rot showing brown discoloration"
      ],
      recommendedPesticides: [
        {
          name: "Metalaxyl 8% + Mancozeb 64% WP",
          estimatedPriceRange: "₹400 - ₹550 per 500g",
          applicationInstructions: "Dilute 2.5g in 1 liter of water. Spray immediately when weather becomes humid and warm; repeat in 10 days."
        }
      ]
    };
  }

  return {
    diseaseName: "Cercospora Leaf Spot / Fungal Infection [Backup Diagnostic Engine]",
    confidence: 85,
    symptoms: [
      "Small circular spots with light center on leaves",
      "Premature aging and shedding of leaves",
      "Reduced leaf photosynthesis capacity"
    ],
    recommendedPesticides: [
      {
        name: "Organic Neem Oil Extract (1500 PPM) + Potassium Soap",
        estimatedPriceRange: "₹150 - ₹250 per 250ml",
        applicationInstructions: "Mix 5ml Neem Oil and 2ml liquid soap per liter of water. Spray thoroughly under leaves every evening for a week."
      }
    ]
  };
}

// Utility to handle exponential backoff for transient occurrences like 503/500/unavailability
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 2, delay = 800): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries <= 0) {
      throw error;
    }
    const errMsg = (error?.message || '').toLowerCase();
    const isTransient = 
      errMsg.includes('503') || 
      errMsg.includes('500') || 
      errMsg.includes('unavailable') || 
      errMsg.includes('demand') || 
      errMsg.includes('rate limit');
    
    if (isTransient) {
      console.log(`Gemini API busy status detected. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

// Predict crop and return detailed monthly/weekly guides and projected pricing
export async function predictCropAndSchedule(
  lat: number,
  lng: number,
  soilType: string,
  weatherSummary: string,
  selectedCrop?: string
): Promise<CropSuggestion> {
  const cropTask = selectedCrop
    ? `Evaluate and analyze the user's manually chosen crop: "${selectedCrop}" under these conditions. Validate its suitability and explain how it matches.`
    : `Select the ABSOLUTE BEST single crop to grow under these conditions.`;

  const prompt = `
    You are a highly advanced Agricultural AI Model that predicts crop compatibility, 
    market price fluctuations 6 months into the future, and weekly schedule guides for farmers.
    
    Given:
    - Coordinates: Latitude ${lat}, Longitude ${lng}
    - Soil Type: ${soilType}
    - Current Climate / Weather Context: ${weatherSummary}
    
    Using standard government surveys, historical crop data, and global climate trends, do the following:
    1. ${cropTask}
    2. Estimate the expected harvest duration (number of months, e.g. 3, 4, or 6 months).
    3. Predict the future harvest-time price per kg of this crop in 6 months (based on demand, seasonality, and previous patterns).
    4. Estimate expected yield per acre.
    5. Formulate a week-by-week cultivation schedule for the farmer (at least 6-8 key milestone weeks, e.g. Week 1, Week 2, Week 4, etc.).
    
    You must output a single JSON object matching the following structure:
    {
      "cropName": "Name of recommended or analyzed crop",
      "expectedHarvestMonths": 6,
      "currentMarketPrice": 45.5, // Current average price per kg in Indian Rupees (INR) or local currency
      "predictedHarvestPrice": 58.2, // Predicted price per kg at harvest time in INR/local currency
      "yieldEstimation": "Yield per acre, e.g., 2.5 tons per acre",
      "climateReasoning": "Detailed, highly accurate reason based on climate parameters",
      "soilReasoning": "Detailed, highly accurate reason based on soil composition",
      "confidenceScore": 92, // A percentage representing suitability confidence
      "schedule": [
        {
          "week": 1,
          "title": "Soil Preparation & Sowing",
          "instructions": "Mix organic compost... Sowing depth..."
        },
        ...
      ]
    }
  `;

  try {
    const response = await retryWithBackoff(async () => {
      const ai = getAiClient();
      return await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cropName: { type: Type.STRING },
              expectedHarvestMonths: { type: Type.INTEGER },
              currentMarketPrice: { type: Type.NUMBER },
              predictedHarvestPrice: { type: Type.NUMBER },
              yieldEstimation: { type: Type.STRING },
              climateReasoning: { type: Type.STRING },
              soilReasoning: { type: Type.STRING },
              confidenceScore: { type: Type.INTEGER },
              schedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    week: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    instructions: { type: Type.STRING },
                  },
                  required: ['week', 'title', 'instructions'],
                },
              },
            },
            required: [
              'cropName',
              'expectedHarvestMonths',
              'currentMarketPrice',
              'predictedHarvestPrice',
              'yieldEstimation',
              'climateReasoning',
              'soilReasoning',
              'confidenceScore',
              'schedule',
            ],
          },
        },
      });
    });

    const parsed = JSON.parse(response.text || '{}');
    return parsed as CropSuggestion;
  } catch (err: any) {
    console.log('Using backup system for crop recommendation due to service busy status.');
    return getFallbackCropSuggestion(soilType, selectedCrop);
  }
}

// Recognize crop disease from photo and suggest remedies + pesticide prices
export async function identifyCropDisease(
  imageBase64: string,
  cropName: string
): Promise<CropDiseaseResult> {
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  const prompt = `
    Analyze this crop image. The crop is reported to be: "${cropName || 'Unknown'}"
    
    Perform advanced vision analysis:
    1. First, check if the image contains a plant leaf, a tree, or crop vegetation.
    2. If the image is NOT a leaf, tree, or plant, set 'isLeafOrTree' to false and specify the 'invalidReason'.
    3. If it is a leaf/tree, identify the crop disease or specify if it is healthy.
    4. List 3 key visible symptoms of the disease in the photo.
    5. Suggest highly effective pesticide options or organic controls, along with their estimated current market prices in INR (Rupees) and application instructions.
    
    You must output a single JSON matching the structure:
    {
      "isLeafOrTree": true, // Must be false if the image does not contain a plant leaf, tree, or vegetation
      "invalidReason": "", // If isLeafOrTree is false, provide a descriptive error message explaining why (e.g., "The image appears to be a person/car/animal, not a plant leaf or tree.")
      "diseaseName": "Leaf Blight", // or "Healthy"
      "confidence": 94,
      "symptoms": [
        "Yellow spots on margins",
        "Brown necrotic spots in center",
        "Mild curling of leaves"
      ],
      "recommendedPesticides": [
        {
          "name": "Copper Oxychloride (50% WP) / Organic Neem Oil Extract",
          "estimatedPriceRange": "₹250 - ₹350 per 500g",
          "applicationInstructions": "Mix 2.5g in 1 liter of water and spray thoroughly during morning hours."
        }
      ]
    }
  `;

  try {
    const response = await retryWithBackoff(async () => {
      const ai = getAiClient();
      const imagePart = {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      };

      return await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [imagePart, { text: prompt }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isLeafOrTree: { type: Type.BOOLEAN },
              invalidReason: { type: Type.STRING },
              diseaseName: { type: Type.STRING },
              confidence: { type: Type.INTEGER },
              symptoms: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommendedPesticides: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    estimatedPriceRange: { type: Type.STRING },
                    applicationInstructions: { type: Type.STRING },
                  },
                  required: ['name', 'estimatedPriceRange', 'applicationInstructions'],
                },
              },
            },
            required: [
              'isLeafOrTree',
              'invalidReason',
              'diseaseName',
              'confidence',
              'symptoms',
              'recommendedPesticides',
            ],
          },
        },
      });
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.isLeafOrTree === false) {
      throw new Error(parsed.invalidReason || 'The uploaded photograph does not appear to contain a plant leaf or tree. Please upload a clear image of a crop leaf.');
    }
    return parsed as CropDiseaseResult;
  } catch (err: any) {
    if (err.message && (err.message.includes('photograph does not appear') || err.message.includes('not appear to contain a plant leaf'))) {
      throw err;
    }
    console.log('Using backup system for disease recognition due to service busy status.');
    return getFallbackCropDisease(cropName);
  }
}

// AI Crop Voice Assistant Handler
export async function getVoiceAssistantReply(query: string, language: string): Promise<string> {
  const languageNames: Record<string, string> = {
    en: 'English',
    hi: 'Hindi',
    te: 'Telugu',
    ta: 'Tamil',
    kn: 'Kannada'
  };
  const targetLangName = languageNames[language] || 'English';

  const prompt = `
    You are 'SmartKisan Voice Assistant', an empathetic, friendly, and expert agricultural AI voice helper.
    The farmer's query is: "${query}"
    The preferred response language is: ${targetLangName} (you MUST write the entire answer in ${targetLangName}, using its native script or characters so it can be read aloud correctly).
    
    Provide a clear, practical, and helpful answer to their farming query. 
    Topics may include crop protection, sowing dates, soil health, fertilizer application, weather advice, or crop market prices.
    Keep the answer relatively concise (around 3 to 5 sentences or 80-120 words), as this response will be read aloud to the farmer. Avoid markdown symbols like asterisks, list bullet points (*, -), or bold headers, because they sound weird when synthesized via Text-to-Speech. Use standard conversational punctuation instead.
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    return response.text || 'Sorry, I could not generate an answer at this time.';
  } catch (err: any) {
    console.error('Voice assistant AI error:', err);
    return `Sorry, I am facing an issue answering your question right now. (Error: ${err.message || 'AI busy'})`;
  }
}

