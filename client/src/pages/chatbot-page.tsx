import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, Send, Mic, User, Clock, CheckCircle,
  AlertCircle, HelpCircle, FileText, Globe, History
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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
    initialBotMessage: "Hello! I'm your Jansunwai AI Assistant. How can I assist you today?",
  },
  hi: {
    smartAssistant: "स्मार्ट सहायक",
    tagline: "शिकायतों, नागरिक प्रक्रियाओं आदि के लिए तुरंत सहायता प्राप्त करें। हिंदी और अंग्रेजी में 24/7 उपलब्ध।",
    aiAssistant: "एआई सहायक",
    online: "ऑनलाइन",
    hindi: "हिंदी",
    english: "English",
    typeQuestion: "अपना प्रश्न यहाँ लिखें...",
    pastQuestions: "पिछले प्रश्न",
    knowledgeBase: "ज्ञान आधार",
    commonQuestions: "सामान्य प्रश्न",
    initialBotMessage: "नमस्ते! मैं आपका जनसुनवाई एआई सहायक हूँ। आज मैं आपकी कैसे सहायता कर सकता हूँ?",
  }
};

interface ChatMessage {
  id?: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
  suggestions?: string[];
}

export default function ChatbotPage() {
  const { user, accessToken } = useAuth();
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

  // --- FIX: This useEffect now correctly fetches chat history from your Python backend ---
  useEffect(() => {
    if (!userId) return;

    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/chat/history/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch chat history");
        
        const history = await response.json();
        const formattedMessages = history.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));

        if (formattedMessages.length === 0) {
          const initialMessage: ChatMessage = {
            id: `initial-${Date.now()}`, 
            type: 'bot', 
            message: t('initialBotMessage'), 
            timestamp: new Date(),
            suggestions: [ "How to file a complaint?", "Track my complaint status" ]
          };
          setMessages([initialMessage]);
        } else {
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        const initialMessage: ChatMessage = {
            id: `initial-error-${Date.now()}`, 
            type: 'bot', 
            message: t('initialBotMessage'), 
            timestamp: new Date(),
            suggestions: [ "How to file a complaint?", "Track my complaint status" ]
        };
        setMessages([initialMessage]);
      }
    };

    fetchHistory();
  }, [userId, language]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const getAIResponse = async (userInput: string) => {
    if (!userId) return;
    setIsTyping(true);
    
    const payload = { userId, message: userInput, language };

    try {
      const response = await fetch('http://localhost:8000/api/chat/web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to get response from AI service.");

      const result = await response.json();
      
      const botMessage: ChatMessage = {
        type: 'bot',
        message: result?.message || "I'm sorry, I encountered an issue.",
        suggestions: result?.suggestions || [],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: ChatMessage = {
        type: 'bot',
        message: "There was an error connecting to the AI service.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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
    
    setMessages(prev => [...prev, userMessage]);
    
    // --- FIX: Save user message to the Python backend ---
    try {
        await fetch('http://localhost:8000/api/chat/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...userMessage, userId })
        });
    } catch (error) {
        console.error("Failed to save user message:", error);
    }
    
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

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <Card className="h-[650px] flex flex-col">
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
              
              <ScrollArea className="flex-1" ref={scrollAreaRef}>
                <div className="p-6 space-y-6">
                  {messages.map((message, index) => (
                    <div key={message.id || index} className={`flex items-start gap-4 ${message.type === 'user' ? 'justify-end' : ''}`}>
                      {message.type === 'bot' && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <Bot className="text-gray-600" size={16} />
                        </div>
                      )}
                      <div className={`max-w-md rounded-lg p-3 ${
                        message.type === 'user' 
                          ? 'bg-blue-100 text-black rounded-br-none' 
                          : 'bg-gray-100 text-gray-900 rounded-bl-none'
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
                       {message.type === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                          <User className="text-white" size={16} />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
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
                  )}
                </div>
              </ScrollArea>
              
              <div className="border-t p-4 bg-white">
                <div className="flex items-center gap-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder={t('typeQuestion')}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon"><Mic /></Button>
                  <Button onClick={handleSendMessage} disabled={!currentMessage.trim() || isTyping}><Send /></Button>
                </div>
              </div>
            </Card>
            
            <Card>
              <CardHeader><CardTitle className="text-lg">{t('commonQuestions')}</CardTitle></CardHeader>
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

          <div className="lg-col-span-1 space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">{t('pastQuestions')}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {pastQuestions.length > 0 ? pastQuestions.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSuggestionClick(item.message)}
                    className="w-full text-left p-3 text-xs rounded-lg border hover:bg-gray-50 transition-colors truncate"
                  >
                    <div className="flex items-center gap-2">
                      <History className="text-gray-400 flex-shrink-0" size={14} />
                      <span>{item.message}</span>
                    </div>
                  </button>
                )) : <p className="text-sm text-gray-500">Your recent questions will appear here.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">{t('knowledgeBase')}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {knowledgeBase.map((item, index) => (
                  <div key={index} className="p-3 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                        <item.icon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                      </div>
                    </div>
                  </div>
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
