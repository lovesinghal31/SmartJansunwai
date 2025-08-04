import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function classifyComplaint(text: string): Promise<{
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  department: string;
  confidence: number;
  suggestedActions: string[];
}> {
  try {
    const prompt = `Analyze this citizen complaint and classify it:

Complaint: "${text}"

Classify into one of these categories:
- water_supply: Water supply, sewerage, drainage issues
- roads: Road repairs, potholes, traffic issues
- electricity: Power outages, electrical problems
- sanitation: Waste management, cleanliness
- street_lighting: Street lights, public lighting
- parks: Parks, gardens, recreational facilities
- administration: Administrative services, documentation
- online_services: Website, app, digital service issues
- noise_pollution: Noise complaints
- property_tax: Property tax related issues
- other: Other municipal services

Determine priority based on urgency and public impact:
- urgent: Emergency situations affecting public safety
- high: Significant issues requiring immediate attention
- medium: Important but not urgent matters
- low: Minor issues or suggestions

Suggest department and actionable steps.

Respond with JSON in this format:
{
  "category": "category_name",
  "priority": "priority_level",
  "department": "department_name",
  "confidence": 0.95,
  "suggestedActions": ["action1", "action2"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            category: { type: "string" },
            priority: { type: "string" },
            department: { type: "string" },
            confidence: { type: "number" },
            suggestedActions: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["category", "priority", "department", "confidence", "suggestedActions"]
        }
      },
      contents: prompt,
    });

    const result = JSON.parse(response.text || "{}");
    return {
      category: result.category || "other",
      priority: result.priority || "medium",
      department: result.department || "General Administration",
      confidence: result.confidence || 0.5,
      suggestedActions: result.suggestedActions || []
    };
  } catch (error) {
    console.error("Error classifying complaint:", error);
    return {
      category: "other",
      priority: "medium",
      department: "General Administration",
      confidence: 0.1,
      suggestedActions: ["Manual review required"]
    };
  }
}

export async function generateResponseSuggestion(complaint: string, updates: string[]): Promise<string> {
  try {
    const prompt = `As a government official, generate a professional response for this citizen complaint:

Complaint: "${complaint}"
Previous Updates: ${updates.join(", ")}

Generate a helpful, empathetic, and actionable response that:
1. Acknowledges the citizen's concern
2. Explains the current status or next steps
3. Provides a realistic timeline if possible
4. Maintains a professional and caring tone
5. Includes any relevant contact information or reference numbers

Keep the response concise but comprehensive (150-250 words).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Thank you for your complaint. We are reviewing it and will respond soon.";
  } catch (error) {
    console.error("Error generating response:", error);
    return "Thank you for your complaint. We are reviewing it and will respond soon.";
  }
}

export async function extractComplaintFromVoice(transcript: string): Promise<{
  extractedComplaint: string;
  suggestedTitle: string;
  location?: string;
  urgency: "low" | "medium" | "high" | "urgent";
}> {
  try {
    const prompt = `Extract and structure a complaint from this voice transcript:

Transcript: "${transcript}"

Extract:
1. The main complaint in clear, structured text
2. A concise title for the complaint
3. Any mentioned location/address
4. Urgency level based on tone and content

Respond with JSON:
{
  "extractedComplaint": "structured complaint text",
  "suggestedTitle": "Brief descriptive title",
  "location": "address if mentioned",
  "urgency": "urgency_level"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            extractedComplaint: { type: "string" },
            suggestedTitle: { type: "string" },
            location: { type: "string" },
            urgency: { type: "string" }
          },
          required: ["extractedComplaint", "suggestedTitle", "urgency"]
        }
      },
      contents: prompt,
    });

    const result = JSON.parse(response.text || "{}");
    return {
      extractedComplaint: result.extractedComplaint || transcript,
      suggestedTitle: result.suggestedTitle || "Voice Complaint",
      location: result.location,
      urgency: result.urgency || "medium"
    };
  } catch (error) {
    console.error("Error extracting complaint from voice:", error);
    return {
      extractedComplaint: transcript,
      suggestedTitle: "Voice Complaint",
      urgency: "medium"
    };
  }
}

export async function generateComplaintSuggestions(partialText: string): Promise<string[]> {
  try {
    const prompt = `Based on this partial complaint text, suggest 3-5 ways to complete or improve it:

Partial text: "${partialText}"

Provide helpful suggestions that:
1. Complete the thought if it seems incomplete
2. Add relevant details that might be missing
3. Improve clarity and specificity
4. Include location details if missing
5. Suggest timeline information if relevant

Return as a JSON array of suggestion strings.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: { type: "string" }
        }
      },
      contents: prompt,
    });

    const suggestions = JSON.parse(response.text || "[]");
    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return [];
  }
}

export async function summarizeComplaintTrends(complaints: Array<{title: string, description: string, category: string, createdAt: Date}>): Promise<string> {
  try {
    const prompt = `Analyze these recent complaints and provide insights:

${complaints.map(c => `Category: ${c.category}, Title: ${c.title}, Date: ${c.createdAt.toDateString()}`).join('\n')}

Provide a brief analysis (2-3 paragraphs) covering:
1. Most common complaint categories
2. Emerging trends or patterns
3. Recommendations for city administration
4. Any urgent areas requiring attention`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });

    return response.text || "Insufficient data for trend analysis.";
  } catch (error) {
    console.error("Error summarizing trends:", error);
    return "Error analyzing complaint trends.";
  }
}