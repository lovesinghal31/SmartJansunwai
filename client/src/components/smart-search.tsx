import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Tag, 
  TrendingUp,
  Clock,
  User,
  FileText,
  Star,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react";

interface SmartSearchProps {
  onResultSelect?: (result: any) => void;
  placeholder?: string;
  searchType?: "complaints" | "feedback" | "all";
}

export function SmartSearch({ onResultSelect, placeholder = "Search complaints, locations, or ask questions...", searchType = "all" }: SmartSearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    priority: "",
    status: "",
    dateRange: "",
    location: ""
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Smart search with AI-powered suggestions
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["/api/search", query, filters],
    enabled: query.length >= 3,
    refetchOnWindowFocus: false,
  });

  // Popular search terms and quick filters
  const popularSearches = [
    "pothole on MG Road",
    "water supply disruption",
    "street light not working",
    "garbage collection delay",
    "traffic signal malfunction",
    "park maintenance"
  ];

  const quickFilters = [
    { label: "Recent", value: "recent", icon: Clock },
    { label: "High Priority", value: "high-priority", icon: TrendingUp },
    { label: "Near Me", value: "location", icon: MapPin },
    { label: "Resolved", value: "resolved", icon: Star },
  ];

  // Generate smart suggestions based on input
  useEffect(() => {
    if (query.length >= 2) {
      const smartSuggestions = [
        `${query} in your area`,
        `Recent ${query} complaints`,
        `${query} status updates`,
        `Similar to ${query}`,
        `${query} resolution time`
      ];
      setSuggestions(smartSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      // Trigger search logic here
      console.log("Searching for:", finalQuery, "with filters:", filters);
    }
  };

  const handleQuickFilter = (filterValue: string) => {
    setFilters(prev => ({ ...prev, quickFilter: filterValue }));
    handleSearch();
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      priority: "",
      status: "",
      dateRange: "",
      location: ""
    });
  };

  const MockSearchResult = ({ result }: { result: any }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onResultSelect?.(result)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={result.type === 'complaint' ? 'default' : 'secondary'}>
                {result.type}
              </Badge>
              <Badge variant={result.priority === 'high' ? 'destructive' : result.priority === 'medium' ? 'secondary' : 'outline'}>
                {result.priority}
              </Badge>
              <span className="text-sm text-muted-foreground">{result.date}</span>
            </div>
            <h3 className="font-medium mb-1">{result.title}</h3>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{result.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {result.location}
              </div>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {result.submittedBy}
              </div>
              {result.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current text-yellow-500" />
                  {result.rating}/5
                </div>
              )}
            </div>
          </div>
          <div className="ml-4">
            <Badge variant={result.status === 'resolved' ? 'secondary' : 'outline'}>
              {result.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Mock search results for demonstration
  const mockResults = [
    {
      id: 1,
      type: "complaint",
      title: "Large pothole on MG Road causing traffic issues",
      description: "There's a significant pothole near the central plaza that's causing vehicles to swerve dangerously...",
      location: "MG Road, Central Plaza",
      submittedBy: "Citizen",
      priority: "high",
      status: "in-progress",
      date: "2 days ago",
      rating: null
    },
    {
      id: 2,
      type: "feedback",
      title: "Excellent water supply service restoration",
      description: "The water supply team responded quickly to our complaint and fixed the issue within 24 hours...",
      location: "Residency Area",
      submittedBy: "Resident",
      priority: "medium",
      status: "resolved",
      date: "1 week ago",
      rating: 5
    },
    {
      id: 3,
      type: "complaint",
      title: "Street lights not working on Park Road",
      description: "Multiple street lights have been out for over a week, making the area unsafe at night...",
      location: "Park Road",
      submittedBy: "Community",
      priority: "medium",
      status: "pending",
      date: "5 days ago",
      rating: null
    }
  ];

  const displayResults = query.length >= 3 ? mockResults : [];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4" data-testid="smart-search">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-20 h-12 text-lg"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            data-testid="search-input"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              data-testid="toggle-filters"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => handleSearch()} data-testid="search-button">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Smart Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 border shadow-lg">
            <CardContent className="p-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => {
                    setQuery(suggestion);
                    setShowSuggestions(false);
                    handleSearch(suggestion);
                  }}
                  data-testid={`suggestion-${index}`}
                >
                  <Sparkles className="h-3 w-3 text-purple-500" />
                  <span className="text-sm">{suggestion}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => (
          <Button
            key={filter.value}
            variant="outline"
            size="sm"
            onClick={() => handleQuickFilter(filter.value)}
            className="h-8 text-xs"
            data-testid={`quick-filter-${filter.value}`}
          >
            <filter.icon className="h-3 w-3 mr-1" />
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <select 
                  className="w-full mt-1 p-2 border rounded"
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">All Categories</option>
                  <option value="roads">Roads</option>
                  <option value="water_supply">Water Supply</option>
                  <option value="electricity">Electricity</option>
                  <option value="sanitation">Sanitation</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Priority</label>
                <select 
                  className="w-full mt-1 p-2 border rounded"
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Status</label>
                <select 
                  className="w-full mt-1 p-2 border rounded"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Searches */}
      {query.length === 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Popular Searches
            </CardTitle>
            <CardDescription>Common issues and frequently searched topics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80"
                  onClick={() => {
                    setQuery(search);
                    handleSearch(search);
                  }}
                  data-testid={`popular-search-${index}`}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {query.length >= 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              Search Results {displayResults.length > 0 && `(${displayResults.length})`}
            </h3>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Searching...
              </div>
            )}
          </div>

          {displayResults.length > 0 ? (
            <div className="space-y-3">
              {displayResults.map((result, index) => (
                <MockSearchResult key={result.id || index} result={result} />
              ))}
            </div>
          ) : query.length >= 3 && !isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}