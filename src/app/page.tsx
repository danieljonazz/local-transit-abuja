"use client";

import MapViewer from "@/components/MapViewer";
import { Search, MapPin, ArrowRightSquare, Route, DollarSign, Clock, ArrowUpDown, Share2 } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const urlStart = searchParams.get('start');
  const urlEnd = searchParams.get('end');
  const urlSort = searchParams.get('sort');

  const [start, setStart] = useState(urlStart || "");
  const [destination, setDestination] = useState(urlEnd || "");
  const [sortBy, setSortBy] = useState(urlSort === 'cheapest' ? 'cheapest' : 'upvotes');
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (urlStart && urlEnd && !hasSearched) {
      fetchRoutes(urlStart, urlEnd, sortBy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlStart, urlEnd]);

  const handleShare = () => {
    if (!start || !destination) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(destination)}&sort=${sortBy}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    if (hasSearched) {
      fetchRoutes(start, destination, newSort);
    }
  };
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeInput, setActiveInput] = useState<'start' | 'destination' | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!activeInput) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    const currentVal = activeInput === 'start' ? start : destination;
    
    if (currentVal.length < 2) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/locations/search?q=${encodeURIComponent(currentVal)}`);
        const data = await res.json();
        if (data.locations && data.locations.length > 0) {
          setSuggestions(data.locations);
          setIsDropdownOpen(true);
        } else {
          setSuggestions([]);
          setIsDropdownOpen(false);
        }
      } catch (e) {
        console.error(e);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [start, destination, activeInput]);

  const handleSelectSuggestion = (location: string) => {
    if (activeInput === 'start') {
      setStart(location);
    } else if (activeInput === 'destination') {
      setDestination(location);
    }
    setSuggestions([]);
    setIsDropdownOpen(false);
    setActiveInput(null);
  };

  const handleSwap = () => {
    setStart(destination);
    setDestination(start);
    setSuggestions([]);
    setIsDropdownOpen(false);
    setActiveInput(null);
  };

  const [upvotedRoutes, setUpvotedRoutes] = useState<Record<string, boolean>>({});

  const handleUpvote = async (routeId: string) => {
    if (upvotedRoutes[routeId]) return;

    // Optimistically update UI local state
    setUpvotedRoutes((prev) => ({ ...prev, [routeId]: true }));
    setRoutes((prevRoutes) => 
      prevRoutes.map(r => r.id === routeId ? { ...r, upvotes: r.upvotes + 1 } : r)
    );

    // Fire fetch request in background
    try {
      await fetch(`/api/routes/${routeId}/upvote`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error("Failed to upvote:", error);
    }
  };

  // Extract coordinates from the first matched route, if any
  const startCoords = routes.length > 0 && routes[0].start_coordinates ? (routes[0].start_coordinates as [number, number]) : null;
  const endCoords = routes.length > 0 && routes[0].end_coordinates ? (routes[0].end_coordinates as [number, number]) : null;

  const fetchRoutes = async (startName: string, endName: string, sortMode: string = 'upvotes') => {
    if (!startName || !endName) return;
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const queryParams = new URLSearchParams({
        start_name: startName,
        end_name: endName,
        sort: sortMode
      });
      
      const res = await fetch(`/api/routes/search?${queryParams.toString()}`);
      const data = await res.json();
      
      if (data.routes) {
        setRoutes(data.routes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchRoutes(start, destination, sortBy);

  return (
    <div className="min-h-screen bg-slate-50 overflow-y-auto">
      
      {/* Map Background Layer - Hidden for Version 1
      <div className="absolute inset-0 z-0 w-full h-full transition-all duration-500">
        <MapViewer center={[9.05785, 7.49508]} zoom={12} startCoords={startCoords} endCoords={endCoords} />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent z-[400] pointer-events-none" />
      </div>
      */}

      {/* Main Centered Layout */}
      <div className="max-w-3xl mx-auto w-full pt-12 pb-20 px-5 flex flex-col gap-6">
        
        <div className="flex flex-col items-center justify-center mb-4 shrink-0">
          <h2 className="text-2xl font-bold text-slate-800">Find Your Route</h2>
        </div>

        {/* Input Fields */}
        <div className="flex flex-col relative gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm shrink-0">
          
          <div className="absolute left-6 top-[28px] bottom-[28px] w-0.5 bg-slate-300 border-dashed border-l-2 border-slate-200" />

          <button 
            onClick={handleSwap}
            className="absolute right-6 top-1/2 -translate-y-1/2 bg-white border border-slate-200 shadow-sm p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors z-[550]"
            title="Swap locations"
            type="button"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>

          {/* Start Input */}
          <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 focus-within:ring-2 ring-green-500/20 transition-all relative">
            <div className="w-6 flex justify-center mr-2">
              <div className="w-3 h-3 rounded-full border-2 border-green-500 bg-white z-10" />
            </div>
            <input 
              type="text" 
              placeholder="Where are you? (e.g., Gwarinpa)" 
              className="flex-1 bg-transparent border-none outline-none text-[15px] text-slate-900 placeholder:text-slate-600 py-1"
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
                setActiveInput('start');
              }}
              onFocus={() => setActiveInput('start')}
            />
            {isDropdownOpen && activeInput === 'start' && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-[600]">
                {suggestions.map((loc, idx) => (
                  <li 
                    key={idx}
                    onClick={() => handleSelectSuggestion(loc)}
                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-slate-700 text-[15px] border-b border-slate-50 last:border-0"
                  >
                    {loc}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* End Input */}
          <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 focus-within:ring-2 ring-blue-500/20 transition-all relative">
            <div className="w-6 flex justify-center mr-2">
              <MapPin className="w-4 h-4 text-blue-500 z-10 bg-slate-50" />
            </div>
            <input 
              type="text" 
              placeholder="Where to? (e.g., Wuse Market)" 
              className="flex-1 bg-transparent border-none outline-none text-[15px] text-slate-900 placeholder:text-slate-600 py-1"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setActiveInput('destination');
              }}
              onFocus={() => setActiveInput('destination')}
            />
            {isDropdownOpen && activeInput === 'destination' && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-[600]">
                {suggestions.map((loc, idx) => (
                  <li 
                    key={idx}
                    onClick={() => handleSelectSuggestion(loc)}
                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-slate-700 text-[15px] border-b border-slate-50 last:border-0"
                  >
                    {loc}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4 mb-2 shrink-0">
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-medium shadow-md shadow-green-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <span>Searching...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search Routes
              </>
            )}
          </button>
          <Link href="/submit" className="flex-none bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-5 py-3.5 rounded-xl font-medium transition-colors flex flex-col items-center justify-center text-xs shadow-sm">
            <ArrowRightSquare className="w-5 h-5 text-slate-500 mb-0.5" />
            Add
          </Link>
        </div>

        {/* Search Results Area */}
        {hasSearched && (
          <div className="mt-4 flex flex-col gap-4 pb-20">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                Routes Found
                <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 py-1 rounded-full">{routes.length} options</span>
              </h3>
              
              <div className="flex items-center gap-2">
                {routes.length > 0 && (
                  <select 
                    value={sortBy} 
                    onChange={handleSortChange}
                    className="text-sm bg-white border border-slate-200 text-slate-600 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm cursor-pointer"
                  >
                    <option value="upvotes">Top Rated</option>
                    <option value="cheapest">Cheapest</option>
                  </select>
                )}
                {routes.length > 0 && (
                  <button 
                    onClick={handleShare}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-100 shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    {copied ? "Copied!" : "Share"}
                  </button>
                )}
              </div>
            </div>
            
            {loading && <div className="text-center text-slate-500 py-8 animate-pulse">Finding best community routes...</div>}
            
            {!loading && routes.length === 0 && (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                <Route className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-600 font-medium">No community routes found yet.</p>
                <Link href="/submit" className="text-green-600 font-semibold mt-2 text-sm">Be the first to add one!</Link>
              </div>
            )}

            {routes.map((route) => (
              <div key={route.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-800 text-lg">₦{route.total_cost}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Top Rated</span>
                    </div>
                    <p className="text-slate-500 text-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Est. {route.total_time_mins} mins
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Submitted by <span className="font-medium text-slate-500">{route.authorName || "Anonymous Commuter"}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <button 
                      onClick={() => handleUpvote(route.id)}
                      disabled={upvotedRoutes[route.id]}
                      className={`px-2 py-1 rounded-lg text-xs font-bold border shadow-sm transition-colors ${
                        upvotedRoutes[route.id] 
                          ? "bg-green-100 text-green-700 border-green-200 cursor-default" 
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 active:bg-slate-200"
                      }`}
                    >
                      👍 {route.upvotes}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {route.segments?.map((seg: any, idx: number) => (
                    <div key={seg.id || idx} className="flex gap-3 text-sm">
                      <div className="font-medium text-slate-700 w-12 text-right capitalize">{seg.transport_mode}</div>
                      <div className="w-0.5 bg-slate-300 relative my-1">
                        <div className="absolute top-1 -left-1 w-2.5 h-2.5 rounded-full bg-slate-400" />
                      </div>
                      <div className="flex-1 text-slate-600 break-words pr-2">
                        {seg.instructions || `From ${seg.start_location_name} to ${seg.end_location_name}`}
                      </div>
                      <div className="font-medium text-slate-700">₦{Number(seg.cost)}</div>
                    </div>
                  ))}
                </div>
                
                {route.description && (
                  <p className="text-sm italic text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                    <span className="font-semibold text-amber-700 not-italic block mb-1">💡 Pro-Tip</span>
                    {route.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
