import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Map, 
  MapPin, 
  Filter, 
  Search, 
  Layers,
  ZoomIn,
  ZoomOut,
  Locate,
  AlertTriangle,
  Clock,
  CheckCircle,
  Navigation,
  QrCode,
  Camera
} from "lucide-react";
import type { Complaint } from "@shared/schema";

interface MapComplaint extends Complaint {
  coordinates: { lat: number; lng: number };
  wardNumber: number;
  landmark: string;
}

export default function ComplaintMapPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedWard, setSelectedWard] = useState("all");
  const [searchLocation, setSearchLocation] = useState("");
  const [mapView, setMapView] = useState<"satellite" | "street" | "hybrid">("street");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<MapComplaint | null>(null);

  // Mock data for demonstration - in real implementation, this would come from API
  const { data: complaints = [] } = useQuery<Complaint[]>({
    queryKey: ["/api/complaints"],
    enabled: !!user,
  });

  // Enhanced mock data with geographical coordinates
  const mapComplaints: MapComplaint[] = [
    {
      id: "1",
      citizenId: "user1",
      title: "Pothole on MG Road",
      description: "Large pothole causing traffic issues",
      category: "road-transportation",
      location: "MG Road, near Palasia Square",
      priority: "high",
      status: "in-progress",
      assignedTo: null,
      attachments: null,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-16"),
      coordinates: { lat: 22.7196, lng: 75.8577 },
      wardNumber: 12,
      landmark: "Palasia Square"
    },
    {
      id: "2",
      citizenId: "user2",
      title: "Water supply disruption",
      description: "No water supply for 3 days",
      category: "water-supply",
      location: "Vijay Nagar, Sector 1",
      priority: "high",
      status: "submitted",
      assignedTo: null,
      attachments: null,
      createdAt: new Date("2024-01-14"),
      updatedAt: new Date("2024-01-14"),
      coordinates: { lat: 22.7532, lng: 75.8937 },
      wardNumber: 8,
      landmark: "Vijay Nagar Main Road"
    },
    {
      id: "3",
      citizenId: "user3",
      title: "Street light not working",
      description: "Street light pole #SL-456 not functioning",
      category: "street-lighting",
      location: "AB Road, near Geeta Bhawan",
      priority: "medium",
      status: "resolved",
      assignedTo: null,
      attachments: null,
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-12"),
      coordinates: { lat: 22.7074, lng: 75.8723 },
      wardNumber: 15,
      landmark: "Geeta Bhawan"
    },
    {
      id: "4",
      citizenId: "user4",
      title: "Garbage not collected",
      description: "Waste accumulation for over a week",
      category: "sanitation",
      location: "Rau Pithampur Road, Ward 22",
      priority: "medium",
      status: "under-review",
      assignedTo: null,
      attachments: null,
      createdAt: new Date("2024-01-13"),
      updatedAt: new Date("2024-01-15"),
      coordinates: { lat: 22.6244, lng: 75.8306 },
      wardNumber: 22,
      landmark: "Rau Bus Stand"
    },
    {
      id: "5",
      citizenId: "user5",
      title: "Park maintenance required",
      description: "Broken swings and overgrown grass",
      category: "parks-recreation",
      location: "Nehru Park, C-Sector",
      priority: "low",
      status: "in-progress",
      assignedTo: null,
      attachments: null,
      createdAt: new Date("2024-01-11"),
      updatedAt: new Date("2024-01-14"),
      coordinates: { lat: 22.7283, lng: 75.8547 },
      wardNumber: 10,
      landmark: "Nehru Park Main Gate"
    }
  ];

  const filteredComplaints = mapComplaints.filter(complaint => {
    const matchesCategory = selectedCategory === "all" || complaint.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || complaint.status === selectedStatus;
    const matchesWard = selectedWard === "all" || complaint.wardNumber.toString() === selectedWard;
    const matchesLocation = complaint.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
                           complaint.landmark.toLowerCase().includes(searchLocation.toLowerCase());
    return matchesCategory && matchesStatus && matchesWard && matchesLocation;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-blue-500";
      case "in-progress": return "bg-yellow-500";
      case "under-review": return "bg-purple-500";
      case "resolved": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertTriangle className="text-red-500" size={16} />;
      case "medium": return <Clock className="text-yellow-500" size={16} />;
      case "low": return <CheckCircle className="text-green-500" size={16} />;
      default: return null;
    }
  };

  const wardStats = mapComplaints.reduce((acc, complaint) => {
    const ward = complaint.wardNumber;
    acc[ward] = (acc[ward] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const categoryStats = mapComplaints.reduce((acc, complaint) => {
    acc[complaint.category] = (acc[complaint.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <Map className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Interactive Complaint Map</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Visualize complaints across Indore with real-time mapping, heatmap analysis, and location-based insights.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Map Controls & Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Live Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{mapComplaints.length}</div>
                    <div className="text-xs text-gray-600">Total Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {mapComplaints.filter(c => c.priority === "high").length}
                    </div>
                    <div className="text-xs text-gray-600">High Priority</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {mapComplaints.filter(c => c.status === "in-progress").length}
                    </div>
                    <div className="text-xs text-gray-600">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {mapComplaints.filter(c => c.status === "resolved").length}
                    </div>
                    <div className="text-xs text-gray-600">Resolved</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter Complaints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Search Location</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      placeholder="Search area, landmark..."
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="road-transportation">Roads & Transportation</SelectItem>
                      <SelectItem value="water-supply">Water Supply</SelectItem>
                      <SelectItem value="electricity">Electricity</SelectItem>
                      <SelectItem value="sanitation">Sanitation</SelectItem>
                      <SelectItem value="street-lighting">Street Lighting</SelectItem>
                      <SelectItem value="parks-recreation">Parks & Recreation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="submitted">New</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="under-review">Under Review</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Ward</label>
                  <Select value={selectedWard} onValueChange={setSelectedWard}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Wards" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Wards</SelectItem>
                      {Array.from(new Set(mapComplaints.map(c => c.wardNumber))).sort().map(ward => (
                        <SelectItem key={ward} value={ward.toString()}>
                          Ward {ward} ({wardStats[ward]} complaints)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Map Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Map Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Map View</label>
                  <Select value={mapView} onValueChange={(value: "satellite" | "street" | "hybrid") => setMapView(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="street">Street View</SelectItem>
                      <SelectItem value="satellite">Satellite</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Heatmap</span>
                  <Button
                    variant={showHeatmap ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowHeatmap(!showHeatmap)}
                  >
                    <Layers size={16} className="mr-1" />
                    {showHeatmap ? "Hide" : "Show"}
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm">
                    <ZoomIn size={16} />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ZoomOut size={16} />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Locate size={16} />
                  </Button>
                </div>

                <Button variant="outline" className="w-full">
                  <QrCode size={16} className="mr-2" />
                  Scan QR Code
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Camera size={16} className="mr-2" />
                  Photo Complaint
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Navigation size={16} className="mr-2" />
                  Location-based
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin size={16} className="mr-2" />
                  Nearby Issues
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Map Area */}
          <div className="lg:col-span-3">
            <Card className="h-[700px]">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Indore Complaint Map</CardTitle>
                  <div className="flex space-x-2">
                    <Badge variant="outline">{filteredComplaints.length} complaints shown</Badge>
                    <Button variant="outline" size="sm">
                      <Download size={16} className="mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-full">
                {/* Map Container - In real implementation, this would contain Leaflet/Mapbox */}
                <div className="relative w-full h-full bg-gradient-to-br from-green-100 to-blue-100 overflow-hidden">
                  {/* Map Background Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" className="text-gray-300">
                      <defs>
                        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>

                  {/* Simulated Map Points */}
                  <div className="absolute inset-0 p-8">
                    {filteredComplaints.map((complaint, index) => {
                      const x = (complaint.coordinates.lng - 75.8) * 1000 + 200 + (index * 50);
                      const y = (22.8 - complaint.coordinates.lat) * 1000 + 100 + (index * 40);
                      
                      return (
                        <div
                          key={complaint.id}
                          className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                          style={{ left: `${x}px`, top: `${y}px` }}
                          onClick={() => setSelectedComplaint(complaint)}
                        >
                          <div className={`w-6 h-6 rounded-full ${getStatusColor(complaint.status)} shadow-lg border-2 border-white flex items-center justify-center animate-pulse`}>
                            {getPriorityIcon(complaint.priority)}
                          </div>
                          {selectedComplaint?.id === complaint.id && (
                            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 min-w-64 z-10">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <h4 className="font-medium text-gray-900 text-sm">{complaint.title}</h4>
                                  <Badge className={`text-xs ${getStatusColor(complaint.status).replace('bg-', 'bg-opacity-20 text-')}`}>
                                    {complaint.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600">{complaint.description}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>📍 {complaint.landmark}</span>
                                  <span>Ward {complaint.wardNumber}</span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t">
                                  <span className="text-xs text-gray-500">
                                    {new Date(complaint.createdAt).toLocaleDateString()}
                                  </span>
                                  <Button size="sm" variant="outline" className="text-xs h-6">
                                    View Details
                                  </Button>
                                </div>
                              </div>
                              {/* Pointer */}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Map Legend */}
                  <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 text-sm">Legend</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>New Complaints</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>In Progress</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span>Under Review</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Resolved</span>
                      </div>
                    </div>
                  </div>

                  {/* Map Info */}
                  <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">Indore Smart City</div>
                      <div className="text-sm text-gray-600">Complaint Mapping System</div>
                      <div className="text-xs text-gray-500 mt-2">
                        Last updated: {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  {/* Heatmap Overlay */}
                  {showHeatmap && (
                    <div className="absolute inset-0 bg-gradient-radial from-red-200 via-yellow-100 to-transparent opacity-30"></div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ward Statistics */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Ward-wise Complaint Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(wardStats).map(([ward, count]) => (
                <div key={ward} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">Ward {ward}</div>
                  <div className="text-sm text-gray-600">{count} complaints</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(count / Math.max(...Object.values(wardStats))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}