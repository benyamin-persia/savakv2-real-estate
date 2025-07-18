import React, { useEffect, useState, useRef } from 'react';
import useStore from '../store/useStore';
import LeafletMap from '../components/LeafletMap';
import { MiniMapPicker } from '../components/LeafletMap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUpload, FaPlus, FaTimes, FaSave } from 'react-icons/fa';
import Mascot from '../components/Mascot';

// Set overflow: hidden on the body
if (typeof document !== 'undefined') {
  document.body.style.overflow = 'hidden';
}

const TopBar = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 2rem auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0 0 0;
`;
const Logo = styled.a`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover { color: #3b82f6; }
`;
const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;
`;
const NavLink = styled.a`
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s;
  &:hover { color: #3b82f6; background: #f1f5f9; }
`;
const Button = styled.button`
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  border: 2px solid #3b82f6;
  background: transparent;
  color: #3b82f6;
  transition: all 0.2s;
  &:hover { background: #3b82f6; color: white; }
`;

const HomePage = () => {
  const {
    listings,
    fetchListings,
    setMapCenter,
    setMapZoom,
  } = useStore();

  const { user, isAuthenticated, login, loading, error: authError, clearError, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  // Create Listing Form State
  const [listingForm, setListingForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    latitude: '',
    longitude: '',
    price: '',
    phone: '',
    email: '',
    website: '',
    features: '',
    images: []
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [latLngLoading, setLatLngLoading] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationInputRef = useRef();
  let locationFetchTimeout = useRef();
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const [listingError, setListingError] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  // Add state for editing
  const [editingListing, setEditingListing] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  // Add image upload states
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [fullImage, setFullImage] = useState(null);
  const [mascotStatus, setMascotStatus] = useState('idle');
  const [showMascot, setShowMascot] = useState(true);

  useEffect(() => {
    setMapCenter([32.4279, 53.6880]);
    setMapZoom(6);
    
    // Add error handling for fetchListings
    const loadListings = async () => {
      try {
        await fetchListings();
      } catch (error) {
        console.error('Error loading listings:', error);
      }
    };
    
    loadListings();
    
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, []); // Remove dependencies to prevent infinite re-renders

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');
    clearError();
    if (!loginEmail || !loginPassword) {
      setFormError('Please enter both email and password.');
      return;
    }
    const result = await login(loginEmail, loginPassword);
    if (result.success) {
      setSuccessMessage('Login successful! Welcome back.');
      setShowLogin(false);
      setLoginEmail('');
      setLoginPassword('');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setFormError(result.error || 'Login failed');
    }
  };

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');
    clearError();
    if (!signupName || !signupEmail || !signupPassword) {
      setFormError('Please fill in all fields.');
      return;
    }
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.requiresVerification) {
          setShowVerification(true);
          setPendingEmail(signupEmail);
          setSuccessMessage('Verification code sent to your email! Please check your inbox.');
          setTimeout(() => setSuccessMessage(''), 5000);
        } else {
          setSuccessMessage('Signup successful! Welcome to SavakV2.');
          setShowSignup(false);
          setSignupName('');
          setSignupEmail('');
          setSignupPassword('');
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } else {
        setFormError(data.message || 'Signup failed');
      }
    } catch (error) {
      setFormError('Network error. Please try again.');
    }
  };

  // Handle email verification
  const handleVerification = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');
    
    if (!verificationCode) {
      setFormError('Please enter the verification code.');
      return;
    }
    
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: pendingEmail, code: verificationCode }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage('Email verified successfully! Welcome to SavakV2.');
        setShowVerification(false);
        setShowSignup(false);
        setVerificationCode('');
        setPendingEmail('');
        setSignupName('');
        setSignupEmail('');
        setSignupPassword('');
        setTimeout(() => setSuccessMessage(''), 3000);
        // Refresh the page to update authentication state
        window.location.reload();
      } else {
        setFormError(data.message || 'Verification failed');
      }
    } catch (error) {
      setFormError('Network error. Please try again.');
    }
  };

  // Handle resend verification code
  const handleResendCode = async () => {
    setFormError('');
    setSuccessMessage('');
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: pendingEmail }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage('New verification code sent to your email!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setFormError(data.message || 'Failed to resend code');
      }
    } catch (error) {
      setFormError('Network error. Please try again.');
    }
  };

  // Handle delete listing
  const handleDeleteListing = async () => {
    if (!deleteTargetId) return;
    try {
      const response = await fetch(`/api/listings/${deleteTargetId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessMessage('Listing deleted successfully!');
        await fetchListings();
      } else {
        setListingError(data.message || 'Failed to delete listing');
      }
    } catch (error) {
      setListingError('Network error. Please try again.');
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  // Handle edit listing
  const handleEditListing = (listing) => {
    setEditingListing(listing);
    setListingForm({
      title: listing.title || '',
      description: listing.description || '',
      category: listing.category || '',
      location: listing.location || '',
      latitude: listing.coordinates?.lat || '',
      longitude: listing.coordinates?.lng || '',
      price: listing.price || '',
      phone: listing.contact?.phone || '',
      email: listing.contact?.email || '',
      website: listing.contact?.website || '',
      features: (listing.features || []).join(', '),
      images: listing.images || []
    });
    setShowModal(true);
  };

  // Update handleCreateListing to handle edit mode
  const handleCreateListing = async (e) => {
    e.preventDefault();
    setListingError('');
    setSuccessMessage('');
    // Validate required fields
    if (!listingForm.title || !listingForm.description || !listingForm.category || !listingForm.location) {
      setListingError('Please fill in all required fields (Title, Description, Category, Location)');
      return;
    }
    setIsCreatingListing(true);
    setUploadingImages(true);
    
    try {
      // Upload images first if there are any
      let uploadedImages = [];
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach(file => {
          formData.append('images', file);
        });
        
        const uploadResponse = await fetch('/api/upload/multiple', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload images');
        }
        
        const uploadResult = await uploadResponse.json();
        uploadedImages = uploadResult.data.map(img => img.url);
      }
      let finalImages = [];
      if (editingListing) {
        // In edit mode, merge new uploads with existing images
        finalImages = [
          ...(listingForm.images || []),
          ...uploadedImages
        ];
      } else {
        // In create mode, only use new uploads
        finalImages = uploadedImages;
      }
      
      const listingData = {
        title: listingForm.title,
        description: listingForm.description,
        category: listingForm.category,
        location: listingForm.location,
        coordinates: {
          lat: parseFloat(listingForm.latitude) || 0,
          lng: parseFloat(listingForm.longitude) || 0
        },
        price: listingForm.price ? parseFloat(listingForm.price) : null,
        contact: {
          email: listingForm.email || user?.email || '',
          phone: listingForm.phone || '',
          website: listingForm.website || ''
        },
        features: listingForm.features ? listingForm.features.split(',').map(f => f.trim()).filter(f => f) : [],
        images: finalImages
      };
      let response, data;
      if (editingListing) {
        // Edit mode: PUT
        response = await fetch(`/api/listings/${editingListing.id || editingListing._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(listingData)
        });
        data = await response.json();
        if (response.ok) {
          setSuccessMessage('Listing updated successfully!');
        } else {
          setListingError(data.message || 'Failed to update listing');
        }
      } else {
        // Create mode: POST
        response = await fetch('/api/listings', {
        method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(listingData)
      });
        data = await response.json();
      if (response.ok) {
        setSuccessMessage('Listing created successfully!');
        } else {
          setListingError(data.message || 'Failed to create listing');
        }
      }
        setShowModal(false);
      setEditingListing(null);
        setListingForm({
        title: '', description: '', category: '', location: '', latitude: '', longitude: '', price: '', phone: '', email: '', website: '', features: '', images: []
        });
      setImageFiles([]);
      setImagePreviews([]);
        await fetchListings();
        setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setListingError('Network error. Please try again.');
    } finally {
      setIsCreatingListing(false);
      setUploadingImages(false);
    }
  };

  // Handle mascot interactions
  const handleMascotInteraction = (status) => {
    console.log('Mascot interaction:', status);
    
    // Different mascot responses based on status
    switch (status) {
      case 'peeking':
        setMascotStatus('thinking');
        setTimeout(() => setMascotStatus('idle'), 3000);
        break;
      case 'excited':
        setMascotStatus('pointing');
        setTimeout(() => setMascotStatus('idle'), 2000);
        break;
      default:
        setMascotStatus('idle');
    }
  };

  // Show mascot when user creates a listing
  useEffect(() => {
    if (successMessage.includes('successfully!')) {
      setMascotStatus('excited');
      setTimeout(() => setMascotStatus('idle'), 3000);
    }
  }, [successMessage]);

  // Show mascot when user hovers over map
  useEffect(() => {
    const mapElement = document.querySelector('.leaflet-container');
    if (mapElement) {
      const handleMapHover = () => {
        setMascotStatus('peeking');
      };
      
      const handleMapLeave = () => {
        setMascotStatus('idle');
      };
      
      mapElement.addEventListener('mouseenter', handleMapHover);
      mapElement.addEventListener('mouseleave', handleMapLeave);
      
      return () => {
        mapElement.removeEventListener('mouseenter', handleMapHover);
        mapElement.removeEventListener('mouseleave', handleMapLeave);
      };
    }
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileDropdown(false);
      setSuccessMessage('Logged out successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Only show posts created by the current user in My Posts tab
  const myListings = user ? listings.filter(l => String(l.userId) === String(user.id) || (l.user && String(l.user.id) === String(user.id))) : [];
  // General should show ALL posts, including the user's
  const generalListings = listings;


  return (
    <div style={{ minHeight: '100vh', height: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', boxSizing: 'border-box', overflow: 'hidden', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      {/* Area 1: Left, Logo at top */}
      <div style={{ minWidth: 220, maxWidth: 350, width: '22vw', height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', margin: 24, background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '32px 24px' }}>
        <div style={{ fontWeight: 700, fontSize: 24, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 28 }}>🏔️</span> SavakV2
        </div>
      </div>
      {/* Main Card */}
      <div
        style={{
          maxWidth: 1300,
          width: '100%',
          height: 'calc(100vh - 48px)',
          margin: 24,
          borderRadius: 24,
          background: '#fff',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          pointerEvents: showModal ? 'none' : 'auto',
        }}
      >
        {/* Floating Create Listing Button */}
        {isAuthenticated && (
          <button
            onClick={() => {
              setEditingListing(null);
              setListingForm({
                title: '', description: '', category: '', location: '', latitude: '', longitude: '', price: '', phone: '', email: '', website: '', features: '', images: []
              });
              setShowModal(true);
            }}
            style={{
              position: 'absolute',
              top: 32,
              right: 32,
              zIndex: 10,
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              fontWeight: 600,
              fontSize: 16,
              boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            + Create Post
          </button>
        )}
        {/* Modal for Create Listing */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            pointerEvents: 'auto',
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: 32,
              minWidth: 700,
              maxWidth: 1100,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              position: 'relative',
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'transparent',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: '#64748b',
                }}
                aria-label="Close"
              >
                ×
              </button>
              <h2 style={{ marginBottom: 24, fontWeight: 700, fontSize: 22 }}>{editingListing ? 'Edit Post' : 'Create Post'}</h2>
              {listingError && (
                <div style={{ 
                  marginBottom: 16, 
                  padding: 12, 
                  borderRadius: 6, 
                  background: '#fef2f2', 
                  color: '#dc2626', 
                  fontSize: 14 
                }}>
                  {listingError}
                </div>
              )}
              <form
                onSubmit={handleCreateListing}
                onKeyDown={e => {
                  // Prevent Enter from submitting unless on submit button
                  if (e.key === 'Enter' && e.target.type !== 'submit') {
                    e.preventDefault();
                  }
                }}
                style={{ display: 'flex', flexDirection: 'row', gap: 32, minWidth: 650, maxWidth: 1000, maxHeight: '80vh', overflowY: 'auto', flexWrap: 'wrap' }}
              >
                <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Title *</label>
                  <input 
                    type="text" 
                    value={listingForm.title}
                      onChange={(e) => setListingForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Enter listing title"
                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }} 
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Description *</label>
                  <textarea 
                    value={listingForm.description}
                      onChange={(e) => setListingForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe your service or offering"
                    rows={3}
                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb', resize: 'vertical' }} 
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Category *</label>
                  <select 
                    value={listingForm.category}
                      onChange={(e) => setListingForm(f => ({ ...f, category: e.target.value }))}
                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
                  >
                    <option value="">Select a category</option>
                      <option value="آخوند">آخوند</option>
                      <option value="سپاهی">سپاهی</option>
                      <option value="بسیجی">بسیجی</option>
                      <option value="افغان‌مال">افغان‌مال</option>
                      <option value="افغانی">افغانی</option>
                      <option value="پان‌ترک">پان‌ترک</option>
                      <option value="پان‌کرد">پان‌کرد</option>
                      <option value="پان‌عرب">پان‌عرب</option>
                      <option value="جنگ‌طلب">جنگ‌طلب</option>
                      <option value="آقازاده">آقازاده</option>
                      <option value="سهمیه‌ای">سهمیه‌ای</option>
                      <option value="اختلاس‌گر">اختلاس‌گر</option>
                      <option value="بچه‌باز">بچه‌باز</option>
                      <option value="زورگیر">زورگیر</option>
                      <option value="قاتل">قاتل</option>
                      <option value="جاعل">جاعل</option>
                      <option value="کارچاق‌کن">کارچاق‌کن</option>
                      <option value="رشوه‌بگیر">رشوه‌بگیر</option>
                      <option value="اعضای نایاک">اعضای نایاک</option>
                  </select>
                </div>
                  <div style={{ marginBottom: 16, position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Location *</label>
                  <input 
                    type="text" 
                      value={locationLoading ? 'Loading...' : listingForm.location}
                      onChange={async (e) => {
                        setListingForm(f => ({ ...f, location: e.target.value }));
                        setShowSuggestions(true);
                        if (locationFetchTimeout.current) clearTimeout(locationFetchTimeout.current);
                        const value = e.target.value;
                        if (!value || value === 'Loading...') {
                          setLocationSuggestions([]);
                          return;
                        }
                        locationFetchTimeout.current = setTimeout(async () => {
                          try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(value)}`);
                            const data = await res.json();
                            setLocationSuggestions(data || []);
                          } catch {
                            setLocationSuggestions([]);
                          }
                        }, 300);
                      }}
                    placeholder="City, State or Country"
                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }} 
                      disabled={locationLoading}
                      ref={locationInputRef}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      onFocus={() => setShowSuggestions(true)}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          setShowSuggestions(false);
                          const address = e.target.value;
                          if (!address || address === 'Loading...') return;
                          setLatLngLoading(true);
                          try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(address)}`);
                            const data = await res.json();
                            if (data && data.length > 0) {
                              setListingForm(f => ({ ...f, latitude: data[0].lat, longitude: data[0].lon, location: address }));
                            }
                          } catch (e) {
                            // ignore error
                          } finally {
                            setLatLngLoading(false);
                          }
                        }
                      }}
                    />
                    {showSuggestions && locationSuggestions.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: 48,
                        left: 0,
                        right: 0,
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        zIndex: 2000,
                        maxHeight: 220,
                        overflowY: 'auto',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                      }}>
                        {locationSuggestions.map((s, i) => (
                          <div
                            key={s.place_id}
                            style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 15, color: '#1e293b', borderBottom: i !== locationSuggestions.length - 1 ? '1px solid #f1f5f9' : 'none', background: '#fff' }}
                            onMouseDown={() => {
                              setListingForm(f => ({ ...f, location: s.display_name, latitude: s.lat, longitude: s.lon }));
                              setShowSuggestions(false);
                              setLocationSuggestions([]);
                              // Move focus away to trigger map update
                              if (locationInputRef.current) locationInputRef.current.blur();
                            }}
                          >
                            {s.display_name}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
                <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Latitude</label>
                    <input 
                      type="number" 
                        value={latLngLoading ? '' : listingForm.latitude}
                        onChange={(e) => setListingForm(f => ({ ...f, latitude: e.target.value }))}
                      placeholder="40.7128"
                      step="any"
                      style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }} 
                        disabled={latLngLoading}
                        onBlur={async (e) => {
                          const lat = e.target.value;
                          const lng = listingForm.longitude;
                          if (!lat || !lng) return;
                          setLocationLoading(true);
                          try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
                            const data = await res.json();
                            if (data && data.display_name) {
                              setListingForm(f => ({ ...f, location: data.display_name, latitude: lat, longitude: lng }));
                            }
                          } catch (e) {
                            // ignore error
                          } finally {
                            setLocationLoading(false);
                          }
                        }}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const lat = e.target.value;
                            const lng = listingForm.longitude;
                            if (!lat || !lng) return;
                            setLocationLoading(true);
                            try {
                              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
                              const data = await res.json();
                              if (data && data.display_name) {
                                setListingForm(f => ({ ...f, location: data.display_name, latitude: lat, longitude: lng }));
                              }
                            } catch (e) {
                              // ignore error
                            } finally {
                              setLocationLoading(false);
                            }
                          }
                        }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Longitude</label>
                    <input 
                      type="number" 
                        value={latLngLoading ? '' : listingForm.longitude}
                        onChange={(e) => setListingForm(f => ({ ...f, longitude: e.target.value }))}
                      placeholder="-74.0060"
                      step="any"
                      style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }} 
                        disabled={latLngLoading}
                        onBlur={async (e) => {
                          const lng = e.target.value;
                          const lat = listingForm.latitude;
                          if (!lat || !lng) return;
                          setLocationLoading(true);
                          try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
                            const data = await res.json();
                            if (data && data.display_name) {
                              setListingForm(f => ({ ...f, location: data.display_name, latitude: lat, longitude: lng }));
                            }
                          } catch (e) {
                            // ignore error
                          } finally {
                            setLocationLoading(false);
                          }
                        }}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const lng = e.target.value;
                            const lat = listingForm.latitude;
                            if (!lat || !lng) return;
                            setLocationLoading(true);
                            try {
                              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
                              const data = await res.json();
                              if (data && data.display_name) {
                                setListingForm(f => ({ ...f, location: data.display_name, latitude: lat, longitude: lng }));
                              }
                            } catch (e) {
                              // ignore error
                            } finally {
                              setLocationLoading(false);
                            }
                          }
                        }}
                    />
                  </div>
                </div>
                  {/* MiniMapPicker for location selection */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Pick Location on Map</label>
                    <MiniMapPicker
                      initialLat={listingForm.latitude ? parseFloat(listingForm.latitude) : 32.4279}
                      initialLng={listingForm.longitude ? parseFloat(listingForm.longitude) : 53.6880}
                      onLocationSelect={async (lat, lng) => {
                        setListingForm(f => ({ ...f, latitude: lat, longitude: lng }));
                        setLocationLoading(true);
                        try {
                          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
                          const data = await res.json();
                          if (data && data.display_name) {
                            setListingForm(f => ({ ...f, location: data.display_name, latitude: lat, longitude: lng }));
                          }
                        } catch (e) {
                          // ignore error, don't update location
                        } finally {
                          setLocationLoading(false);
                        }
                      }}
                    />
                  </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Price (per hour/session)</label>
                  <input 
                    type="number" 
                    value={listingForm.price}
                      onChange={(e) => setListingForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="50"
                    min="0"
                    step="0.01"
                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }} 
                  />
                </div>
                </div>
                <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Phone Number</label>
                  <input 
                    type="tel" 
                    value={listingForm.phone}
                      onChange={(e) => setListingForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+1-555-0123"
                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }} 
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Email</label>
                  <input 
                    type="email" 
                    value={listingForm.email}
                      onChange={(e) => setListingForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }} 
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Website</label>
                  <input 
                    type="url" 
                    value={listingForm.website}
                      onChange={(e) => setListingForm(f => ({ ...f, website: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }} 
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Features/Skills</label>
                  <input 
                    type="text" 
                    value={listingForm.features}
                      onChange={(e) => setListingForm(f => ({ ...f, features: e.target.value }))}
                    placeholder="React, Node.js, TypeScript (comma separated)"
                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }} 
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Images</label>
                  {/* Uploaded images management (for edit mode) */}
                  {editingListing && listingForm.images && listingForm.images.length > 0 && (
                    <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {listingForm.images.map((img, idx) => (
                        <div key={img} style={{ position: 'relative', width: 100, height: 100, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                          <img src={img} alt={`Uploaded ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => {
                              setListingForm(prev => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== idx)
                              }));
                            }}
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              background: 'rgba(255,255,255,0.7)',
                              borderRadius: '50%',
                              width: 24,
                              height: 24,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid #dc2626',
                              cursor: 'pointer',
                              zIndex: 10
                            }}
                          >
                            ×
                          </button>
                          {/* Set as Primary button */}
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setListingForm(prev => {
                                  const newImages = [...prev.images];
                                  const [selected] = newImages.splice(idx, 1);
                                  newImages.unshift(selected);
                                  return { ...prev, images: newImages };
                                });
                              }}
                              style={{
                                position: 'absolute',
                                bottom: 4,
                                left: 4,
                                background: '#3b82f6',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '2px 8px',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                                zIndex: 10
                              }}
                            >
                              Set as Primary
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <input 
                    type="file" 
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                        setImageFiles(files);
                        setImagePreviews(files.map(file => URL.createObjectURL(file)));
                    }}
                    style={{ width: '100%' }} 
                  />
                </div>
                  <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {imagePreviews.map((preview, index) => (
                      <div key={index} style={{ position: 'relative', width: 100, height: 100, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                        <img src={preview} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFiles(prev => prev.filter((_, i) => i !== index));
                            setImagePreviews(prev => prev.filter((_, i) => i !== index));
                          }}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            background: 'rgba(255,255,255,0.7)',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #dc2626',
                            cursor: 'pointer',
                            zIndex: 10
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                <button 
                  type="submit" 
                  disabled={isCreatingListing}
                  style={{ 
                    width: '100%', 
                    padding: 12, 
                    borderRadius: 8, 
                      background: '#3b82f6', 
                    color: '#fff', 
                    fontWeight: 600, 
                    fontSize: 16, 
                    border: 'none', 
                      boxShadow: '0 2px 8px rgba(37,99,235,0.08)', 
                      cursor: 'pointer', 
                      marginTop: 12,
                      transition: 'background 0.2s',
                  }}
                >
                    {isCreatingListing ? (uploadingImages ? 'Uploading Images...' : (editingListing ? 'Saving...' : 'Posting...')) : (editingListing ? 'Save Edit' : 'Create Post')}
                </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Header */}
        <TopBar>
          <Nav>
            <NavLink href="/">Home</NavLink>
            {isAuthenticated && user && user.userType === 'admin' && (
              <NavLink href="/admin">Admin Portal</NavLink>
            )}
          </Nav>
          {/* Remove Logout button from here */}
        </TopBar>
        {/* Main Content */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, height: '100%' }}>
          {/* Sidebar */}
          <div style={{ width: 400, borderRight: '1px solid #f1f5f9', padding: 32, background: '#fcfcfd', height: '100%', overflowY: 'auto', maxHeight: '100%' }}>
            {/* Segmented Tabs */}
            <div style={{ display: 'flex', marginBottom: 24, background: '#f3f4f6', borderRadius: 8, overflow: 'hidden', width: 260 }}>
              <button
                onClick={() => setActiveTab('general')}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: activeTab === 'general' ? '#fff' : 'transparent',
                  color: activeTab === 'general' ? '#3b82f6' : '#64748b',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 16,
                  borderRight: '1px solid #e5e7eb',
                  borderRadius: '8px 0 0 8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: activeTab === 'general' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none'
                }}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab('myposts')}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: activeTab === 'myposts' ? '#fff' : 'transparent',
                  color: activeTab === 'myposts' ? '#3b82f6' : '#64748b',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 16,
                  borderRadius: '0 8px 8px 0',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: activeTab === 'myposts' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none'
                }}
              >
                My Posts
              </button>
            </div>
            {/* Listings Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {(activeTab === 'general' ? generalListings : myListings).map(listing => (
                <div
                  key={listing.id || listing._id}
                  style={{ display: 'flex', background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden', marginBottom: 8, cursor: 'pointer' }}
                  onClick={() => { setSelectedListing(listing); setShowDetailsModal(true); }}
                >
                  <img src={(listing.images && listing.images.length > 0) ? listing.images[0] : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'} alt={listing.title} style={{ width: 100, height: 100, objectFit: 'cover' }} />
                  <div style={{ padding: 16, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#1e293b', marginBottom: 4 }}>{listing.title}</div>
                    <div style={{ color: '#6366f1', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                      <span style={{ background: '#6366f1', color: 'white', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500 }}>
                        {listing.category || 'Category'}
                      </span>
                    </div>
                    {listing.price && (
                      <div style={{ color: '#10b981', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                        ${listing.price}
                      </div>
                    )}
                    <div style={{ color: '#64748b', fontSize: 13, marginBottom: 2, position: 'relative' }}>
                      <span 
                        style={{ 
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 6px',
                          borderRadius: 4,
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#f1f5f9';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                        }}
                        onClick={() => {
                          if (listing.location) {
                            const encodedAddress = encodeURIComponent(listing.location);
                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
                          }
                        }}
                        title={listing.location || 'Address not specified'}
                      >
                        📍 {listing.location ? 'View on Map' : 'Address not specified'}
                      </span>
                    </div>
                    {listing.phone && (
                      <div style={{ color: '#64748b', fontSize: 13, marginBottom: 2 }}>
                        📞 {listing.phone}
                      </div>
                    )}
                    {/* Edit/Delete only in My Posts */}
                    {activeTab === 'myposts' && (
                      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                        <button onClick={(e) => { e.stopPropagation(); handleEditListing(listing); }} style={{ background: '#f59e42', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); setDeleteTargetId(listing.id || listing._id); }} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {(activeTab === 'myposts' && myListings.length === 0) && (
                <div style={{ color: '#64748b', fontSize: 15, textAlign: 'center', marginTop: 32 }}>You have not created any posts yet.</div>
              )}
              {(activeTab === 'general' && generalListings.length === 0) && (
                <div style={{ color: '#64748b', fontSize: 15, textAlign: 'center', marginTop: 32 }}>No posts yet.</div>
              )}
            </div>
          </div>
          {/* Map Area */}
          <div style={{ flex: 1, position: 'relative', background: '#f3f4f6', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
            <div style={{ width: '95%', height: '95%', borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', position: 'relative', background: '#e0e7ef', minHeight: 0 }}>
              <LeafletMap listings={listings} dimmed={showModal} />
            </div>
          </div>
        </div>
        {/* Footer Branding */}
        <div style={{ position: 'absolute', right: 32, bottom: 16, color: '#cbd5e1', fontWeight: 500, fontSize: 16 }}>
          www.nickelfox.com
        </div>
      </div>
      {/* Area 2: Right, Sign Up & Login at top */}
      <div style={{ minWidth: 220, maxWidth: 350, width: '22vw', height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', margin: 24, background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '32px 24px', position: 'relative' }}>
        {/* Success Message Toast at Bottom Right */}
        {successMessage && (
          <div style={{
            position: 'absolute',
            right: 24,
            bottom: 24,
            color: '#16a34a',
            background: '#d1fae5',
            borderRadius: 10,
            padding: '14px 28px',
            fontSize: 16,
            fontWeight: 600,
            textAlign: 'center',
            border: '2px solid #a7f3d0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            zIndex: 2000,
            minWidth: 180,
            maxWidth: 300
          }}>
            ✅ {successMessage}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: 12 }}>
          {!isAuthenticated ? (
            <>
              <button onClick={() => { setShowLogin(true); setShowSignup(false); }} style={{ padding: '8px 16px', borderRadius: 6, fontWeight: 500, fontSize: 14, color: '#64748b', background: '#fff', border: '1px solid #e2e8f0', textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer' }}>Login</button>
              <button onClick={() => { setShowSignup(true); setShowLogin(false); }} style={{ padding: '8px 16px', borderRadius: 6, fontWeight: 500, fontSize: 14, color: '#fff', background: '#3b82f6', border: 'none', textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer' }}>Sign Up</button>
            </>
          ) : (
            <div className="profile-dropdown" style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
              {/* User Avatar */}
              <div style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: '#3b82f6', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 600, 
                fontSize: 16,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                {user?.name ? user.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) : 'U'}
              </div>
              {/* User Name */}
              <span 
                style={{ 
                  fontWeight: 500, 
                  color: '#1e293b', 
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                {user?.name || 'User'}
              </span>
              
              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  minWidth: 200,
                  zIndex: 1001,
                  overflow: 'hidden',
                  marginTop: 8
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    fontWeight: 600,
                    color: '#1e293b'
                  }}>
                    {user?.name || 'User'}
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      setEditingListing(null);
                      setListingForm({
                        title: '', description: '', category: '', location: '', latitude: '', longitude: '', price: '', phone: '', email: '', website: '', features: '', images: []
                      });
                      setShowModal(true);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#64748b',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    Create Post
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#ef4444',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    Logout
                  </button>
                  {/* Admin Portal - Only show for admin users */}
                  {(user?.userType === 'admin' || user?.role === 'admin') && (
                    <button
                      onClick={() => window.location.href = '/admin'}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 16px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: '#3b82f6',
                        fontWeight: 600,
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      Admin Portal
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {/* Login/Signup Modal in Area 2 */}
        {(showLogin || showSignup) && (
          <div style={{
            position: 'absolute',
            top: 120, // was 60, now a little lower
            right: 0,
            left: 0,
            zIndex: 100,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            padding: 24,
            minWidth: 0,
          }}>
            <button
              onClick={() => { setShowLogin(false); setShowSignup(false); setFormError(''); clearError(); }}
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                background: 'transparent',
                border: 'none',
                fontSize: 22,
                cursor: 'pointer',
                color: '#64748b',
              }}
              aria-label="Close"
            >
              ×
            </button>
            {showLogin && (
              <form>
                <h2 style={{ marginBottom: 16 }}>Login</h2>
                {/* Only show Google Login Button */}
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 8,
                      background: '#fff',
                      color: '#1e293b',
                      fontWeight: 600,
                      fontSize: 16,
                      border: '1px solid #e5e7eb',
                      marginTop: 8,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10
                    }}
                  >
                    <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 20, height: 20 }} />
                    Sign in with Google
                  </button>
                </div>
              </form>
            )}
            {showSignup && (
              <form>
                <h2 style={{ marginBottom: 16 }}>Sign Up</h2>
                {/* Only show Google Signup Button */}
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 8,
                      background: '#fff',
                      color: '#1e293b',
                      fontWeight: 600,
                      fontSize: 16,
                      border: '1px solid #e5e7eb',
                      marginTop: 8,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10
                    }}
                  >
                    <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 20, height: 20 }} />
                    Sign up with Google
                  </button>
                </div>
              </form>
            )}
            
            {/* Email Verification Form */}
            {showVerification && (
              <form onSubmit={handleVerification}>
                <h2 style={{ marginBottom: 16 }}>Verify Your Email</h2>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
                  We sent a verification code to <strong>{pendingEmail}</strong>
                </p>
                {(formError || authError) && <div style={{ color: '#ef4444', background: '#fef2f2', borderRadius: 6, padding: 8, marginBottom: 12 }}>{formError || authError}</div>}
                {successMessage && <div style={{ color: '#16a34a', background: '#d1fae5', borderRadius: 6, padding: 8, marginBottom: 12 }}>{successMessage}</div>}
                <div style={{ marginBottom: 12 }}>
                  <label>Verification Code</label>
                  <input 
                    type="text" 
                    value={verificationCode} 
                    onChange={e => setVerificationCode(e.target.value)} 
                    placeholder="Enter 6-digit code"
                    style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} 
                    autoFocus 
                    maxLength={6}
                  />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, borderRadius: 8, background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', marginTop: 8, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>
                
                {/* Resend Code Button */}
                <div style={{ marginTop: 12, textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    style={{
                      background: 'transparent',
                      color: '#3b82f6',
                      border: 'none',
                      fontSize: 14,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Didn't receive the code? Resend
                  </button>
                </div>
                
                {/* Back to Signup Button */}
                <div style={{ marginTop: 8, textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowVerification(false);
                      setVerificationCode('');
                      setPendingEmail('');
                    }}
                    style={{
                      background: 'transparent',
                      color: '#64748b',
                      border: 'none',
                      fontSize: 14,
                      cursor: 'pointer'
                    }}
                  >
                    ← Back to Sign Up
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 32,
            minWidth: 320,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            position: 'relative',
            textAlign: 'center',
          }}>
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Delete Post</h3>
            <p style={{ color: '#64748b', marginBottom: 24 }}>Are you sure you want to delete this post? This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button onClick={() => { setShowDeleteModal(false); setDeleteTargetId(null); }} style={{ background: '#e5e7eb', color: '#1e293b', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDeleteListing} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
      {/* Listing Details Modal */}
      {showDetailsModal && selectedListing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          pointerEvents: 'auto',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 20,
            padding: 0,
            minWidth: 400,
            maxWidth: 540,
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
            position: 'relative',
            maxHeight: '92vh',
            overflowY: 'auto',
            width: '100%',
          }}>
            <button
              onClick={() => setShowDetailsModal(false)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'rgba(243,244,246,0.8)',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                fontSize: 22,
                cursor: 'pointer',
                color: '#64748b',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                zIndex: 10
              }}
              aria-label="Close"
            >
              ×
            </button>
            {/* Image carousel */}
            <div style={{
              width: '100%',
              background: '#f3f4f6',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 220,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {selectedListing.images && selectedListing.images.length > 0 ? (
                <div style={{ display: 'flex', gap: 0, width: '100%', overflowX: 'auto', scrollSnapType: 'x mandatory' }}>
                  {selectedListing.images.map((img, idx) => (
                    <img
                      key={img}
                      src={img}
                      alt={`Image ${idx + 1}`}
                      style={{
                        width: 320,
                        height: 220,
                        objectFit: 'cover',
                        borderRadius: 0,
                        border: 'none',
                        margin: 0,
                        scrollSnapAlign: 'center',
                        flexShrink: 0,
                        cursor: 'pointer'
                      }}
                      onClick={() => setFullImage(img)}
                    />
                  ))}
                </div>
              ) : (
                <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" alt="Default" style={{ width: 320, height: 220, objectFit: 'cover', borderRadius: 0, border: 'none' }} />
              )}
            </div>
            <div style={{ padding: '32px 32px 24px 32px' }}>
              <h2 style={{ fontWeight: 700, fontSize: 26, color: '#1e293b', marginBottom: 10, letterSpacing: '-0.5px' }}>{selectedListing.title}</h2>
              <div style={{ color: '#6366f1', fontWeight: 600, fontSize: 14, marginBottom: 8, display: 'inline-block', background: '#eef2ff', borderRadius: 8, padding: '2px 12px' }}>{selectedListing.category}</div>
              
              {/* Creator Profile Section */}
              {selectedListing.user && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  marginBottom: 16, 
                  padding: '12px 16px', 
                  background: '#f8fafc', 
                  borderRadius: 12, 
                  border: '1px solid #e2e8f0' 
                }}>
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    background: '#3b82f6', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 600, 
                    fontSize: 18,
                    flexShrink: 0
                  }}>
                    {selectedListing.user.firstName && selectedListing.user.lastName ? 
                      (selectedListing.user.firstName[0] + selectedListing.user.lastName[0]).toUpperCase() : 
                      (selectedListing.user.username ? selectedListing.user.username.slice(0, 2).toUpperCase() : 'U')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 16, color: '#1e293b', marginBottom: 2 }}>
                      {selectedListing.user.firstName && selectedListing.user.lastName ? 
                        `${selectedListing.user.firstName} ${selectedListing.user.lastName}` : 
                        selectedListing.user.username || 'Unknown User'}
                    </div>
                    <div style={{ fontSize: 14, color: '#64748b' }}>
                      {selectedListing.user.email || 'No email provided'}
                    </div>
                    {selectedListing.user.role && (
                      <div style={{ 
                        fontSize: 12, 
                        color: selectedListing.user.role === 'admin' ? '#dc2626' : '#059669', 
                        fontWeight: 500,
                        marginTop: 2
                      }}>
                        {selectedListing.user.role === 'admin' ? '👑 Admin' : '👤 Regular User'}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div style={{ color: '#64748b', fontSize: 15, margin: '18px 0 10px 0', lineHeight: 1.7 }}><strong>Description:</strong> {selectedListing.description}</div>
              <div style={{ color: '#64748b', fontSize: 15, marginBottom: 8 }}>
                <strong>Location:</strong> {selectedListing.location && (
                  <span
                    style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', marginLeft: 4 }}
                    onClick={() => {
                      const encodedAddress = encodeURIComponent(selectedListing.location);
                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
                    }}
                  >
                    {selectedListing.location}
                  </span>
                )}
              </div>
              <div style={{ color: '#64748b', fontSize: 15, marginBottom: 8 }}><strong>Price:</strong> {selectedListing.price ? `$${selectedListing.price}` : 'N/A'}</div>
              <div style={{ color: '#64748b', fontSize: 15, marginBottom: 8 }}><strong>Email:</strong> {selectedListing.contact?.email || 'N/A'}</div>
              <div style={{ color: '#64748b', fontSize: 15, marginBottom: 8 }}><strong>Phone:</strong> {selectedListing.contact?.phone || 'N/A'}</div>
              <div style={{ color: '#64748b', fontSize: 15, marginBottom: 8 }}><strong>Website:</strong> {selectedListing.contact?.website ? (
                <a href={selectedListing.contact.website} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>{selectedListing.contact.website}</a>
              ) : 'N/A'}</div>
              <div style={{ color: '#64748b', fontSize: 15, marginBottom: 8 }}><strong>Features:</strong> {selectedListing.features && selectedListing.features.length > 0 ? selectedListing.features.join(', ') : 'N/A'}</div>
            </div>
          </div>
          {/* Full Image Overlay */}
          {fullImage && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.85)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
              onClick={() => setFullImage(null)}
            >
              <img src={fullImage} alt="Full" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }} />
              <button
                onClick={(e) => { e.stopPropagation(); setFullImage(null); }}
                style={{
                  position: 'absolute',
                  top: 32,
                  right: 32,
                  background: 'rgba(243,244,246,0.8)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  fontSize: 26,
                  cursor: 'pointer',
                  color: '#64748b',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                  zIndex: 10
                }}
                aria-label="Close Full Image"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Mascot Component */}
      {showMascot && (
        <Mascot
          status={mascotStatus}
          position="bottom-right"
          onInteraction={handleMascotInteraction}
          showOnHover={true}
          targetElement=".leaflet-container"
        />
      )}
    </div>
  );
};

export default HomePage; 