import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff, Square, Play, Pause, Volume2, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface VoiceRecorderProps {
  onTranscriptionComplete: (data: {
    transcript: string;
    extractedComplaint: string;
    suggestedTitle: string;
    location?: string;
    urgency: "low" | "medium" | "high" | "urgent";
  }) => void;
  isLoading?: boolean;
}

export function VoiceRecorder({ onTranscriptionComplete, isLoading }: VoiceRecorderProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      // Set up audio level monitoring
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start audio level monitoring
      monitorAudioLevel();
      
      toast({
        title: "Recording Started",
        description: "Speak clearly about your complaint",
      });
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      setAudioLevel(0);
      
      toast({
        title: "Recording Stopped",
        description: "Processing your audio...",
      });
    }
  };

  const monitorAudioLevel = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(Math.min(100, (average / 255) * 100));
      
      animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
    }
  };

  const playRecording = () => {
    if (audioBlob && !isPlaying) {
      const url = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(url);
      audioRef.current.play();
      setIsPlaying(true);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const processAudio = async () => {
    if (!audioBlob) return;
    
    setIsProcessing(true);
    
    try {
      // Convert audio to base64 for sending to server
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        // Send to backend for processing
        const response = await fetch('/api/voice/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audio: base64Audio.split(',')[1], // Remove data:audio/webm;base64, prefix
            duration: recordingTime
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          onTranscriptionComplete(result);
          
          toast({
            title: "Voice Processing Complete",
            description: "Your complaint has been extracted from the audio",
          });
        } else {
          throw new Error('Processing failed');
        }
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      toast({
        title: "Processing Error",
        description: "Failed to process audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto" data-testid="voice-recorder">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice Complaint Submission
        </CardTitle>
        <CardDescription>
          Record your complaint using voice. Our AI will extract and structure your feedback automatically.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Recording Controls */}
        <div className="flex justify-center">
          <div className="relative">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing || isLoading}
              className={`h-20 w-20 rounded-full ${isRecording ? 'animate-pulse' : ''}`}
              data-testid={isRecording ? "button-stop-recording" : "button-start-recording"}
            >
              {isRecording ? (
                <Square className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
            
            {isRecording && (
              <div className="absolute -inset-2 rounded-full border-2 border-red-500 animate-ping" />
            )}
          </div>
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="space-y-4">
            <div className="text-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                <Mic className="h-4 w-4 mr-2" />
                Recording: {formatTime(recordingTime)}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Audio Level</span>
                <span>{Math.round(audioLevel)}%</span>
              </div>
              <Progress value={audioLevel} className="h-2" />
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              Speak clearly about your complaint. Include location and details.
            </div>
          </div>
        )}

        {/* Playback Controls */}
        {audioBlob && !isRecording && (
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={playRecording}
                disabled={isProcessing}
                data-testid="button-play-recording"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Play Recording
                  </>
                )}
              </Button>
              
              <Button
                onClick={processAudio}
                disabled={isProcessing || isLoading}
                data-testid="button-process-audio"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Extract Complaint
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              Recording Duration: {formatTime(recordingTime)}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Recording Tips
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Speak clearly and at a normal pace</li>
            <li>• Include specific location details</li>
            <li>• Describe the problem thoroughly</li>
            <li>• Mention any urgency or safety concerns</li>
            <li>• Keep recording under 5 minutes for best results</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}