import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AISuggestionsProps {
  partialText: string;
  onSuggestionSelect: (suggestion: string) => void;
  onApplySuggestion?: (suggestion: string) => void;
}

export function AISuggestions({ partialText, onSuggestionSelect, onApplySuggestion }: AISuggestionsProps) {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (partialText.length > 20) {
      fetchSuggestions(partialText);
    } else {
      setSuggestions([]);
    }
  }, [partialText]);

  const fetchSuggestions = async (text: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = (suggestion: string) => {
    onApplySuggestion?.(suggestion);
    setAppliedSuggestions(prev => new Set([...Array.from(prev), suggestion]));
  };

  if (suggestions.length === 0 && !loading) return null;

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50/30" data-testid="ai-suggestions">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
          <Sparkles className="h-4 w-4" />
          AI Writing Assistance
        </CardTitle>
        <CardDescription className="text-xs">
          Smart suggestions to improve your complaint
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            Generating suggestions...
          </div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => {
              const isApplied = appliedSuggestions.has(suggestion);
              
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-all ${
                    isApplied 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                  data-testid={`suggestion-${index}`}
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                      isApplied ? 'text-green-600' : 'text-blue-600'
                    }`} />
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {suggestion}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      {isApplied ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Applied
                        </Badge>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onSuggestionSelect(suggestion)}
                            className="text-xs"
                            data-testid={`button-use-suggestion-${index}`}
                          >
                            Use
                          </Button>
                          {onApplySuggestion && (
                            <Button
                              size="sm"
                              onClick={() => handleApplySuggestion(suggestion)}
                              className="text-xs bg-blue-600 hover:bg-blue-700"
                              data-testid={`button-apply-suggestion-${index}`}
                            >
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground pt-2 border-t">
          💡 Tip: The more details you provide, the better suggestions we can offer
        </div>
      </CardContent>
    </Card>
  );
}