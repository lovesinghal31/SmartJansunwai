import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  Send,
  Mic,
  User,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  FileText,
  Globe
} from "lucide-react";

// Firebase Imports for Database
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, onSnapshot, orderBy } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// --- Multi-language Support Setup ---
const translations = {
  en: {
    smartAssistant: "Smart Assistant",
    tagline: "Get instant help with complaints, civic processes, and more. Available 24/7 in Hindi and English.",
    aiAssistant: "AI Assistant",
    online: "Online",
    hindi: "हिंदी",
    english: "English",
    typeQuestion: "Type your question here...",
    pastQuestions: "Past Questions",
    knowledgeBase: "Knowledge Base",
    commonQuestions: "Common Questions",
    initialBotMessage: "Hello! I'm your Jansunwai AI Assistant. I can help you with:\n\n• Filing complaints and tracking status\n• Understanding civic processes\n• Finding the right department for your issue\n• Providing complaint guidelines\n\nHow can I assist you today?",
  },
  hi: {
    smartAssistant: "स्मार्ट सहायक",
    tagline: "शिकایات, नागरिक प्रक्रियाओं आदि के लिए तुरंत सहायता प्राप्त करें। हिंदी और अंग्रेजी में 24/7 उपलब्ध।",
    aiAssistant: "एआई सहायक",
    online: "ऑनलाइन",
    hindi: "हिंदी",
    english: "English",
    typeQuestion: "अपना प्रश्न यहाँ लिखें...",
    pastQuestions: "पिछले प्रश्न",
    knowledgeBase: "ज्ञान आधार",
    commonQuestions: "सामान्य प्रश्न",
    initialBotMessage: "नमस्ते! मैं आपका जनसुनवाई एआई सहायक हूँ। मैं आपकी मदद कर सकता हूँ:\n\n• शिकायतें दर्ज करना और स्थिति ट्रैक करना\n• नागरिक प्रक्रियाओं को समझना\n• आपकी समस्या के लिए सही विभाग खोजना\n• शिकायत दिशानिर्देश प्रदान करना\n\nआज मैं आपकी कैसे सहायता कर सकता हूँ?",
  }
};

interface ChatMessage {
  id?: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
  suggestions?: string[];
}

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyCa1e4UrB1xxKsRdvOrDVc0B1Qeo5sYxpY",
  authDomain: "samadhanplus-3987d.firebaseapp.com",
  projectId: "samadhanplus-3987d",
  storageBucket: "samadhanplus-3987d.appspot.com",
  messagingSenderId: "508021280392",
  appId: "1:508021280392:web:73e7fbb0bfe9774b0c193d",
  measurementId: "G-ZSEB8QPYPB"
};

declare const __app_id: any;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export default function ChatbotPage() {
  const { user } = useAuth();
  const userId = user?.id;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const t = (key: keyof typeof translations.en) => translations[language][key] || translations.en[key];

  const commonQuestions = [
    { icon: FileText, question: "How to file a complaint?", category: "Getting Started" },
    { icon: Clock, question: "What is the complaint resolution timeline?", category: "Process" },
    { icon: CheckCircle, question: "How to track complaint status?", category: "Tracking" },
    { icon: AlertCircle, question: "What if my complaint is urgent?", category: "Emergency" },
    { icon: HelpCircle, question: "Which department handles water issues?", category: "Departments" },
    { icon: Globe, question: "Can I file complaints in Hindi?", category: "Language" }
  ];

  const knowledgeBase = [
    { title: "Filing Your First Complaint", description: "Step-by-step guide to submit complaints effectively", icon: FileText, color: "bg-blue-100 text-blue-800" },
    { title: "Understanding SLA Timeline", description: "Learn about service level agreements and expected resolution times", icon: Clock, color: "bg-green-100 text-green-800" },
    { title: "Department Directory", description: "Find the right department for your specific issue", icon: HelpCircle, color: "bg-purple-100 text-purple-800" },
    { title: "Emergency Procedures", description: "What to do for urgent civic issues requiring immediate attention", icon: AlertCircle, color: "bg-red-100 text-red-800" }
  ];
  
  useEffect(() => {
    if (!userId) return;
    console.log(`DEBUG: Setting up Firestore listener for userId: ${userId}`);

    const chatHistoryCollection = collection(db, `artifacts/${appId}/users/${userId}/chatHistory`);
    const q = query(chatHistoryCollection, orderBy("timestamp", "asc"));

    const dataUnsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedMessages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate(),
        } as ChatMessage);
      });
      
      if (fetchedMessages.length === 0) {
        const initialMessage: ChatMessage = {
          id: '1',
          type: 'bot',
          message: t('initialBotMessage'),
          timestamp: new Date(),
          suggestions: [ "How to file a complaint?", "Track my complaint status", "Water supply issues", "Road repair request" ]
        };
        setMessages([initialMessage]);
      } else {
        setMessages(fetchedMessages);
      }
    }, (error) => {
      console.error("DEBUG: Firestore snapshot error:", error);
    });

    return () => dataUnsubscribe();
  }, [userId, language]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const getAIResponse = async (userInput: string) => {
    setIsTyping(true);
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      const errorMessage: ChatMessage = {
        type: 'bot',
        message: "AI service is not configured. The VITE_GEMINI_API_KEY is missing from the .env file.",
        timestamp: new Date()
      };
      if (userId) {
        const chatHistoryCollection = collection(db, `artifacts/${appId}/users/${userId}/chatHistory`);
        await addDoc(chatHistoryCollection, errorMessage);
      }
      setIsTyping(false);
      return;
    }
    
    // --- FIX: Enhanced system prompt with specific context about the website ---
    const systemPrompt = `You are the "Smart Jansunwai" AI Assistant for the city of Indore. Your purpose is to help users of this specific website.
    Key features of the website you should know about:
    - Complaint Filing: Users can submit complaints about civic issues.
    - Status Tracking: Users can track the status of their submitted complaints.
    - Interactive Map: A map view shows the location of various complaints.
    - Department Directory: Information on municipal departments.
    Your role is to answer questions strictly related to these features and other civic issues in Indore. If a user asks a question outside of this domain (e.g., about movies, celebrities, general knowledge), you must politely decline to answer and guide them back to relevant topics.
    Answer the following user query in ${language === 'hi' ? 'Hindi' : 'English'}.`;

    // --- FIX: Include previous messages for conversational context ---
    const conversationHistory = messages.slice(-6).map(msg => ({
      role: msg.type === 'user' ? 'user' : 'model',
      parts: [{ text: msg.message }]
    }));

    const payload = { 
      contents: [
        ...conversationHistory,
        { role: "user", parts: [{ text: systemPrompt + `\n\nUser Question: "${userInput}"` }] }
      ]
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      
      let botMessageText = "I'm sorry, I couldn't process that request. Please try asking in a different way.";
      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts.length > 0) {
        botMessageText = result.candidates[0].content.parts[0].text;
      } else if (result.error) {
        botMessageText = `AI Error: ${result.error.message}`;
      }
      
      const botMessage: ChatMessage = {
        type: 'bot',
        message: botMessageText,
        timestamp: new Date()
      };
      
      if (userId) {
        const chatHistoryCollection = collection(db, `artifacts/${appId}/users/${userId}/chatHistory`);
        await addDoc(chatHistoryCollection, botMessage);
      }

    } catch (error) {
      console.error("DEBUG: Error fetching AI response:", error);
      const errorMessage: ChatMessage = {
        type: 'bot',
        message: "There was an error connecting to the AI service. Please try again later.",
        timestamp: new Date()
      };
      if (userId) {
        const chatHistoryCollection = collection(db, `artifacts/${appId}/users/${userId}/chatHistory`);
        await addDoc(chatHistoryCollection, errorMessage);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !userId) return;

    const userMessage: ChatMessage = {
      type: 'user',
      message: currentMessage,
      timestamp: new Date()
    };

    const chatHistoryCollection = collection(db, `artifacts/${appId}/users/${userId}/chatHistory`);
    await addDoc(chatHistoryCollection, userMessage);
    
    getAIResponse(currentMessage);
    setCurrentMessage("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const pastQuestions = messages.filter(m => m.type === 'user').slice(-5).reverse();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <Bot className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{t('smartAssistant')}</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('tagline')}</p>
        </div>

        {/* This is the key change: use flexbox for column layout on large screens */}
        <div className="grid lg:grid-cols-4 gap-8 items-stretch">
          {/* Chat Interface - Stretches to match height */}
          <div className="lg:col-span-3 flex">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="text-primary-600" size={20} />
                    <span>{t('aiAssistant')}</span>
                    <Badge className="bg-green-100 text-green-800">{t('online')}</Badge>
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={toggleLanguage}>
                    <Globe size={16} className="mr-1" />
                    {language === 'en' ? t('hindi') : t('english')}
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md flex space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' ? 'bg-primary-600' : 'bg-gray-200'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="text-white" size={16} />
                        ) : (
                          <Bot className="text-gray-600" size={16} />
                        )}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        <p className="text-xs mt-2 opacity-70 text-right">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {message.suggestions && (
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {message.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="text-left text-xs px-3 py-2 bg-gray-200/50 rounded-md hover:bg-gray-200/80 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <Bot className="text-gray-600" size={16} />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 rounded-bl-none">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Type your question here..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="pr-12"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={startVoiceInput}
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${isListening ? 'text-red-500' : 'text-gray-400'}`}
                    >
                      <Mic size={16} />
                    </Button>
                  </div>
                  <Button onClick={handleSendMessage} disabled={!currentMessage.trim()}>
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar content - Stretches to match height */}
          <div className="lg:col-span-1 flex flex-col space-y-6">
            {/* Quick Questions - The height of this card now determines the total height */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-lg">Common Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {commonQuestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(item.question)}
                    className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <item.icon className="text-primary-600 mt-1 flex-shrink-0" size={16} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.question}</p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
