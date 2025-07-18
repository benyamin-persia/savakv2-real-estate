import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapContainer = styled.div`
  width: 100%;
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const MapWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Popup = styled.div`
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  max-width: 250px;
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
  }
  
  p {
    margin: 0 0 4px 0;
    font-size: 14px;
    color: #64748b;
  }
  
  .type {
    background: #3b82f6;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    display: inline-block;
    margin-top: 8px;
  }
`;

const InteractiveMap = ({ listings = [], onMarkerClick }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng] = useState(-73.935242);
  const [lat] = useState(40.730610);
  const [zoom] = useState(10);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    
    const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
    
    if (!mapboxToken) {
      console.warn('Mapbox token not found. Please add REACT_APP_MAPBOX_TOKEN to your .env file');
      return;
    }

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-left'
    );

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [lng, lat, zoom]);

  // Add markers when listings change
  useEffect(() => {
    if (!map.current || !listings.length) return;

    // Clear existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());

    listings.forEach((listing, index) => {
      if (!listing.location || !listing.location.coordinates) return;

      const [lng, lat] = listing.location.coordinates;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = getMarkerColor(listing.type);
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 12px; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1e293b;">
            ${listing.title}
          </h3>
          <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b;">
            ${listing.description}
          </p>
          <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b;">
            <strong>Type:</strong> ${listing.type}
          </p>
          <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b;">
            <strong>Location:</strong> ${listing.location?.address || 'Location not specified'}
          </p>
          <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; display: inline-block; margin-top: 8px;">
            ${listing.type}
          </span>
        </div>
      `);

      // Add marker to map
      new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current);

      // Add click handler
      el.addEventListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(listing);
        }
      });
    });
  }, [listings, onMarkerClick]);

  const getMarkerColor = (type) => {
    const colors = {
      'Freelancer': '#3b82f6',
      'Artist': '#8b5cf6',
      'Tutor': '#10b981',
      'Fitness Trainer': '#f59e0b',
      'Chef': '#ef4444',
      'Photographer': '#06b6d4',
      'Musician': '#ec4899',
      'Designer': '#84cc16',
      'Consultant': '#6366f1',
      'Craftsman': '#f97316',
      'Therapist': '#14b8a6',
      'Event Planner': '#a855f7'
    };
    return colors[type] || '#6b7280';
  };

  if (!process.env.REACT_APP_MAPBOX_TOKEN) {
    return (
      <MapContainer>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          background: '#f3f4f6',
          color: '#6b7280'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h3>Map Not Available</h3>
            <p>Please add your Mapbox token to see the interactive map</p>
            <p style={{ fontSize: '12px' }}>
              Add REACT_APP_MAPBOX_TOKEN to your .env file
            </p>
          </div>
        </div>
      </MapContainer>
    );
  }

  return (
    <MapContainer>
      <MapWrapper ref={mapContainer} />
    </MapContainer>
  );
};

export default InteractiveMap; 