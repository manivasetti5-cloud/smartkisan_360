export type SupportedLanguage = 'en' | 'hi' | 'te' | 'ta' | 'kn';

export interface TranslationDict {
  appName: string;
  farmerPortal: string;
  customerPortal: string;
  dealerPortal: string;
  welcome: string;
  logout: string;
  editProfile: string;
  detectGps: string;
  soilType: string;
  currentAddress: string;
  
  // Navigation tabs (Farmer)
  tabRecommender: string;
  tabDisease: string;
  tabWeather: string;
  tabSell: string;
  
  // Crop Recommend Page
  recommendTitle: string;
  recommendDesc: string;
  buttonAnalyze: string;
  analyzingText: string;
  chooseSoilLabel: string;
  selectedCropLabel: string;
  autoSelectBest: string;
  recommendationResult: string;
  harvestDuration: string;
  months: string;
  yieldPerAcre: string;
  liveGovernmentIndex: string;
  predictedFuturePrice: string;
  suitabilityScore: string;
  climateMatch: string;
  soilMatch: string;
  weeklySchedule: string;
  week: string;

  // Crop Disease Page
  diseaseTitle: string;
  diseaseDesc: string;
  uploadPhotoLabel: string;
  identifyingDiseaseText: string;
  symptomsDetected: string;
  remedialMeasures: string;
  estimatedPrice: string;
  applicationInstructions: string;

  // Weather and Advice Page
  weatherTitle: string;
  weatherDesc: string;
  currentTemp: string;
  humidity: string;
  windSpeed: string;
  windDirection: string;
  advisoryTitle: string;

  // Marketplace Selling Page
  marketplaceTitle: string;
  marketplaceDesc: string;
  publishSuccess: string;
  cropHarvest: string;
  quantityKg: string;
  customerPrice: string;
  dealerPrice: string;
  optionalDescription: string;
  buttonPublishListing: string;
  activeListings: string;
  retractListing: string;
  confirmRetract: string;
  noListings: string;
  editListing: string;
  saveChanges: string;
  cancelEdit: string;

  // Voice Assistant
  assistantTitle: string;
  assistantDesc: string;
  assistantPlaceholder: string;
  assistantListening: string;
  assistantTapToSpeak: string;
  assistantSpeakAnswer: string;
  assistantStopSpeaking: string;
}

export const translations: Record<SupportedLanguage, TranslationDict> = {
  en: {
    appName: "SmartKisan 360",
    farmerPortal: "Farmer Portal",
    customerPortal: "User Market",
    dealerPortal: "Dealer Portal",
    welcome: "Welcome",
    logout: "Log Out",
    editProfile: "Edit Profile",
    detectGps: "Detect My GPS",
    soilType: "Soil Type",
    currentAddress: "Current Address",
    
    tabRecommender: "Crop Recommendation",
    tabDisease: "Disease Detection",
    tabWeather: "Weather & Advisory",
    tabSell: "Direct Selling",
    
    recommendTitle: "Agricultural Crop Recommender",
    recommendDesc: "Leverage advanced AI modeling to find the absolute most profitable crop for your unique soil, location coordinates, and local climate pattern.",
    buttonAnalyze: "Predict Best Crop & Future Yield",
    analyzingText: "AI Model is analyzing climate patterns and forecasting market indices...",
    chooseSoilLabel: "Your Current Soil Profile",
    selectedCropLabel: "Analyze Specific Crop (Optional)",
    autoSelectBest: "Let AI recommend the absolute best crop",
    recommendationResult: "AI Predictive Recommendation",
    harvestDuration: "Expected Harvest Duration",
    months: "months",
    yieldPerAcre: "Predicted Yield Estimation",
    liveGovernmentIndex: "Live Government Index Price",
    predictedFuturePrice: "AI Predicted Harvest-Time Price",
    suitabilityScore: "Climatic Confidence Score",
    climateMatch: "Climatic Compatibility",
    soilMatch: "Soil Suitability Profile",
    weeklySchedule: "Dynamic Cultivation & Scheduling Guide",
    week: "Week",

    diseaseTitle: "AI Plant Pathologist & Diagnostic Vision",
    diseaseDesc: "Upload a photo of your infected crop leaves. Our vision model will instantly diagnose the disease and estimate current pesticide market pricing.",
    uploadPhotoLabel: "Select or Drop infected crop leaf photo...",
    identifyingDiseaseText: "AI plant pathologist is analyzing leaf patterns...",
    symptomsDetected: "Identified Visible Symptoms",
    remedialMeasures: "Recommended Remedies & Pesticides",
    estimatedPrice: "Estimated Cost",
    applicationInstructions: "Application Instructions",

    weatherTitle: "Micro-Climate Meteorological Forecast",
    weatherDesc: "Live real-time weather parameters and smart agricultural recommendations tailored specifically for your geographic coordinates.",
    currentTemp: "Current Temperature",
    humidity: "Atmospheric Humidity",
    windSpeed: "Wind Speed",
    windDirection: "Wind Direction",
    advisoryTitle: "AI Smart Cultivation Advisory",

    marketplaceTitle: "Direct Selling Radius Marketplace",
    marketplaceDesc: "Post crop quantities directly to consumers and bulk dealers in your local area. You set your own prices dynamically based on the current live government index benchmarks!",
    publishSuccess: "Your harvest item listing has been successfully published for buyers!",
    cropHarvest: "Crop Harvest",
    quantityKg: "Quantity (kg)",
    customerPrice: "Customer Price (per kg)",
    dealerPrice: "Dealer Price (per kg)",
    optionalDescription: "Optional Description / Quality standard",
    buttonPublishListing: "Publish Harvest Listing",
    activeListings: "Your Active Marketplace Listings",
    retractListing: "Retract Listing",
    confirmRetract: "Are you sure you want to retract this crop listing from the local market?",
    noListings: "No active marketplace listings found. Publish your harvest above to connect with local buyers!",
    editListing: "Edit Listing",
    saveChanges: "Save",
    cancelEdit: "Cancel",

    assistantTitle: "AI Crop Voice Assistant",
    assistantDesc: "Tap the mic to speak or type any question about your crops, weather, sowing schedules, or marketplace selling rules.",
    assistantPlaceholder: "Type or ask me anything about your farming...",
    assistantListening: "Listening... speak now",
    assistantTapToSpeak: "Speak to Assistant",
    assistantSpeakAnswer: "Listen",
    assistantStopSpeaking: "Stop"
  },
  hi: {
    appName: "स्मार्टकिसान 360",
    farmerPortal: "किसान पोर्टल",
    customerPortal: "ग्राहक बाज़ार",
    dealerPortal: "डीलर पोर्टल",
    welcome: "स्वागत है",
    logout: "लॉग आउट",
    editProfile: "प्रोफ़ाइल संपादित करें",
    detectGps: "मेरा जीपीएस खोजें",
    soilType: "मिट्टी का प्रकार",
    currentAddress: "वर्तमान पता",
    
    tabRecommender: "फसल सिफ़ारिश",
    tabDisease: "रोग की पहचान",
    tabWeather: "मौसम और सलाह",
    tabSell: "सीधी बिक्री",
    
    recommendTitle: "कृषि फसल सिफ़ारिशकर्ता",
    recommendDesc: "अपनी अनूठी मिट्टी, स्थान निर्देशांक और स्थानीय जलवायु पैटर्न के लिए सबसे अधिक लाभदायक फसल खोजने के लिए उन्नत एआई का लाभ उठाएं।",
    buttonAnalyze: "सर्वोत्तम फसल और भविष्य की उपज का अनुमान लगाएं",
    analyzingText: "एआई मॉडल जलवायु पैटर्न का विश्लेषण कर रहा है और बाजार सूचकांकों का पूर्वानुमान लगा रहा है...",
    chooseSoilLabel: "आपकी वर्तमान मिट्टी का प्रोफ़ाइल",
    selectedCropLabel: "विशिष्ट फसल का विश्लेषण करें (वैकल्पिक)",
    autoSelectBest: "एआई को बिल्कुल सर्वोत्तम फसल की सिफारिश करने दें",
    recommendationResult: "एआई भविष्य कहनेवाला सिफ़ारिश",
    harvestDuration: "अपेक्षित फसल अवधि",
    months: "महीने",
    yieldPerAcre: "अनुमानित उपज का अनुमान",
    liveGovernmentIndex: "लाइव सरकारी सूचकांक मूल्य",
    predictedFuturePrice: "एआई अनुमानित फसल समय मूल्य",
    suitabilityScore: "जलवायु आत्मविश्वास स्कोर",
    climateMatch: "जलवायु अनुकूलता",
    soilMatch: "मिट्टी उपयुक्तता प्रोफ़ाइल",
    weeklySchedule: "गतिशील खेती और शेड्यूलिंग गाइड",
    week: "सप्ताह",

    diseaseTitle: "एआई पादप रोगविज्ञानी और नैदानिक ​​दृष्टि",
    diseaseDesc: "अपनी संक्रमित फसल की पत्तियों की एक तस्वीर अपलोड करें। हमारा विज़न मॉडल तुरंत बीमारी का निदान करेगा और कीटनाशकों के मूल्यों का अनुमान लगाएगा।",
    uploadPhotoLabel: "संक्रमित फसल के पत्ते का फोटो चुनें या छोड़ें...",
    identifyingDiseaseText: "एआई पादप रोगविज्ञानी पत्ती के पैटर्न का विश्लेषण कर रहा है...",
    symptomsDetected: "पहचाने गए दृश्य लक्षण",
    remedialMeasures: "अनुशंसित उपचार और कीटनाशक",
    estimatedPrice: "अनुमानित लागत",
    applicationInstructions: "उपयोग के निर्देश",

    weatherTitle: "सूक्ष्म-जलवायु मौसम पूर्वानुमान",
    weatherDesc: "आपके भौगोलिक निर्देशांकों के लिए विशेष रूप से तैयार किए गए लाइव रीयल-टाइम मौसम पैरामीटर और स्मार्ट कृषि सिफ़ारिशें।",
    currentTemp: "वर्तमान तापमान",
    humidity: "वायुमंडलीय आर्द्रता",
    windSpeed: "हवा की गति",
    windDirection: "हवा की दिशा",
    advisoryTitle: "एआई स्मार्ट खेती सलाह",

    marketplaceTitle: "प्रत्यक्ष बिक्री त्रिज्या बाज़ार",
    marketplaceDesc: "अपने स्थानीय क्षेत्र में उपभोक्ताओं और थोक डीलरों को सीधे फसल की मात्रा पोस्ट करें। आप वर्तमान लाइव सरकारी सूचकांक बेंचमार्क के आधार पर अपनी कीमतें तय करते हैं!",
    publishSuccess: "आपकी फसल प्रविष्टि सफलतापूर्वक खरीदारों के लिए प्रकाशित हो गई है!",
    cropHarvest: "फसल की उपज",
    quantityKg: "मात्रा (किलोग्राम)",
    customerPrice: "ग्राहक मूल्य (प्रति किलोग्राम)",
    dealerPrice: "डीलर मूल्य (प्रति किलोग्राम)",
    optionalDescription: "वैकल्पिक विवरण / गुणवत्ता मानक",
    buttonPublishListing: "फसल प्रविष्टि प्रकाशित करें",
    activeListings: "आपकी सक्रिय बाजार प्रविष्टियां",
    retractListing: "प्रविष्टि वापस लें",
    confirmRetract: "क्या आप वाकई स्थानीय बाजार से इस फसल प्रविष्टि को वापस लेना चाहते हैं?",
    noListings: "कोई सक्रिय बाज़ार प्रविष्टि नहीं मिली। स्थानीय खरीदारों से जुड़ने के लिए ऊपर अपनी फसल प्रविष्टि प्रकाशित करें!",
    editListing: "प्रविष्टि संपादित करें",
    saveChanges: "सुरक्षित करें",
    cancelEdit: "रद्द करें",

    assistantTitle: "एआई फसल वॉयस असिस्टेंट",
    assistantDesc: "अपनी फसलों, मौसम, बुवाई के समय, या बाजार बिक्री नियमों के बारे में कोई भी प्रश्न बोलने या टाइप करने के लिए माइक पर टैप करें।",
    assistantPlaceholder: "अपनी खेती के बारे में मुझसे कुछ भी पूछें या टाइप करें...",
    assistantListening: "सुन रहा हूँ... अब बोलें",
    assistantTapToSpeak: "असिस्टेंट से बोलें",
    assistantSpeakAnswer: "सुनें",
    assistantStopSpeaking: "रोकें"
  },
  te: {
    appName: "స్మార్ట్ కిసాన్ 360",
    farmerPortal: "రైతు పోర్టల్",
    customerPortal: "వినియోగదారుల మార్కెట్",
    dealerPortal: "డీలర్ పోర్టల్",
    welcome: "స్వాగతం",
    logout: "లాగ్ అవుట్",
    editProfile: "ప్రొఫైల్ సవరించండి",
    detectGps: "నా జీపీఎస్ గుర్తించు",
    soilType: "నేల రకం",
    currentAddress: "ప్రస్తుత చిరునామా",
    
    tabRecommender: "పంట సిఫార్సు",
    tabDisease: "తెగుళ్ల గుర్తింపు",
    tabWeather: "వాతావరణం & సలహాలు",
    tabSell: "నేరుగా విక్రయించడం",
    
    recommendTitle: "వ్యవసాయ పంట సిఫార్సుదారు",
    recommendDesc: "మీ నేల రకం, భౌగోళిక అక్షాంశాలు మరియు స్థానిక వాతావరణ పరిస్థితులకు సరిపోయే అత్యంత లాభదాయకమైన పంటను కనుగొనడానికి అధునాతన AI సిఫార్సులను ఉపయోగించండి.",
    buttonAnalyze: "ఉత్తమ పంట & భవిష్యత్తు దిగుబడిని అంచనా వేయండి",
    analyzingText: "AI మోడల్ వాతావరణ పరిస్థితులను విశ్లేషిస్తోంది మరియు మార్కెట్ ధరలను అంచనా వేస్తోంది...",
    chooseSoilLabel: "మీ ప్రస్తుత నేల ప్రొఫైల్",
    selectedCropLabel: "నిర్దిష్ట పంటను విశ్లేషించండి (ఐచ్ఛికం)",
    autoSelectBest: "AI ని ఉత్తమ పంటను సిఫార్సు చేయనివ్వండి",
    recommendationResult: "AI అంచనా సిఫార్సు",
    harvestDuration: "ఆశించిన పంట కాలం",
    months: "నెలలు",
    yieldPerAcre: "అంచనా వేసిన పంట దిగుబడి",
    liveGovernmentIndex: "ప్రభుత్వ మార్కెట్ ధర ఇండెక్స్",
    predictedFuturePrice: "AI అంచనా వేసిన పంట కాలపు ధర",
    suitabilityScore: "వాతావरण సరిపోలిక స్కోరు",
    climateMatch: "వాతావరణ అనుకూలత",
    soilMatch: "నేల అనుకూలత ప్రొఫైల్",
    weeklySchedule: "వారాల వారీ సాగు ప్రణాళిక గైడ్",
    week: "వారం",

    diseaseTitle: "AI ప్లాంట్ పాథాలజిస్ట్ & డయాగ్నస్టిక్ విజన్",
    diseaseDesc: "వ్యాధి సోకిన పంట ఆకుల ఫోటోను అప్‌లోడ్ చేయండి. మా విజన్ మోడల్ తక్షణమే తెగులును గుర్తించి తగిన మందులు మరియు మార్కెట్ ధరలను సూచిస్తుంది.",
    uploadPhotoLabel: "వ్యాధి సోకిన పంట ఆకు ఫోటోను ఎంచుకోండి లేదా ఇక్కడ లాగండి...",
    identifyingDiseaseText: "AI ప్లాంట్ పాథాలజిస్ట్ ఆకు నమూనాలను విశ్లేషిస్తున్నారు...",
    symptomsDetected: "గుర్తించిన తెగులు లక్షణాలు",
    remedialMeasures: "సిఫార్సు చేయబడిన మందులు & నివారణలు",
    estimatedPrice: "అంచనా వ్యయం",
    applicationInstructions: "వాడే విధానం మరియు సూచనలు",

    weatherTitle: "వాతావరణ సూచన విశ్లేషణ",
    weatherDesc: "మీ ప్రాంత భౌగోళిక స్థానానికి సరిపోయే నిజ-సమయ వాతావరణ వివరాలు మరియు స్మార్ట్ వ్యవసాయ సలహాలు.",
    currentTemp: "ప్రస్తుత ఉష్ణోగ్రత",
    humidity: "గాలిలో తేమ శాతం",
    windSpeed: "గాలి వేగం",
    windDirection: "గాలి దిశ",
    advisoryTitle: "AI స్మార్ట్ సాగు సలహాదారు",

    marketplaceTitle: "నేరుగా విక్రయించే స్థానిక మార్కెట్",
    marketplaceDesc: "మీ పంట దిగుబడిని స్థానిక వినియోగదారులకు మరియు డీలర్లకు నేరుగా విక్రయించండి. ప్రభుత్వ లైవ్ ధర ఇండెక్స్ ఆధారంగా మీ పంట ధరను మీరే నిర్ణయించుకోండి!",
    publishSuccess: "మీ పంట విక్రయ ప్రకటన విజయవంతంగా ప్రచురించబడింది!",
    cropHarvest: "పంట దిగుబడి",
    quantityKg: "పరిమాణం (కేజీలు)",
    customerPrice: "వినియోగదారుల ధర (కేజీకి)",
    dealerPrice: "డీలర్ల ధర (కేజీకి)",
    optionalDescription: "ఐచ్ఛిక వివరణ / పంట నాణ్యత వివరాలు",
    buttonPublishListing: "విక్రయ ప్రకటనను ప్రచురించు",
    activeListings: "మీ క్రియాశీల పంట విక్రయ ప్రకటనలు",
    retractListing: "ప్రకటనను ఉపసంహరించు",
    confirmRetract: "స్థానిక మార్కెట్ నుండి ఈ పంట ప్రకటనను ఉపసంహరించుకోవాలని మీరు ఖచ్చితంగా అనుకుంటున్నారా?",
    noListings: "ఎటువంటి విక్రయ ప్రకటనలు లేవు. స్థానిక కొనుగోలుదారులతో కనెక్ట్ అవ్వడానికి పైన మీ పంట ప్రకటనను ప్రచురించండి!",
    editListing: "ప్రకటనను సవరించు",
    saveChanges: "సేవ్ చేయి",
    cancelEdit: "రద్దు చేయి",

    assistantTitle: "AI పంట వాయిస్ అసిస్టెంట్",
    assistantDesc: "మీ పంటలు, వాతావరణం, విత్తే సమయాలు లేదా విక్రయ నియమాల గురించి మాట్లాడటానికి లేదా టైప్ చేయడానికి మైక్ బటన్ నొక్కండి.",
    assistantPlaceholder: "మీ వ్యవసాయం గురించి ఏదైనా అడగండి లేదా టైప్ చేయండి...",
    assistantListening: "వింటున్నాను... ఇప్పుడు మాట్లాడండి",
    assistantTapToSpeak: "అసిస్టెంట్‌తో మాట్లాడండి",
    assistantSpeakAnswer: "వినండి",
    assistantStopSpeaking: "ఆపు"
  },
  ta: {
    appName: "ஸ்மார்ட்கிசான் 360",
    farmerPortal: "விவசாயி போர்டல்",
    customerPortal: "வாடிக்கையாளர் சந்தை",
    dealerPortal: "டீலர் போர்டல்",
    welcome: "வரவேற்கிறோம்",
    logout: "வெளியேறு",
    editProfile: "விவரங்களை திருத்து",
    detectGps: "என் ஜிபிஎஸ் கண்டறி",
    soilType: "மண் வகை",
    currentAddress: "தற்போதைய முகவரி",
    
    tabRecommender: "பயிர் பரிந்துரை",
    tabDisease: "நோய் கண்டறிதல்",
    tabWeather: "வானிலை மற்றும் ஆலோசனை",
    tabSell: "நேரடி விற்பனை",
    
    recommendTitle: "விவசாய பயிர் பரிந்துரையாளர்",
    recommendDesc: "உங்கள் தனித்துவமான மண், இருப்பிடம் மற்றும் உள்ளூர் காலநிலை ஆகியவற்றிற்கு மிகவும் லாபகரமான பயிரைக் கண்டறிய மேம்பட்ட AI பரிந்துரைகளைப் பயன்படுத்தவும்.",
    buttonAnalyze: "சிறந்த பயிர் மற்றும் எதிர்கால விளைச்சலை கணிக்கவும்",
    analyzingText: "AI மாதிரி காலநிலை வடிவங்களை பகுப்பாய்வு செய்து சந்தை விலைகளை கணித்து வருகிறது...",
    chooseSoilLabel: "உங்கள் தற்போதைய மண் விவரம்",
    selectedCropLabel: "குறிப்பிட்ட பயிரை பகுப்பாய்வு செய் (விருப்பத்தேர்வு)",
    autoSelectBest: "AI சிறந்த பயிரை பரிந்துரைக்க அனுமதிக்கவும்",
    recommendationResult: "AI கணிப்பு பரிந்துரை",
    harvestDuration: "எதிர்பார்க்கப்படும் பயிர் காலம்",
    months: "மாதங்கள்",
    yieldPerAcre: "கணிக்கப்பட்ட பயிர் விளைச்சல்",
    liveGovernmentIndex: "அரசு சந்தை விலை குறியீடு",
    predictedFuturePrice: "AI கணித்த அறுவடை நேர விலை",
    suitabilityScore: "வானிலை இணக்கத்தன்மை மதிப்பெண்",
    climateMatch: "காலநிலை இணக்கம்",
    soilMatch: "மண் இணக்கத்தன்மை விவரம்",
    weeklySchedule: "வாராந்திர சாகுபடி மற்றும் திட்டமிடல் வழிகாட்டி",
    week: "வாரம்",

    diseaseTitle: "AI தாவர நோய் நிபுணர் & கண்டறியும் பார்வை",
    diseaseDesc: "பாதிக்கப்பட்ட பயிர் இலைகளின் புகைப்படத்தை பதிவேற்றவும். எங்கள் பார்வை மாதிரி உடனடியாக நோயைக் கண்டறிந்து பூச்சிக்கொல்லி விலைகளை மதிப்பிடும்.",
    uploadPhotoLabel: "பாதிக்கப்பட்ட பயிர் இலை புகைப்படத்தை தேர்வு செய்யவும் அல்லது இழுக்கவும்...",
    identifyingDiseaseText: "AI தாவர நோய் நிபுணர் இலை வடிவங்களை பகுப்பாய்வு செய்கிறார்...",
    symptomsDetected: "கண்டறியப்பட்ட நோய் அறிகுறிகள்",
    remedialMeasures: "பரிந்துரைக்கப்படும் மருந்துகள் & தீர்வுகள்",
    estimatedPrice: "மதிப்பிடப்பட்ட செலவு",
    applicationInstructions: "பயன்படுத்தும் முறைகள் மற்றும் வழிமுறைகள்",

    weatherTitle: "வானிலை முன்னறிவிப்பு",
    weatherDesc: "உங்கள் புவியியல் இருப்பிடத்திற்கு ஏற்றவாறு நிகழ்நேர வானிலை விவரங்கள் மற்றும் ஸ்மார்ட் விவசாய ஆலோசனைகள்.",
    currentTemp: "தற்போதைய வெப்பநிலை",
    humidity: "காற்றின் ஈரப்பதம்",
    windSpeed: "காற்றின் வேகம்",
    windDirection: "காற்றின் திசை",
    advisoryTitle: "AI ஸ்மார்ட் சாகுபடி ஆலோசனை",

    marketplaceTitle: "நேரடி விற்பனை சந்தை",
    marketplaceDesc: "உங்கள் பயிர் விளைச்சலை உள்ளூர் வாடிக்கையாளர்களுக்கும் டீலர்களுக்கும் நேரடியாக விற்பனை செய்யுங்கள். அரசு சந்தை விலையின் அடிப்படையில் உங்கள் பயிர் விலையை நீங்களே தீர்மானியுங்கள்!",
    publishSuccess: "உங்கள் பயிர் விற்பனை விளம்பரம் வெற்றிகரமாக வெளியிடப்பட்டது!",
    cropHarvest: "பயிர் விளைச்சல்",
    quantityKg: "அளவு (கிலோ கிராம்)",
    customerPrice: "வாடிக்கையாளர் விலை (கிலோவுக்கு)",
    dealerPrice: "டீலர் விலை (கிலோவுக்கு)",
    optionalDescription: "விருப்ப விளக்கம் / பயிர் தரம் விவரங்கள்",
    buttonPublishListing: "விற்பனை விளம்பரத்தை வெளியிடு",
    activeListings: "உங்கள் செயலில் உள்ள பயிர் விற்பனை விளம்பரங்கள்",
    retractListing: "விளம்பரத்தை திரும்பப் பெறு",
    confirmRetract: "உள்ளூர் சந்தையிலிருந்து இந்த பயிர் விளம்பரத்தை திரும்பப் பெற விரும்புகிறீர்களா?",
    noListings: "விற்பனை விளம்பரங்கள் எதுவும் இல்லை. உள்ளூர் வாங்குபவர்களுடன் இணைய மேலே உங்கள் பயிர் விளம்பரத்தை வெளியிடவும்!",
    editListing: "விளம்பரத்தை திருத்து",
    saveChanges: "சேமி",
    cancelEdit: "ரத்து செய்",

    assistantTitle: "AI பயிர் குரல் உதவியாளர்",
    assistantDesc: "உங்கள் பயிர்கள், வானிலை, விதைப்பு நேரங்கள் அல்லது விற்பனை விதிகள் பற்றி பேச அல்லது தட்டச்சு செய்ய மைக் பொத்தானை அழுத்தவும்.",
    assistantPlaceholder: "உங்கள் விவசாயம் பற்றி ஏதாவது கேளுங்கள் அல்லது தட்டச்சு செய்யுங்கள்...",
    assistantListening: "கேட்டுக் கொண்டிருக்கிறேன்... இப்போது பேசுங்கள்",
    assistantTapToSpeak: "உதவியாளரிடம் பேசுங்கள்",
    assistantSpeakAnswer: "கேள்",
    assistantStopSpeaking: "நிறுத்து"
  },
  kn: {
    appName: "ಸ್ಮಾರ್ಟ್ ಕಿಸಾನ್ 360",
    farmerPortal: "ರೈತ ಪೋರ್ಟಲ್",
    customerPortal: "ಗ್ರಾಹಕ ಮಾರುಕಟ್ಟೆ",
    dealerPortal: "ಡೀಲರ್ ಪೋರ್ಟಲ್",
    welcome: "ಸ್ವಾಗತ",
    logout: "ಲಾಗ್ ಔಟ್",
    editProfile: "ಪ್ರೊಫೈಲ್ ತಿದ್ದುಪಡಿ",
    detectGps: "ನನ್ನ ಜಿಪಿಎಸ್ ಪತ್ತೆಹಚ್ಚಿ",
    soilType: "ಮಣ್ಣಿನ ಪ್ರಕಾರ",
    currentAddress: "ಪ್ರಸ್ತುತ ವಿಳಾಸ",
    
    tabRecommender: "ಬೆಳೆ ಶಿಫಾರಸು",
    tabDisease: "ರೋಗ ಪತ್ತೆ ಹಚ್ಚುವಿಕೆ",
    tabWeather: "ಹವಾಮಾನ ಮತ್ತು ಸಲಹೆಗಳು",
    tabSell: "ನೇರ ಮಾರಾಟ",
    
    recommendTitle: "ಕೃಷಿ ಬೆಳೆ ಶಿಫಾರಸುಗಾರ",
    recommendDesc: "ನಿಮ್ಮ ವಿಶಿಷ್ಟ ಮಣ್ಣು, ಸ್ಥಳ ಮತ್ತು ಸ್ಥಳೀಯ ಹವಾಮಾನಕ್ಕೆ ಸೂಕ್ತವಾದ ಗರಿಷ್ಠ ಲಾಭದಾಯಕ ಬೆಳೆಯನ್ನು ಕಂಡುಹಿಡಿಯಲು ಸುಧಾರಿತ AI ಶಿಫಾರಸುಗಳನ್ನು ಬಳಸಿ.",
    buttonAnalyze: "ಉತ್ತಮ ಬೆಳೆ ಮತ್ತು ಭವಿಷ್ಯದ ಇಳುವರಿಯನ್ನು ಅಂದಾಜು ಮಾಡಿ",
    analyzingText: "AI ಮಾದರಿ ಹವಾಮಾನ ಪರಿಸ್ಥಿತಿಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ಅಂದಾಜು ಮಾಡುತ್ತಿದೆ...",
    chooseSoilLabel: "ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಮಣ್ಣಿನ ಪ್ರೊಫೈಲ್",
    selectedCropLabel: "ನಿರ್ದಿಷ್ಟ ಬೆಳೆ ವಿಶ್ಲೇಷಿಸಿ (ಐಚ್ಛಿಕ)",
    autoSelectBest: "AI ಅತ್ಯುತ್ತಮ ಬೆಳೆಯನ್ನು ಶಿಫಾರಸು ಮಾಡಲು ಅನುಮತಿಸಿ",
    recommendationResult: "AI ಮುನ್ಸೂಚನೆ ಶಿಫಾರಸು",
    harvestDuration: "ನಿರೀಕ್ಷಿತ ಬೆಳೆ ಅವಧಿ",
    months: "ತಿಂಗಳುಗಳು",
    yieldPerAcre: "ಅಂದಾಜು ಬೆಳೆ ಇಳುವರಿ",
    liveGovernmentIndex: "ಸರ್ಕಾರಿ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಸೂಚ್ಯಂಕ",
    predictedFuturePrice: "AI ಮುನ್ಸೂಚನೆ ನೀಡಿದ ಬೆಳೆ ಅವಧಿಯ ಬೆಲೆ",
    suitabilityScore: "ಹವಾಮಾನ ಹೊಂದಾಣಿಕೆ ಸ್ಕೋರ್",
    climateMatch: "ಹವಾಮಾನ ಹೊಂದಾಣಿಕೆ",
    soilMatch: "ಮಣ್ಣಿನ ಹೊಂದಾಣಿಕೆ ಪ್ರೊಫೈಲ್",
    weeklySchedule: "ವಾರಾವಾರು ಕೃಷಿ ಮತ್ತು ವೇಳಾಪಟ್ಟಿ ಮಾರ್ಗದರ್ಶಿ",
    week: "ವಾರ",

    diseaseTitle: "AI ಸಸ್ಯ ರೋಗಶಾಸ್ತ್ರಜ್ಞ ಮತ್ತು ರೋಗನಿರ್ಣಯ ದೃಷ್ಟಿ",
    diseaseDesc: "ಸೋಂಕಿತ ಬೆಳೆ ಎಲೆಗಳ ಫೋಟೋವನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ. ನಮ್ಮ ದೃಷ್ಟಿ ಮಾದರಿ ತಕ್ಷಣವೇ ರೋಗವನ್ನು ಪತ್ತೆಹಚ್ಚಿ ಸೂಕ್ತ ಔಷಧಗಳು ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
    uploadPhotoLabel: "ಸೋಂಕಿತ ಬೆಳೆ ಎಲೆ ಫೋಟೋವನ್ನು ಆರಿಸಿ ಅಥವಾ ಇಲ್ಲಿ ಎಳೆಯಿರಿ...",
    identifyingDiseaseText: "AI ಸಸ್ಯ ರೋಗಶಾಸ್ತ್ರಜ್ಞ ಎಲೆಗಳ ವಿನ್ಯಾಸವನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದ್ದಾರೆ...",
    symptomsDetected: "ಗುರುತಿಸಲಾದ ರೋಗದ ಲಕ್ಷಣಗಳು",
    remedialMeasures: "ಶಿಫಾರಸು ಮಾಡಲಾದ ಔಷಧಗಳು ಮತ್ತು ಪರಿಹಾರಗಳು",
    estimatedPrice: "ಅಂದಾಜು ವೆಚ್ಚ",
    applicationInstructions: "ಬಳಸುವ ವಿಧಾನ ಮತ್ತು ಸೂಚನೆಗಳು",

    weatherTitle: "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ವಿಶ್ಲೇಷಣೆ",
    weatherDesc: "ನಿಮ್ಮ ಪ್ರದೇಶದ ಭೌಗೋಳಿಕ ಸ್ಥಳಕ್ಕೆ ಸೂಕ್ತವಾದ ನೈಜ-ಸಮಯದ ಹವಾಮಾನ ವಿವರಗಳು ಮತ್ತು ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಲಹೆಗಳು.",
    currentTemp: "ಪ್ರಸ್ತುತ ತಾಪಮಾನ",
    humidity: "ಗಾಳಿಯಲ್ಲಿನ ತೇವಾಂಶದ ಪ್ರಮಾಣ",
    windSpeed: "ಗಾಳಿಯ ವೇಗ",
    windDirection: "ಗಾಳಿಯ ದಿಕ್ಕು",
    advisoryTitle: "AI ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಲಹೆಗಾರ",

    marketplaceTitle: "ನೇರ ಮಾರಾಟದ ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆ",
    marketplaceDesc: "ನಿಮ್ಮ ಬೆಳೆ ಇಳುವರಿಯನ್ನು ಸ್ಥಳೀಯ ಗ್ರಾಹಕರಿಗೆ ಮತ್ತು ಡೀಲರ್ಗಳಿಗೆ ನೇರವಾಗಿ ಮಾರಾಟ ಮಾಡಿ. ಸರ್ಕಾರದ ಲೈವ್ ಬೆಲೆ ಸೂಚ್ಯಂಕದ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ಬೆಳೆ ಬೆಲೆಯನ್ನು ನೀವೇ ನಿರ್ಧರಿಸಿ!",
    publishSuccess: "ನಿಮ್ಮ ಬೆಳೆ ಮಾರಾಟದ ಜಾಹೀರಾತು ಯಶಸ್ವಿಯಾಗಿ ಪ್ರಕಟಗೊಂಡಿದೆ!",
    cropHarvest: "ಬೆಳೆ ಇಳುವರಿ",
    quantityKg: "ಪ್ರಮಾಣ (ಕೆಜಿ)",
    customerPrice: "ಗ್ರಾಹಕರ ಬೆಲೆ (ಪ್ರತಿ ಕೆಜಿಗೆ)",
    dealerPrice: "ಡೀಲರ್ ಬೆಲೆ (ಪ್ರತಿ ಕೆಜಿಗೆ)",
    optionalDescription: "ಐಚ್ಛಿಕ ವಿವರಣೆ / ಬೆಳೆ ಗುಣಮಟ್ಟದ ವಿವರಗಳು",
    buttonPublishListing: "ಮಾರಾಟದ ಜಾಹೀರಾತನ್ನು ಪ್ರಕಟಿಸಿ",
    activeListings: "ನಿಮ್ಮ ಸಕ್ರಿಯ ಬೆಳೆ ಮಾರಾಟದ ಜಾಹೀರಾತುಗಳು",
    retractListing: "ಜಾಹೀರಾತನ್ನು ಹಿಂಪಡೆಯಿರಿ",
    confirmRetract: "ಸ್ಥಾಲೀಯ ಮಾರುಕಟ್ಟೆಯಿಂದ ಈ ಬೆಳೆ ಜಾಹೀರಾತನ್ನು ಹಿಂಪಡೆಯಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?",
    noListings: "ಯಾವುದೇ ಬೆಳೆ ಮಾರಾಟದ ಜಾಹೀರಾತುಗಳಿಲ್ಲ. ಸ್ಥಳೀಯ ಖರೀದಿದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಲು ಮೇಲೆ ನಿಮ್ಮ ಬೆಳೆ ಜಾಹೀರಾತನ್ನು ಪ್ರಕಟಿಸಿ!",
    editListing: "ಜಾಹೀರಾತನ್ನು ತಿದ್ದುಪಡಿ ಮಾಡಿ",
    saveChanges: "ಉಳಿಸಿ",
    cancelEdit: "ರದ್ದುಮಾಡಿ",

    assistantTitle: "AI ಬೆಳೆ ಧ್ವನಿ ಸಹಾಯಕ",
    assistantDesc: "ನಿಮ್ಮ ಬೆಳೆಗಳು, ಹವಾಮಾನ, ಬಿತ್ತನೆ ಸಮಯಗಳು ಅಥವಾ ಮಾರಾಟದ ನಿಯಮಗಳ ಬಗ್ಗೆ ಮಾತನಾಡಲು ಅಥವಾ ಟೈಪ್ ಮಾಡಲು ಮೈಕ್ ಬಟನ್ ಒತ್ತಿರಿ.",
    assistantPlaceholder: "ನಿಮ್ಮ ಕೃಷಿ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ...",
    assistantListening: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ... ಈಗ ಮಾತನಾಡಿ",
    assistantTapToSpeak: "ಸಹಾಯಕರೊಂದಿಗೆ ಮಾತನಾಡಿ",
    assistantSpeakAnswer: "ಕೇಳಿ",
    assistantStopSpeaking: "ನಿಲ್ಲಿಸಿ"
  }
};
