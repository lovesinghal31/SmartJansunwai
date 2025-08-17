import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Map as MapIcon, 
  MapPin, 
  Search, 
  Layers,
  AlertTriangle,
  Clock,
  CheckCircle,
  Navigation,
  QrCode,
  Camera,
  Download,
} from "lucide-react";

// --- STEP 1: Import Leaflet components, hooks, AND STYLESHEET ---
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css'; // This is the crucial fix for rendering issues.

import type { Complaint } from "@shared/schema";

interface MapComplaint extends Complaint {
  coordinates: { lat: number; lng: number };
  wardNumber: number;
  landmark: string;
}

// Type for category fetched from backend
interface CategoryOption {
  name: string;
  id: string;
  slug: string;
}

// Type for status options from backend
interface StatusOption {
  value: string;
  label: string;
  displayLabel: string;
}

const getLeafletIcon = (category: string) => {
  const basePath = "/icons/";
  let iconUrl = `${basePath}default-pin.svg`;

  switch (category) {
    case "road-transportation":
      iconUrl = `${basePath}road-icon.svg`;
      break;
    case "water-supply":
      iconUrl = `${basePath}water-icon.svg`;
      break;
    case "sanitation":
      iconUrl = `${basePath}sanitation-icon.svg`;
      break;
    case "street-lighting":
      iconUrl = `${basePath}light-icon.svg`;
      break;
    case "parks-recreation":
      iconUrl = `${basePath}park-icon.svg`;
      break;
    case "electricity":
      iconUrl = `${basePath}electricity-icon.svg`;
      break;
  }

  return new L.Icon({
    iconUrl: iconUrl,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
  });
};

const MapAutoFitter = ({ complaints }: { complaints: MapComplaint[] }) => {
  const map = useMap();

  useEffect(() => {
    if (complaints.length === 0) {
      map.setView([22.7196, 75.8577], 12);
      return;
    }

    const markerBounds = L.latLngBounds(
      complaints.map(c => [c.coordinates.lat, c.coordinates.lng])
    );
    
    map.fitBounds(markerBounds, { padding: [50, 50] });
  }, [complaints, map]);

  return null;
};


export default function ComplaintMapPage() {
  const { user, accessToken } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedWard, setSelectedWard] = useState("all");
  const [searchLocation, setSearchLocation] = useState("");

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (err: any) {
        setCategoriesError(err.message || "Unknown error");
      } finally {
        setCategoriesLoading(false);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchStatusOptions() {
      setStatusLoading(true);
      setStatusError(null);
      try {
        const res = await fetch("/api/status-options");
        if (!res.ok) throw new Error("Failed to fetch status options");
        const data = await res.json();
        setStatusOptions(data);
      } catch (err: any) {
        setStatusError(err.message || "Unknown error");
      } finally {
        setStatusLoading(false);
      }
    }
    fetchStatusOptions();
  }, []);

  const { data: complaintsFromApi = [], isLoading, error: complaintsError } = useQuery<MapComplaint[]>({
    queryKey: ["/api/complaints"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/complaints", undefined, accessToken);
      if (!res.ok) throw new Error("Failed to fetch complaints");
      return res.json();
    },
    enabled: !!user && !!accessToken,
  });

  // Use API data directly - no fallback to mock data
  const complaintsToDisplay = complaintsFromApi;

  const filteredComplaints = complaintsToDisplay.filter(complaint => {
    const matchesCategory = selectedCategory === "all" || complaint.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || complaint.status === selectedStatus;
    const matchesWard = selectedWard === "all" || complaint.wardNumber.toString() === selectedWard;
    const matchesLocation = complaint.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
                            (complaint.landmark && complaint.landmark.toLowerCase().includes(searchLocation.toLowerCase()));
    return matchesCategory && matchesStatus && matchesWard && matchesLocation;
  });

  const wardStats = complaintsToDisplay.reduce((acc, complaint) => {
    const ward = complaint.wardNumber;
    acc[ward] = (acc[ward] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const indoreBounds: LatLngBoundsExpression = [
    [22.4, 75.6], // Southwest corner
    [23.0, 76.1]  // Northeast corner
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <MapIcon className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Interactive Complaint Map</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Visualize complaints across Indore with real-time mapping, powered by OpenStreetMap.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Live Statistics</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{complaintsToDisplay.length}</div>
                    <div className="text-xs text-gray-600">Total Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {complaintsToDisplay.filter(c => c.priority === "high").length}
                    </div>
                    <div className="text-xs text-gray-600">High Priority</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {complaintsToDisplay.filter(c => c.status === "in-progress").length}
                    </div>
                    <div className="text-xs text-gray-600">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {complaintsToDisplay.filter(c => c.status === "resolved").length}
                    </div>
                    <div className="text-xs text-gray-600">Resolved</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Filter Complaints</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Search Location</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input placeholder="Search area, landmark..." value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} className="pl-10"/>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger><SelectValue placeholder={categoriesLoading ? "Loading..." : "All Categories"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categoriesLoading && <div className="p-2 text-gray-500">Loading...</div>}
                      {categoriesError && <div className="p-2 text-red-500">{categoriesError}</div>}
                      {!categoriesLoading && !categoriesError && categories.map((cat) => (
                        <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger><SelectValue placeholder={statusLoading ? "Loading..." : "All Status"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {statusLoading && <div className="p-2 text-gray-500">Loading...</div>}
                      {statusError && <div className="p-2 text-red-500">{statusError}</div>}
                      {!statusLoading && !statusError && statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>{status.displayLabel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Ward</label>
                  <Select value={selectedWard} onValueChange={setSelectedWard}>
                    <SelectTrigger><SelectValue placeholder="All Wards" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Wards</SelectItem>
                      {Object.keys(wardStats).sort((a, b) => parseInt(a) - parseInt(b)).map(ward => (
                        <SelectItem key={ward} value={ward}>Ward {ward} ({wardStats[parseInt(ward)]})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Camera size={16} className="mr-2" /> Photo Complaint
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Navigation size={16} className="mr-2" /> Location-based
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin size={16} className="mr-2" /> Nearby Issues
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* --- FIX: The right column now contains the map AND the ward stats --- */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="h-[700px] overflow-hidden">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Indore Complaint Map</CardTitle>
                  <Badge variant="outline">{filteredComplaints.length} complaints shown</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-full">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full text-gray-500">Loading Map Data...</div>
                ) : complaintsError ? (
                  <div className="flex items-center justify-center h-full text-red-500">
                    Error loading complaints: {complaintsError.message}
                  </div>
                ) : (
                  <MapContainer 
                    center={[22.7196, 75.8577]}
                    zoom={12}
                    scrollWheelZoom={true} 
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                    maxBounds={indoreBounds}
                    maxBoundsViscosity={1.0}
                    minZoom={11}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {filteredComplaints.map((complaint) => (
                      <Marker 
                        key={complaint.id} 
                        position={[complaint.coordinates.lat, complaint.coordinates.lng]}
                        icon={getLeafletIcon(complaint.category)}
                      >
                        <Popup>
                          <div className="p-1 font-sans">
                            <h4 className="font-bold text-md text-gray-800 mb-1">{complaint.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-2">
                              <span>📍 {complaint.landmark}</span>
                              <Badge variant="secondary">Ward {complaint.wardNumber}</Badge>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                    <MapAutoFitter complaints={filteredComplaints} />
                  </MapContainer>
                )}
              </CardContent>
            </Card>

            {/* --- FIX: Ward-wise stats card is now here, below the map --- */}
            <Card>
              <CardHeader><CardTitle>Ward-wise Complaint Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Object.entries(wardStats).map(([ward, count]) => (
                    <div key={ward} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">Ward {ward}</div>
                      <div className="text-sm text-gray-600">{count as number} complaints</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${((count as number) / Math.max(...Object.values(wardStats))) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
