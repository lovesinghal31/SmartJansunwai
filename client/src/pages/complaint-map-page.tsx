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
  Loader2
} from "lucide-react";

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type { Complaint } from "@shared/schema";

interface MapComplaint extends Omit<Complaint, '_id' | 'createdAt' | 'updatedAt'> {
  _id: string; 
  createdAt: string;
  updatedAt: string;
  coordinates: { lat: number; lng: number };
  wardNumber?: number;
  landmark?: string;
}

interface MapStats {
    totalActive: number;
    highPriority: number;
    inProgress: number;
    resolved: number;
}

const defaultIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const getLeafletIcon = (category: string) => {
  return defaultIcon;
};

const MapAutoFitter = ({ complaints }: { complaints: MapComplaint[] }) => {
  const map = useMap();

  useEffect(() => {
    if (complaints.length === 0) {
      map.setView([22.7196, 75.8577], 12); // Default to Indore
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
  const { user } = useAuth(); 
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedWard, setSelectedWard] = useState("all");
  const [searchLocation, setSearchLocation] = useState("");

  const { data: allComplaints = [], isLoading: isLoadingMap } = useQuery<MapComplaint[]>({
    queryKey: ["/api/complaints/map"],
    queryFn: async () => {
        const response = await fetch("http://localhost:8000/api/complaints/map");
        if (!response.ok) {
            throw new Error("Failed to fetch map data from AI service");
        }
        return response.json();
    },
    enabled: !!user,
  });

  const { data: mapStats, isLoading: isLoadingStats } = useQuery<MapStats>({
    queryKey: ["/api/stats/map"],
    queryFn: async () => {
        const response = await fetch("http://localhost:8000/api/stats/map");
        if (!response.ok) {
            throw new Error("Failed to fetch map stats");
        }
        return response.json();
    },
    enabled: !!user,
    placeholderData: { totalActive: 0, highPriority: 0, inProgress: 0, resolved: 0 }
  });

  const filteredComplaints = allComplaints.filter(complaint => {
    const matchesCategory = selectedCategory === "all" || complaint.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || complaint.status === selectedStatus;
    const matchesWard = selectedWard === "all" || (complaint.wardNumber && complaint.wardNumber.toString() === selectedWard);
    const matchesLocation = complaint.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
                              (complaint.landmark && complaint.landmark.toLowerCase().includes(searchLocation.toLowerCase()));
    return matchesCategory && matchesStatus && matchesWard && matchesLocation;
  });

  const wardStats = allComplaints.reduce((acc, complaint) => {
    const ward = complaint.wardNumber;
    if (ward) {
        acc[ward] = (acc[ward] || 0) + 1;
    }
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
                    <div className="text-2xl font-bold text-blue-600">{isLoadingStats ? <Loader2 className="h-6 w-6 mx-auto animate-spin"/> : mapStats?.totalActive}</div>
                    <div className="text-xs text-gray-600">Total Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {isLoadingStats ? <Loader2 className="h-6 w-6 mx-auto animate-spin"/> : mapStats?.highPriority}
                    </div>
                    <div className="text-xs text-gray-600">High Priority</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {isLoadingStats ? <Loader2 className="h-6 w-6 mx-auto animate-spin"/> : mapStats?.inProgress}
                    </div>
                    <div className="text-xs text-gray-600">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {isLoadingStats ? <Loader2 className="h-6 w-6 mx-auto animate-spin"/> : mapStats?.resolved}
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
                    <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
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
                    <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
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
                <Button variant="outline" className="w-full justify-start"><Camera size={16} className="mr-2" /> Photo Complaint</Button>
                <Button variant="outline" className="w-full justify-start"><Navigation size={16} className="mr-2" /> Location-based</Button>
                <Button variant="outline" className="w-full justify-start"><MapPin size={16} className="mr-2" /> Nearby Issues</Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <Card className="h-[700px] overflow-hidden">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Indore Complaint Map</CardTitle>
                  <Badge variant="outline">{filteredComplaints.length} complaints shown</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-full">
                {isLoadingMap ? (
                  <div className="flex items-center justify-center h-full text-gray-500"><Loader2 className="h-6 w-6 animate-spin mr-2"/>Loading Map Data...</div>
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
                        key={complaint._id} 
                        position={[complaint.coordinates.lat, complaint.coordinates.lng]}
                        icon={getLeafletIcon(complaint.category)}
                      >
                        <Popup>
                          <div className="p-1 font-sans">
                            <h4 className="font-bold text-md text-gray-800 mb-1">{complaint.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-2">
                              <span>📍 {complaint.location}</span>
                              <Badge variant="secondary">{complaint.status}</Badge>
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
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
