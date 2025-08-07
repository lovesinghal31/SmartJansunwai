import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, Send, Mic, User, MessageCircle, Clock, CheckCircle,
  AlertCircle, HelpCircle, Lightbulb, FileText, Globe, History
} from "lucide-react";

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
  suggestions?: string[];
}

export default function ChatbotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      message: "Hello! I'm your Jansunwai AI Assistant. I can help you with:\n\n• Filing complaints and tracking status\n• Understanding civic processes\n• Finding the right department for your issue\n• Providing complaint guidelines\n\nHow can I assist you today?",
      timestamp: new Date(),
      suggestions: [
        "How to file a complaint?",
        "Track my complaint status",
        "Water supply issues",
        "Road repair request"
      ]
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const commonQuestions = [
    {
      icon: FileText,
      question: "How to file a complaint?",
      category: "Getting Started"
    },
    {
      icon: Clock,
      question: "What is the complaint resolution timeline?",
      category: "Process"
    },
    {
      icon: CheckCircle,
      question: "How to track complaint status?",
      category: "Tracking"
    },
    {
      icon: AlertCircle,
      question: "What if my complaint is urgent?",
      category: "Emergency"
    },
    {
      icon: HelpCircle,
      question: "Which department handles water issues?",
      category: "Departments"
    },
    {
      icon: Globe,
      question: "Can I file complaints in Hindi?",
      category: "Language"
    }
  ];

  const knowledgeBase = [
    {
      title: "Filing Your First Complaint",
      description: "Step-by-step guide to submit complaints effectively",
      icon: FileText,
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "Understanding SLA Timeline",
      description: "Learn about service level agreements and expected resolution times",
      icon: Clock,
      color: "bg-green-100 text-green-800"
    },
    {
      title: "Department Directory",
      description: "Find the right department for your specific issue",
      icon: HelpCircle,
      color: "bg-purple-100 text-purple-800"
    },
    {
      title: "Emergency Procedures",
      description: "What to do for urgent civic issues requiring immediate attention",
      icon: AlertCircle,
      color: "bg-red-100 text-red-800"
    }
  ];

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(currentMessage);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput: string): ChatMessage => {
    const input = userInput.toLowerCase();
    let response = "";
    let suggestions: string[] = [];

    if (input.includes("file") || input.includes("submit") || input.includes("complaint")) {
      response = "To file a complaint:\n\n1. Go to the 'Submit Complaint' section\n2. Select the appropriate category (Water, Roads, etc.)\n3. Provide detailed description and location\n4. Upload supporting photos if available\n5. Submit and note your complaint ID\n\nYou'll receive updates via SMS and can track status anytime.";
      suggestions = ["What documents do I need?", "How long does review take?", "Can I edit after submission?"];
    } else if (input.includes("track") || input.includes("status")) {
      response = "To track your complaint:\n\n1. Go to 'My Complaints' dashboard\n2. Find your complaint by ID or date\n3. View real-time status updates\n4. Check official responses and estimated resolution\n\nYou can also use the search function to quickly find specific complaints.";
      suggestions = ["Why is my complaint pending?", "How to get faster resolution?", "Contact assigned officer"];
    } else if (input.includes("water") || input.includes("supply")) {
      response = "For water supply issues:\n\n• **Department**: Water Supply & Sewerage\n• **Typical Resolution**: 2-3 working days\n• **Emergency Contact**: 1800-XXX-XXXX\n\nCommon issues handled:\n- No water supply\n- Low pressure\n- Contaminated water\n- Pipe leaks\n- Billing disputes";
      suggestions = ["File water complaint", "Emergency water contact", "Check water quality"];
    } else if (input.includes("road") || input.includes("pothole")) {
      response = "For road and transportation issues:\n\n• **Department**: Road & Transportation\n• **Typical Resolution**: 5-7 working days\n• **Priority**: Based on traffic density and safety\n\nCommon issues:\n- Potholes and road damage\n- Street lighting\n- Traffic signals\n- Parking issues\n- Construction debris";
      suggestions = ["Report pothole", "Street light not working", "Traffic signal issue"];
    } else if (input.includes("hindi") || input.includes("language")) {
      response = "Yes! Jansunwai supports multiple languages:\n\n🇮🇳 **Hindi**: पूर्ण समर्थन उपलब्ध\n🇬🇧 **English**: Full support available\n\nYou can:\n- Switch language using the toggle in header\n- File complaints in your preferred language\n- Receive updates in your chosen language\n- Use voice input in Hindi or English";
      suggestions = ["How to change language?", "Voice input in Hindi", "Get updates in Hindi"];
    } else {
      response = "I understand you're looking for help. Here are some ways I can assist:\n\n• **Complaint Filing**: Guide you through the submission process\n• **Status Tracking**: Help check your complaint progress\n• **Department Info**: Connect you with the right office\n• **Process Guidance**: Explain civic procedures\n\nCould you please specify what you'd like help with?";
      suggestions = ["File new complaint", "Track existing complaint", "Department contacts", "Emergency help"];
    }

    return {
      id: Date.now().toString() + 1,
      type: 'bot',
      message: response,
      timestamp: new Date(),
      suggestions
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  const startVoiceInput = () => {
    setIsListening(true);
    // Simulate voice input
    setTimeout(() => {
      setCurrentMessage("How can I file a water supply complaint?");
      setIsListening(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <Bot className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Smart Assistant</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get instant help with complaints, civic processes, and more. Available 24/7 in Hindi and English.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <Card className="h-[650px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="text-primary-600" size={20} />
                    <span>AI Assistant</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Globe size={16} className="mr-1" />
                      हिंदी
                    </Button>
                  </div>
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
                        <p className="text-xs mt-2 opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                        {message.suggestions && (
                          <div className="mt-3 space-y-1">
                            {message.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="block w-full text-left text-xs px-2 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="text-gray-600" size={16} />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex space-x-1">
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
                  <Button variant="ghost" size="icon">
                    <Mic />
                  </Button>
                  <Button onClick={handleSendMessage} disabled={!currentMessage.trim() || isTyping}>
                    <Send />
                  </Button>
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
                    <div className="flex items-start space-x-3">
                      <item.icon className="text-primary-600 mt-1" size={16} />
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

          <div className="lg:col-span-1 space-y-6">
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