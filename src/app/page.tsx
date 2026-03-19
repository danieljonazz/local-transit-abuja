"use client";

import MapViewer from "@/components/MapViewer";
import { Search, MapPin, ArrowRightSquare, Route, DollarSign, Clock } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // We add markers based on search results
  const markers = routes.length > 0 ? [
    { id: "start", position: [9.05785, 7.49508] as [number, number], title: routes[0].start_name },
    { id: "end", position: [9.07647, 7.47321] as [number, number], title: routes[0].end_name }
  ] : [];

  const handleSearch = async () => {
    if (!start || !destination) return;
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      // Mock coordinates for the MVP since we don't have a geocoding API set up yet
      const startLat = 9.05785;
      const startLng = 7.49508;
      const endLat = 9.07647;
      const endLng = 7.47321;
      
      const res = await fetch(`/api/routes/search?start_lat=${startLat}&start_lng=${startLng}&end_lat=${endLat}&end_lng=${endLng}&fallback=true`);
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

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      
      {/* Map Background Layer */}
      <div className={`absolute inset-0 z-0 transition-all duration-500 ${hasSearched ? 'h-[40%]' : 'h-[60%]'}`}>
        <MapViewer center={[9.05785, 7.49508]} zoom={12} markers={markers} />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent z-[400] pointer-events-none" />
      </div>

      {/* Floating Action / Search Floating Box */}
      <div className={`relative z-[500] mt-auto w-full bg-slate-50 rounded-t-3xl pt-6 pb-6 px-5 flex flex-col gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-all duration-500 ${hasSearched ? 'h-[65%] overflow-y-auto' : ''}`}>
        
        <div className="flex flex-col items-center justify-center mb-2 shrink-0">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-4" />
          {!hasSearched && <h2 className="text-lg font-semibold self-start text-slate-800">Find Your Route</h2>}
        </div>

        {/* Input Fields */}
        <div className="flex flex-col relative gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm shrink-0">
          
          <div className="absolute left-6 top-[28px] bottom-[28px] w-0.5 bg-slate-300 border-dashed border-l-2 border-slate-200" />

          {/* Start Input */}
          <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 focus-within:ring-2 ring-green-500/20 transition-all">
            <div className="w-6 flex justify-center mr-2">
              <div className="w-3 h-3 rounded-full border-2 border-green-500 bg-white z-10" />
            </div>
            <input 
              type="text" 
              placeholder="Where are you? (e.g., Gwarinpa)" 
              className="flex-1 bg-transparent border-none outline-none text-[15px] placeholder:text-slate-400 py-1"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>

          {/* End Input */}
          <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 focus-within:ring-2 ring-blue-500/20 transition-all">
            <div className="w-6 flex justify-center mr-2">
              <MapPin className="w-4 h-4 text-blue-500 z-10 bg-slate-50" />
            </div>
            <input 
              type="text" 
              placeholder="Where to? (e.g., Wuse Market)" 
              className="flex-1 bg-transparent border-none outline-none text-[15px] placeholder:text-slate-400 py-1"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-2 shrink-0">
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
            <h3 className="font-semibold text-slate-800 text-lg flex justify-between items-center">
              Routes Found
              <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 py-1 rounded-full">{routes.length} options</span>
            </h3>
            
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
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded-lg text-xs font-bold border border-slate-200 shadow-sm">
                      👍 {route.upvotes}
                    </span>
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
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
