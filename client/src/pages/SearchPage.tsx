import { SmartSearch } from "@/components/smart-search";
import { useLocation } from "wouter";

export default function SearchPage() {
  const [, navigate] = useLocation();

  const handleResultSelect = (result: any) => {
    if (result.type === 'complaint') {
      navigate(`/complaints/${result.id}`);
    } else {
      navigate(`/feedback/${result.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Smart Search & Discovery
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find complaints, track progress, and discover insights with our AI-powered search system
          </p>
        </div>
        
        <SmartSearch onResultSelect={handleResultSelect} />
      </div>
    </div>
  );
}