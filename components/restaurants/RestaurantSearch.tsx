"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PlaceResult {
  place_id: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  price_level: number | null;
  photo_reference: string | null;
}

interface PlaceDetails extends PlaceResult {
  website: string | null;
  phone: string | null;
  cuisine: string | null;
}

interface RestaurantSearchProps {
  onSelect: (details: PlaceDetails) => void;
  city?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function RestaurantSearch({ onSelect, city }: RestaurantSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setSearchError(null);
      setOpen(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setSearchError(null);

    const url = `/api/places/search?q=${encodeURIComponent(debouncedQuery)}${city ? `&city=${encodeURIComponent(city)}` : ""}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          if (data.error) {
            setSearchError(data.error);
            setResults([]);
          } else {
            setResults(data.places ?? []);
            setOpen(true);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSearchError(String(err));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, city]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleSelect(place: PlaceResult) {
    setLoadingDetails(place.place_id);
    setOpen(false);
    setQuery(place.name);

    try {
      const res = await fetch(
        `/api/places/details?id=${encodeURIComponent(place.place_id)}`
      );
      const details: PlaceDetails = await res.json();
      // Use search result photo as fallback if details API returns null
      onSelect({
        ...details,
        photo_reference: details.photo_reference ?? place.photo_reference,
      });
    } catch {
      // Fall back to partial data
      onSelect({ ...place, website: null, phone: null, cuisine: null });
    } finally {
      setLoadingDetails(null);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {loadingDetails ? (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          className="pl-9"
          placeholder="Search restaurants…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-72 overflow-auto">
          {results.map((place) => (
            <li key={place.place_id}>
              <button
                className="w-full text-left px-4 py-2.5 hover:bg-accent transition-colors"
                onClick={() => handleSelect(place)}
              >
                <p className="font-medium text-sm">{place.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {place.address}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {loading && query.trim() && !open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-3 text-sm text-muted-foreground text-center shadow-lg">
          Searching…
        </div>
      )}

      {searchError && (
        <p className="mt-1.5 text-xs text-destructive">{searchError}</p>
      )}
    </div>
  );
}
