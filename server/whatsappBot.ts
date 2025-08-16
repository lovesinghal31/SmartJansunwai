import { storage } from "./storage";

// WhatsApp conversation state management
interface ConversationState {
  phoneNumber: string;
  step: 'idle' | 'collecting_description' | 'collecting_location' | 'collecting_password' | 'checking_status';
  complaintData?: {
    description: string;
    category?: string;
    priority?: string;
    location?: string;
    password?: string;
  };
}

// In-memory conversation storage (use Redis in production)
const conversations = new Map<string, ConversationState>();

// AI analysis function (simplified version)
async function analyzeComplaint(description: string): Promise<{
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  isValid: boolean;
}> {
  // Simplified AI logic - in production, use Gemini API like in your web app
  const lowerDesc = description.toLowerCase();
  
  let category = 'general';
  let priority: 'Low' | 'Medium' | 'High' = 'Medium';
  
  // Category detection
  if (lowerDesc.includes('road') || lowerDesc.includes('pothole') || lowerDesc.includes('traffic')) {
    category = 'road-transportation';
  } else if (lowerDesc.includes('water') || lowerDesc.includes('pipe') || lowerDesc.includes('leak')) {
    category = 'water-supply';
  } else if (lowerDesc.includes('electric') || lowerDesc.includes('power') || lowerDesc.includes('light')) {
    category = 'electricity';
  } else if (lowerDesc.includes('garbage') || lowerDesc.includes('waste') || lowerDesc.includes('clean')) {
    category = 'sanitation';
  } else if (lowerDesc.includes('street light') || lowerDesc.includes('lamp')) {
    category = 'street-lighting';
  } else if (lowerDesc.includes('smell') || lowerDesc.includes('noise') || lowerDesc.includes('pollution')) {
    category = 'noise-pollution';
  }
  
  // Priority detection
  if (lowerDesc.includes('urgent') || lowerDesc.includes('emergency') || lowerDesc.includes('danger') || 
      lowerDesc.includes('smell') || lowerDesc.includes('sick') || lowerDesc.includes('health')) {
    priority = 'High';
  } else if (lowerDesc.includes('broken') || lowerDesc.includes('problem') || lowerDesc.includes('issue')) {
    priority = 'Medium';
  } else {
    priority = 'Low';
  }
  
  return {
    category,
    priority,
    isValid: description.length > 10 // Basic validation
  };
}

// Generate WhatsApp complaint ID
function generateWhatsAppComplaintId(): string {
  const timestamp = Date.now().toString().slice(-6); // Use last 6 digits for better uniqueness
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `WACMP-${timestamp}${random}`;
}

// Check if string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Main message handler
export async function handleWhatsAppMessage(phoneNumber: string, message: string): Promise<string> {
  const conversation = conversations.get(phoneNumber) || {
    phoneNumber,
    step: 'idle'
  };
  
  const lowerMessage = message.toLowerCase().trim();
  
  try {
    switch (conversation.step) {
      case 'idle':
        // Check for greetings or complaint filing intent
        if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
          return "Welcome to the Smart Grievance System! How can I help you today? You can say 'file a complaint' or 'check status'.";
        }
        
        // Check for complaint filing
        if (lowerMessage.includes('file') || lowerMessage.includes('complain') || lowerMessage.includes('problem') || 
            lowerMessage.includes('issue') || lowerMessage.length > 20) {
          // If it's a long message, treat it as a complaint description
          if (lowerMessage.length > 20) {
            const analysis = await analyzeComplaint(message);
            if (!analysis.isValid) {
              return "I'm sorry, I didn't understand. You can say 'file a complaint' or 'check status'.";
            }
            
            conversation.step = 'collecting_location';
            conversation.complaintData = {
              description: message,
              category: analysis.category,
              priority: analysis.priority
            };
            conversations.set(phoneNumber, conversation);
            
            return `Got it. I've categorized this as a '${analysis.category}' issue with '${analysis.priority}' priority. What is the location of this issue?`;
          } else {
            conversation.step = 'collecting_description';
            conversations.set(phoneNumber, conversation);
            return "Please describe your complaint in detail.";
          }
        }
        
        // Check for status inquiry
        if (lowerMessage.includes('status') || lowerMessage.includes('check') || isValidUUID(message)) {
          if (isValidUUID(message)) {
            return await checkComplaintStatus(message);
          }
          conversation.step = 'checking_status';
          conversations.set(phoneNumber, conversation);
          return "To check the status of a complaint, please provide your Complaint ID.";
        }
        
        return "I'm sorry, I didn't understand. You can say 'file a complaint' or 'check status'.";
        
      case 'collecting_description':
        const analysis = await analyzeComplaint(message);
        if (!analysis.isValid) {
          return "Please provide a more detailed description of your complaint.";
        }
        
        conversation.step = 'collecting_location';
        conversation.complaintData = {
          description: message,
          category: analysis.category,
          priority: analysis.priority
        };
        conversations.set(phoneNumber, conversation);
        
        return `Got it. I've categorized this as a '${analysis.category}' issue with '${analysis.priority}' priority. What is the location of this issue?`;
        
      case 'collecting_location':
        if (!conversation.complaintData) {
          conversation.step = 'idle';
          conversations.set(phoneNumber, conversation);
          return "Something went wrong. Please start again.";
        }
        
        conversation.complaintData.location = message;
        conversation.step = 'collecting_password';
        conversations.set(phoneNumber, conversation);
        
        return "Thank you. Finally, please set a simple password to secure this complaint.";
        
      case 'collecting_password':
        if (!conversation.complaintData) {
          conversation.step = 'idle';
          conversations.set(phoneNumber, conversation);
          return "Something went wrong. Please start again.";
        }
        
        if (message.length < 6) {
          return "Password must be at least 6 characters long. Please try again.";
        }
        
        conversation.complaintData.password = message;
        
        // Create the complaint
        const complaintId = await createWhatsAppComplaint(phoneNumber, conversation.complaintData);
        
        // Reset conversation
        conversation.step = 'idle';
        conversation.complaintData = undefined;
        conversations.set(phoneNumber, conversation);
        
        return `Excellent! Your complaint has been filed. Your Complaint ID is: ${complaintId}. Please save this ID.`;
        
      case 'checking_status':
        if (isValidUUID(message)) {
          conversation.step = 'idle';
          conversations.set(phoneNumber, conversation);
          return await checkComplaintStatus(message);
        }
        return "Please provide a valid Complaint ID (UUID format).";
        
      default:
        conversation.step = 'idle';
        conversations.set(phoneNumber, conversation);
        return "Welcome to the Smart Grievance System! How can I help you today? You can say 'file a complaint' or 'check status'.";
    }
  } catch (error) {
    console.error('WhatsApp bot error:', error);
    conversation.step = 'idle';
    conversations.set(phoneNumber, conversation);
    return "Sorry, something went wrong. Please try again.";
  }
}

// Create complaint from WhatsApp
async function createWhatsAppComplaint(phoneNumber: string, complaintData: any): Promise<string> {
  const complaint = {
    citizenId: phoneNumber, // Use phone number as citizen ID
    name: `WhatsApp User ${phoneNumber.slice(-4)}`, // Default name
    contact: phoneNumber,
    title: complaintData.description.substring(0, 50) + (complaintData.description.length > 50 ? '...' : ''),
    description: complaintData.description,
    category: complaintData.category,
    location: complaintData.location,
    priority: complaintData.priority.toLowerCase(),
    status: 'submitted' as const,
    password: complaintData.password,
    aiAnalysis: {
      priority: complaintData.priority,
      isComplaintValid: true,
      suggestedCategory: complaintData.category,
      estimatedResolutionDays: complaintData.priority === 'High' ? 3 : complaintData.priority === 'Medium' ? 7 : 14
    }
  };
  
  const result = await storage.createComplaint(complaint);
  return result.id;
}

// Check complaint status
async function checkComplaintStatus(complaintId: string): Promise<string> {
  try {
    const complaint = await storage.getComplaint(complaintId);
    if (!complaint) {
      return "Complaint not found. Please check your Complaint ID.";
    }
    
    const statusMap: Record<string, string> = {
      'submitted': 'Submitted - Your complaint has been received and is being reviewed.',
      'in-progress': 'In Progress - Your complaint is being worked on by the concerned department.',
      'under-review': 'Under Review - Your complaint is being evaluated by officials.',
      'resolved': 'Resolved - Your complaint has been successfully resolved.'
    };
    
    const statusText = statusMap[complaint.status] || 'Status unknown';
    return `Complaint ${complaintId} Status: ${statusText}`;
  } catch (error) {
    console.error('Status check error:', error);
    return "Checking status for complaint " + complaintId + "... (This feature is in development).";
  }
}

// Clean up old conversations (call this periodically)
export function cleanupOldConversations() {
  // Remove conversations older than 1 hour
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  // Use Array.from to iterate over Map entries
  Array.from(conversations.entries()).forEach(([phoneNumber, conversation]) => {
    // In a real implementation, you'd track conversation timestamps
    // For now, just keep the conversations
  });
}
