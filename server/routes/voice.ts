import { Router } from 'express';
import { extractComplaintFromVoice } from '../gemini';

const router = Router();

// Simulated speech-to-text function (in real implementation, you'd use a service like Google Speech-to-Text)
async function speechToText(audioBase64: string): Promise<string> {
  // This is a placeholder - in a real implementation, you would:
  // 1. Convert base64 to audio file
  // 2. Send to speech-to-text service (Google Cloud Speech, Azure, etc.)
  // 3. Return the transcript
  
  // For demo purposes, return a sample transcript
  const sampleTranscripts = [
    "There is a big pothole on MG Road near the bus station that has been causing accidents. It needs immediate repair as it's very dangerous for vehicles and pedestrians.",
    "The street lights on Residency Road have been out for the past week. It's making the area unsafe at night and needs urgent attention.",
    "There is garbage accumulating near the park entrance for the past few days. The smell is getting worse and it's attracting flies and rats.",
    "Water supply has been disrupted in our area for two days now. We need immediate restoration as people are facing severe difficulties.",
    "The traffic signal at the main intersection is not working properly. It's causing traffic jams and potential accidents during rush hours."
  ];
  
  return sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
}

router.post('/process', async (req, res) => {
  try {
    const { audio, duration } = req.body;
    
    if (!audio) {
      return res.status(400).json({ error: 'No audio data provided' });
    }
    
    // Convert audio to text (placeholder implementation)
    const transcript = await speechToText(audio);
    
    // Extract complaint details using Gemini AI
    const extractedData = await extractComplaintFromVoice(transcript);
    
    res.json({
      transcript,
      ...extractedData,
      duration,
      processedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Voice processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process voice recording',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;