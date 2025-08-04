import { EnhancedComplaintForm } from "@/components/enhanced-complaint-form";
import { useLocation } from "wouter";

export default function NewComplaintPage() {
  const [, navigate] = useLocation();

  const handleSuccess = () => {
    navigate("/complaints");
  };

  const handleCancel = () => {
    navigate("/complaints");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="container mx-auto px-4">
        <EnhancedComplaintForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
}