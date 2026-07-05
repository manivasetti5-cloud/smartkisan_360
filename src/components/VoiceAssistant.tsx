import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  MessageSquare, 
  X, 
  Sprout,
  Play,
  Square,
  Sparkles,
  Loader2
} from 'lucide-react';
import { SupportedLanguage, translations } from '../translations';

// Speech Recognition Type Safety
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface VoiceAssistantProps {
  currentLanguage: SupportedLanguage;
  token: string;
}

export default function VoiceAssistant({ currentLanguage, token }: VoiceAssistantProps) {
  const t = translations[currentLanguage];
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: currentLanguage === 'hi' ? 'नमस्ते! मैं आपका फसल सलाहकार हूँ। आप अपनी खेती, मौसम, बुवाई या कीमतों के बारे में मुझसे कुछ भी पूछ सकते हैं।' :
            currentLanguage === 'te' ? 'నమస్తే! నేను మీ పంట సలహాదారుడిని. వ్యవసాయం, వాతావરણం లేదా పంట ధరల గురించి ఏదైనా అడగండి.' :
            currentLanguage === 'ta' ? 'வணக்கம்! நான் உங்கள் பயிர் ஆலோசகர். விவசாயம், வானிலை அல்லது பயிர் விலைகள் பற்றி எதையும் கேளுங்கள்.' :
            currentLanguage === 'kn' ? 'ನಮಸ್ತೆ! ನಾನು ನಿಮ್ಮ ಬೆಳೆ ಸಲಹೆಗಾರ. ವ್ಯವಸಾಯ, ಹವಾಮಾನ ಅಥವಾ ಬೆಳೆ ಬೆಲೆಗಳ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ.' :
            'Hello! I am your AI Crop Voice Assistant. Ask me anything about crop cultivation, weather advisory, soil preparation, or market selling rules!',
      timestamp: new Date()
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      const rec = new SpeechRecognitionClass();
      rec.continuous = false;
      rec.interimResults = false;
      
      // Map local app languages to browser recognition language locales
      const localeMap: Record<SupportedLanguage, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        kn: 'kn-IN'
      };
      rec.lang = localeMap[currentLanguage];

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue(transcript);
          // Auto-send voice queries
          handleSendMessage(transcript);
        }
      };

      rec.onerror = (e: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', e.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [currentLanguage]);

  // Reset speaker if language changes
  useEffect(() => {
    stopSpeaking();
  }, [currentLanguage]);

  // Toggle microphone recording
  const handleToggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not fully supported in your browser. Please try using Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      stopSpeaking(); // Stop any active speech before listening
      // Update recognition language in case it changed
      const localeMap: Record<SupportedLanguage, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        kn: 'kn-IN'
      };
      recognitionRef.current.lang = localeMap[currentLanguage];
      recognitionRef.current.start();
    }
  };

  // Speak message aloud (Text-to-Speech)
  const speakMessageAloud = (messageId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    // Toggle stop if speaking the same message
    if (currentlySpeakingId === messageId) {
      stopSpeaking();
      return;
    }

    stopSpeaking(); // clear previous speech

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map languages to localized synthesis voices
    const synthesisLocales: Record<SupportedLanguage, string[]> = {
      en: ['en-IN', 'en-GB', 'en-US'],
      hi: ['hi-IN'],
      te: ['te-IN'],
      ta: ['ta-IN'],
      kn: ['kn-IN']
    };

    const targetLocales = synthesisLocales[currentLanguage];
    const voices = window.speechSynthesis.getVoices();
    
    // Attempt to find a native voice matching the language code
    const matchingVoice = voices.find(voice => 
      targetLocales.some(loc => voice.lang.toLowerCase().startsWith(loc.toLowerCase()))
    );

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    
    utterance.lang = targetLocales[0];
    utterance.rate = 0.95; // Slightly slower for crisp clear pronunciation

    utterance.onstart = () => {
      setCurrentlySpeakingId(messageId);
    };

    utterance.onend = () => {
      setCurrentlySpeakingId(null);
    };

    utterance.onerror = () => {
      setCurrentlySpeakingId(null);
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentlySpeakingId(null);
  };

  // Submit standard text input or voice transcription
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    // Clear input box
    setInputValue('');

    const userMsgId = 'msg-' + Math.random().toString(36).substring(2, 11);
    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: text,
          language: currentLanguage
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botMsgId = 'msg-' + Math.random().toString(36).substring(2, 11);
        const botMsg: Message = {
          id: botMsgId,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);

        // Auto-read response for seamless hands-free voice experience!
        speakMessageAloud(botMsgId, data.reply);
      } else {
        throw new Error('Failed to fetch assistant response.');
      }
    } catch (err) {
      console.error(err);
      const errBotMsg: Message = {
        id: 'msg-err-' + Date.now(),
        sender: 'assistant',
        text: currentLanguage === 'hi' ? 'क्षमा करें, इस समय एआई सर्वर कनेक्ट नहीं हो पा रहा है।' :
              currentLanguage === 'te' ? 'క్షమించండి, ప్రస్తుతం AI సర్వర్ కనెక్ట్ కావట్లేదు.' :
              currentLanguage === 'ta' ? 'மன்னிக்கவும், எங்களால் இப்போது AI சேவையகத்துடன் இணைக்க முடியவில்லை.' :
              currentLanguage === 'kn' ? 'ಕ್ಷಮಿಸಿ, ಈ ಸಮಯದಲ್ಲಿ AI ಸರ್ವರ್ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ.' :
              'Oops! I am having trouble connecting to the AI helper right now. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errBotMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-tr from-emerald-500 to-teal-600 text-slate-950 p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-emerald-300/40 cursor-pointer flex items-center justify-center group"
        title="AI Voice Assistant"
        id="voice-assistant-toggle-btn"
      >
        <MessageSquare className="w-6 h-6 text-slate-950 group-hover:rotate-6 transition-transform" />
        <span className="absolute -top-1 -right-1 bg-teal-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-slate-950 uppercase tracking-widest border border-emerald-500 animate-pulse">
          AI
        </span>
      </button>

      {/* Slide-out Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-screen w-full sm:w-110 bg-slate-950 border-l border-slate-800 shadow-2xl z-50 transform transition-all duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        id="voice-assistant-panel"
      >
        {/* Drawer Header */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-900/40 text-emerald-400">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-extrabold text-sm text-white tracking-tight font-display">
                  {t.assistantTitle}
                </h3>
                <span className="bg-emerald-950/60 text-emerald-400 text-[8px] px-2 py-0.5 font-bold rounded-full uppercase tracking-wider border border-emerald-900/40 flex items-center">
                  <Sparkles className="w-2 h-2 mr-0.5 animate-pulse" />
                  Live Voice
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Gemini 3.5 Assistant • Hands-free Advice</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              stopSpeaking();
            }}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition cursor-pointer"
            id="voice-assistant-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Banner */}
        <div className="bg-slate-900/30 px-6 py-3 border-b border-slate-800/50 text-slate-400 text-[10px] leading-normal flex items-start space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <span>{t.assistantDesc}</span>
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              {/* Message bubble */}
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-md relative group ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-slate-950 rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>
                
                {/* Audio read aloud speaker icon for assistant messages */}
                {msg.sender === 'assistant' && (
                  <button
                    onClick={() => speakMessageAloud(msg.id, msg.text)}
                    className={`mt-2.5 flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                      currentlySpeakingId === msg.id
                        ? 'bg-red-950/80 text-red-400 border-red-900/40 animate-pulse'
                        : 'bg-slate-950 hover:bg-slate-850 text-emerald-400 border-emerald-900/30'
                    }`}
                    title={currentlySpeakingId === msg.id ? t.assistantStopSpeaking : t.assistantSpeakAnswer}
                  >
                    {currentlySpeakingId === msg.id ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        <span>{t.assistantStopSpeaking}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{t.assistantSpeakAnswer}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Timestamp label */}
              <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {isAiLoading && (
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-3 rounded-2xl mr-auto max-w-[50%] shadow-md">
              <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Consulting AI...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Controls Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
          {/* Listening Pulsing Wave */}
          {isListening && (
            <div className="bg-emerald-950/60 border border-emerald-900/40 p-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-400 font-medium">
              <div className="flex items-center space-x-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>{t.assistantListening}</span>
              </div>
              <button 
                onClick={handleToggleMic} 
                className="bg-red-950 hover:bg-red-900 text-red-400 px-2 py-0.5 text-[9px] font-bold rounded-lg border border-red-900/30 uppercase tracking-wider cursor-pointer"
              >
                {t.assistantStopSpeaking}
              </button>
            </div>
          )}

          <div className="flex items-center space-x-2.5">
            {/* Mic Toggle Button */}
            <button
              onClick={handleToggleMic}
              className={`p-3 rounded-xl transition shadow-inner shrink-0 cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-slate-950 hover:bg-red-700 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700/50'
              }`}
              title={t.assistantTapToSpeak}
              id="voice-assistant-mic-btn"
            >
              {isListening ? <MicOff className="w-5 h-5 text-slate-950" /> : <Mic className="w-5 h-5 text-emerald-400" />}
            </button>

            {/* Chat Input Field */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex-1 flex items-center space-x-2.5 bg-slate-950 px-3.5 py-1 rounded-xl border border-slate-800 focus-within:border-emerald-500/50 transition-all duration-200"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t.assistantPlaceholder}
                className="flex-1 bg-transparent border-0 py-2.5 text-xs text-white focus:outline-none focus:ring-0 placeholder-slate-500 min-w-0"
                id="voice-assistant-text-input"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={`p-1.5 rounded-lg shrink-0 transition-all cursor-pointer ${
                  inputValue.trim()
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 scale-100 hover:scale-105'
                    : 'text-slate-600 cursor-not-allowed scale-95'
                }`}
                id="voice-assistant-send-btn"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
