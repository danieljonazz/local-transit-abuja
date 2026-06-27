"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Trash2, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SubmitRoute() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [description, setDescription] = useState("");
  const [overallStart, setOverallStart] = useState("");
  const [overallEnd, setOverallEnd] = useState("");
  const [segments, setSegments] = useState([
    { transport_mode: "keke", start_location: "", end_location: "", cost: "" }
  ]);

  const addSegment = () => {
    setSegments([...segments, { transport_mode: "keke", start_location: "", end_location: "", cost: "" }]);
  };

  const removeSegment = (index: number) => {
    if (segments.length > 1) {
      setSegments(segments.filter((_, i) => i !== index));
    }
  };

  const updateSegment = (index: number, field: string, value: string) => {
    const newSegments = [...segments];
    // @ts-ignore
    newSegments[index][field] = value;
    setSegments(newSegments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_name: overallStart,
          start_lat: 9.05785, // Mock coordinate for now 
          start_lng: 7.49508,
          end_name: overallEnd,
          end_lat: 9.07647,
          end_lng: 7.47321,
          segments: segments,
          authorName: authorName,
          description: description
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit route");
      }

      alert("Route submitted successfully!");
      router.push("/");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-full flex flex-col pt-4 overflow-y-auto pb-20">
      
      <div className="px-5 mb-6 flex items-center md:max-w-2xl md:mx-auto md:w-full md:mt-8">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold ml-2 text-slate-800">Add a New Route</h2>
      </div>

      <form onSubmit={handleSubmit} className="px-5 flex flex-col gap-6 md:max-w-2xl md:mx-auto md:w-full">
        
        {/* Overall Journey */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-500" />
            Overall Journey
          </h3>
          
          <div className="flex flex-col gap-3 md:grid md:grid-cols-2">
            <input 
              required
              type="text" 
              placeholder="Starting Address / Junction" 
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-600 focus:ring-2 ring-green-500/20 outline-none"
              value={overallStart}
              onChange={(e) => setOverallStart(e.target.value)}
            />
            <input 
              required
              type="text" 
              placeholder="Final Destination" 
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-600 focus:ring-2 ring-blue-500/20 outline-none"
              value={overallEnd}
              onChange={(e) => setOverallEnd(e.target.value)}
            />
          </div>
        </div>

        {/* Segments */}
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-slate-700 px-1">Route Segments (Step-by-Step)</h3>
          
          {segments.map((segment, index) => (
            <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative">
              
              <div className="flex justify-between items-center mb-3">
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">Step {index + 1}</span>
                {segments.length > 1 && (
                  <button type="button" onClick={() => removeSegment(index)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <select 
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                  value={segment.transport_mode}
                  onChange={(e) => updateSegment(index, "transport_mode", e.target.value)}
                >
                  <option value="keke">Keke (Tricycle)</option>
                  <option value="taxi">Shared Taxi (Along)</option>
                  <option value="bus">Mini Bus</option>
                  <option value="walk">Walk</option>
                </select>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₦</span>
                  <input 
                    required
                    type="number" 
                    placeholder="Cost" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-600 outline-none"
                    value={segment.cost}
                    onChange={(e) => updateSegment(index, "cost", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 md:grid md:grid-cols-2">
                <input 
                  required
                  type="text" 
                  placeholder={index === 0 ? "Boarding Point" : "Where to board?"} 
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-600 outline-none"
                  value={segment.start_location}
                  onChange={(e) => updateSegment(index, "start_location", e.target.value)}
                />
                <input 
                  required
                  type="text" 
                  placeholder="Drop-off Junction" 
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-600 outline-none"
                  value={segment.end_location}
                  onChange={(e) => updateSegment(index, "end_location", e.target.value)}
                />
              </div>

            </div>
          ))}

          <button 
            type="button" 
            onClick={addSegment}
            className="border-2 border-dashed border-slate-300 text-slate-500 rounded-2xl py-3 flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Next Step
          </button>
        </div>

        {/* Pro-Tips / Description */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2">
          <h3 className="font-semibold text-slate-700 text-sm">Description / Pro-Tips (Optional)</h3>
          <textarea 
            placeholder="Add pro-tips (e.g., 'Stand under the bridge, heavy traffic around 5 PM')"
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-600 focus:ring-2 ring-green-500/20 outline-none w-full min-h-[80px] resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Author Name */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2">
          <h3 className="font-semibold text-slate-700 text-sm">Author (Optional)</h3>
          <input 
            type="text" 
            placeholder="Optional: Your Name or Twitter Handle (@name)" 
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-600 focus:ring-2 ring-green-500/20 outline-none w-full"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
        </div>

        <button 
          disabled={loading}
          type="submit" 
          className="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-green-600/20 transition-all disabled:opacity-70 flex justify-center w-full"
        >
          {loading ? "Submitting..." : "Submit Route"}
        </button>
      </form>
    </div>
  );
}
