import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useStore from '../store/useStore';
import React, { useEffect, useRef } from 'react';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LeafletMap = ({ listings, onMarkerClick, dimmed }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const { mapCenter, mapZoom, setMapCenter, setMapZoom, setSelectedMarker } = useStore();
  const isProgrammaticRef = useRef(false);
  const fitBoundsCalledRef = useRef(false);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map (doubleClickZoom enabled by default)
    const map = L.map(mapRef.current).setView(mapCenter, mapZoom);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Store map instance
    mapInstanceRef.current = map;

    // Map event listeners
    map.on('moveend', () => {
      if (isProgrammaticRef.current) {
        isProgrammaticRef.current = false;
        return;
      }
      const center = map.getCenter();
      // Only update Zustand if the value actually changed
      if (center.lat !== mapCenter[0] || center.lng !== mapCenter[1]) {
        setMapCenter([center.lat, center.lng]);
      }
    });

    map.on('zoomend', () => {
      if (isProgrammaticRef.current) {
        isProgrammaticRef.current = false;
        return;
      }
      const zoom = map.getZoom();
      if (zoom !== mapZoom) {
        setMapZoom(zoom);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  // Only run on mount/unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when listings change
  useEffect(() => {
    if (!mapInstanceRef.current || !listings) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.remove();
    });
    markersRef.current = [];

    // Add new markers
    listings.forEach(listing => {
      if (listing.coordinates && listing.coordinates.lat && listing.coordinates.lng) {
        const marker = L.marker([listing.coordinates.lat, listing.coordinates.lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div class="marker-popup">
              <img src="${listing.images && listing.images.length > 0 ? listing.images[0] : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'}" alt="Primary" style="width: 100%; max-width: 220px; height: 120px; object-fit: cover; border-radius: 10px; margin-bottom: 8px;" />
              <h3>${listing.title}</h3>
              <p>${listing.category}</p>
              <p>${listing.location}</p>
              <button onclick="window.markerClick('${listing._id || listing.id}')" class="marker-btn">
                View Details
              </button>
            </div>
          `, {
            autoPan: false,
            autoPanPadding: [0, 0],
            closeButton: true,
            maxWidth: 301
          });

        // Show popup on hover
        marker.on('mouseover', () => {
          marker.openPopup();
        });

        // Hide popup when mouse leaves
        marker.on('mouseout', () => {
          marker.closePopup();
        });

        marker.on('click', () => {
          setSelectedMarker(listing);
          if (onMarkerClick) {
            onMarkerClick(listing);
          }
        });

        markersRef.current.push(marker);
      }
    });

    // Removed fitBounds logic so map always uses mapCenter/mapZoom
  }, [listings, onMarkerClick, setSelectedMarker]);

  // Update map center when it changes in store
  useEffect(() => {
    if (mapInstanceRef.current) {
      const current = mapInstanceRef.current.getCenter();
      const currentZoom = mapInstanceRef.current.getZoom();
      // Guard: only setView if map is loaded and container is present
      if (
        (current.lat !== mapCenter[0] || current.lng !== mapCenter[1] || currentZoom !== mapZoom) &&
        mapInstanceRef.current._loaded &&
        mapRef.current &&
        mapRef.current.parentNode
      ) {
        // Set guard BEFORE calling setView
        isProgrammaticRef.current = true;
        mapInstanceRef.current.setView(mapCenter, mapZoom);
      }
    }
  }, [mapCenter, mapZoom]);

  // Expose marker click function globally
  useEffect(() => {
    window.markerClick = (listingId) => {
      console.log('Marker clicked with ID:', listingId);
      const listing = listings.find(l => (l._id === listingId) || (l.id === listingId));
      console.log('Found listing:', listing);
      if (listing && onMarkerClick) {
        onMarkerClick(listing);
      } else {
        console.log('Listing not found or onMarkerClick not available');
      }
    };

    return () => {
      delete window.markerClick;
    };
  }, [listings, onMarkerClick]);

  useEffect(() => {
    // Reset fitBoundsCalledRef if listings change (e.g., new search)
    fitBoundsCalledRef.current = false;
  }, [listings]);

  return (
    <div
      className={`leaflet-map-container${dimmed ? ' dimmed' : ''}`}
      style={{ height: '100%', width: '100%', position: 'relative', zIndex: dimmed ? 1 : 'auto' }}
    >
      <div 
        ref={mapRef} 
        className="leaflet-map"
        style={{ height: '100%', width: '100%' }}
      />
      {/* Moved styles to a regular <style> tag to avoid jsx warning */}
      <style>{`
        .leaflet-map-container {
          height: 100%;
          width: 100%;
          position: relative;
        }
        .leaflet-map {
          height: 100%;
          width: 100%;
        }
        .marker-popup {
          text-align: center;
          min-width: 200px;
        }
        .marker-popup h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
        .marker-popup p {
          margin: 4px 0;
          font-size: 14px;
          color: #666;
        }
        .marker-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 8px;
        }
        .marker-btn:hover {
          background: #0056b3;
        }
        .leaflet-map-container.dimmed {
          z-index: 1 !important;
        }
        .leaflet-map-container .leaflet-control-container,
        .leaflet-map-container .leaflet-control-zoom {
          z-index: auto !important;
        }
      `}</style>
    </div>
  );
};

// MiniMapPicker: a small interactive map for picking a location
export const MiniMapPicker = ({ initialLat, initialLng, onLocationSelect }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return;
    const map = L.map(mapRef.current, { zoomControl: true });
    map.setView([initialLat || 32.4279, initialLng || 53.6880], 6);
    mapInstanceRef.current = map;
    initializedRef.current = true;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    // Click handler
    map.on('click', function (e) {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
        markerRef.current.on('dragend', function (ev) {
          const pos = ev.target.getLatLng();
          onLocationSelect && onLocationSelect(pos.lat, pos.lng);
        });
      }
      onLocationSelect && onLocationSelect(lat, lng);
    });
    // If initial position, show marker
    if (initialLat && initialLng) {
      markerRef.current = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
      markerRef.current.on('dragend', function (ev) {
        const pos = ev.target.getLatLng();
        onLocationSelect && onLocationSelect(pos.lat, pos.lng);
      });
    }
    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      initializedRef.current = false;
    };
  }, []);

  // Update marker and map view when initialLat/initialLng change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (initialLat && initialLng) {
      mapInstanceRef.current.setView([initialLat, initialLng], mapInstanceRef.current.getZoom());
      if (markerRef.current) {
        markerRef.current.setLatLng([initialLat, initialLng]);
      } else {
        markerRef.current = L.marker([initialLat, initialLng], { draggable: true }).addTo(mapInstanceRef.current);
        markerRef.current.on('dragend', function (ev) {
          const pos = ev.target.getLatLng();
          onLocationSelect && onLocationSelect(pos.lat, pos.lng);
        });
      }
    }
  }, [initialLat, initialLng]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: 260, borderRadius: 12, margin: '8px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
  );
};

export default LeafletMap; 