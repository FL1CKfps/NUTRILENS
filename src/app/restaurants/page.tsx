'use client';

import { useState, useRef, useCallback } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { RestaurantSkeleton } from '@/components/Skeletons';
import { Restaurant } from '@/types';
import { MapPin, Star, Navigation, Clock, ExternalLink, Locate } from 'lucide-react';

// Track whether we've called setOptions (must only happen once)
let mapsInitialized = false;

function ensureMapsInit() {
  if (mapsInitialized) return;
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  if (!key || key === 'your_google_maps_api_key_here') {
    throw new Error('Google Maps API key not configured. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local');
  }
  setOptions({ key, libraries: ['places'] });
  mapsInitialized = true;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);

  const searchNearby = useCallback(async (lat: number, lng: number) => {
    setLoading(true); setError(null);
    try {
      ensureMapsInit();
      // importLibrary properly awaits full API bootstrap
      const mapsLib = await importLibrary('maps');
      const placesLib = await importLibrary('places');
      const PlaceClass = (placesLib as { Place: typeof google.maps.places.Place }).Place;

      const location = { lat, lng };
      const MapConstructor = (mapsLib as { Map: typeof google.maps.Map }).Map;

      if (mapRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = new MapConstructor(mapRef.current, {
          center: location,
          zoom: 14,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#8892b0' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d4a' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0e1a' }] },
            { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a2e1a' }] },
          ],
          disableDefaultUI: true,
          zoomControl: true,
        });
      }

      const request = {
        textQuery: 'healthy food salad organic restaurant',
        includedType: 'restaurant',
        locationBias: location,
        maxResultCount: 5,
        fields: ['displayName', 'location', 'rating', 'userRatingCount', 'formattedAddress', 'id', 'regularOpeningHours'],
      };

      const { places } = await PlaceClass.searchByText(request);
      if (places.length) {
        const openStatuses = await Promise.all(
          places.map(async (place) => {
            if (typeof place.isOpen === 'function') {
              try {
                return await place.isOpen();
              } catch {
                return undefined;
              }
            }
            return undefined;
          })
        );

        const toLatLng = (
          loc: google.maps.LatLng | google.maps.LatLngLiteral | undefined | null
        ): { lat: number; lng: number } => {
          if (!loc) return { lat, lng };
          if (typeof (loc as google.maps.LatLng).lat === 'function') {
            return {
              lat: (loc as google.maps.LatLng).lat(),
              lng: (loc as google.maps.LatLng).lng(),
            };
          }
          return loc as google.maps.LatLngLiteral;
        };

        const topResults: Restaurant[] = places.map((place, index) => ({
          name: place.displayName || 'Unknown',
          rating: place.rating || 0,
          address: place.formattedAddress || '',
          distance: '',
          placeId: place.id || '',
          location: toLatLng(place.location),
          isOpen: openStatuses[index] ?? undefined,
          totalRatings: place.userRatingCount || 0,
        }));
        setRestaurants(topResults);
        placeMarkers(topResults);
      } else {
        setError('No healthy restaurants found nearby. Try a different area.');
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search');
      setLoading(false);
    }
  }, []);

  const placeMarkers = (results: Restaurant[]) => {
    // Clear old markers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    markersRef.current.forEach((m: any) => m.setMap(null));
    markersRef.current = [];

    results.forEach((r) => {
      const marker = new google.maps.Marker({
        map: mapInstanceRef.current!,
        position: r.location,
        title: r.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3b82f6',
          fillOpacity: 0.9,
          strokeColor: '#1e3a5f',
          strokeWeight: 2,
        },
      });
      markersRef.current.push(marker);
    });
  };

  const getUserLocation = async () => {
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    if (!window.isSecureContext) {
      setError('Location access requires HTTPS. Please use a secure connection.');
      return;
    }
    setLoading(true);
    try {
      if ('permissions' in navigator && navigator.permissions?.query) {
        const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        if (status.state === 'denied') {
          setError('Location access is blocked. Enable it in your browser settings and try again.');
          setLoading(false);
          return;
        }
      }
    } catch {
      // Permissions API may be unsupported; proceed to request location.
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        searchNearby(loc.lat, loc.lng);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location permission denied. Enable location access and try again.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError('Location unavailable. Check your connection or try again.');
        } else if (err.code === err.TIMEOUT) {
          setError('Location request timed out. Please try again.');
        } else {
          setError('Unable to get your location. Please enable location access.');
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const openDirections = (restaurant: Restaurant) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.location.lat},${restaurant.location.lng}&destination_place_id=${restaurant.placeId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-2">
          <MapPin size={14} aria-hidden="true" />Nearby
        </div>
        <h1 className="text-2xl font-bold text-white">Healthy Restaurants</h1>
        <p className="text-white/50 text-sm">Find top-rated healthy dining options near you</p>
      </div>

      {!userLocation && !loading && (
        <div className="glass-card-elevated p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4 animate-pulse-glow">
            <Locate size={28} className="text-blue-400" aria-hidden="true" />
          </div>
          <h2 className="text-white font-semibold mb-2">Enable Location</h2>
          <p className="text-white/40 text-sm mb-5">Allow location access to find nearby healthy restaurants</p>
          <button onClick={getUserLocation}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-[#0a0a0f] font-semibold text-sm transition-all shadow-lg shadow-blue-500/25"
            aria-label="Find healthy restaurants near my location">
            <Navigation size={16} className="inline mr-2" aria-hidden="true" />Find Nearby Restaurants
          </button>
        </div>
      )}

      {/* Map */}
      <div ref={mapRef} className="w-full h-56 rounded-2xl overflow-hidden border border-white/10 bg-white/5"
        style={{ display: userLocation ? 'block' : 'none' }} role="img" aria-label="Map showing nearby healthy restaurants" />

      {loading && <RestaurantSkeleton />}
      {error && (<div className="glass-card p-5 border-red-500/20" role="alert"><p className="text-red-400 font-medium">{error}</p></div>)}

      {restaurants.length > 0 && (
        <div className="space-y-3" role="list" aria-label="Nearby healthy restaurants">
          {restaurants.map((r) => (
            <div key={r.placeId} className="glass-card p-4 hover:border-white/20 transition-all" role="listitem">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin size={22} className="text-blue-400" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{r.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" aria-hidden="true" />
                      <span className="text-amber-400 text-xs font-semibold">{r.rating}</span>
                    </div>
                    <span className="text-white/20">•</span>
                    <span className="text-white/40 text-xs">{r.totalRatings} reviews</span>
                    {r.isOpen !== undefined && (<>
                      <span className="text-white/20">•</span>
                      <span className={`text-xs font-medium flex items-center gap-1 ${r.isOpen ? 'text-emerald-400' : 'text-red-400'}`}>
                        <Clock size={10} aria-hidden="true" />{r.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </>)}
                  </div>
                  <p className="text-white/30 text-xs mt-1 truncate">{r.address}</p>
                </div>
                <button onClick={() => openDirections(r)}
                  className="self-center p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors flex-shrink-0"
                  aria-label={`Get directions to ${r.name}`}>
                  <ExternalLink size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
