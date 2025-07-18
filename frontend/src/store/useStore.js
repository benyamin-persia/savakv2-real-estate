import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
axios.defaults.withCredentials = true;

const useStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Listings state
      listings: [],
      currentListing: null,
      categories: [],
      filters: {
        category: '',
        location: '',
        search: ''
      },
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      },

      // Map state
      mapCenter: [32.4279, 53.6880], // Center of Iran
      mapZoom: 6,
      selectedMarker: null,

      // Chat state
      chats: [],
      currentChat: null,
      messages: [],

      // UI state
      sidebarOpen: false,
      modalOpen: false,
      modalType: null,

      // Auth actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('/api/auth/login', credentials);
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false
          });
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          currentListing: null,
          currentChat: null,
          messages: []
        });
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('/api/auth/register', userData);
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false
          });
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false
          });
          throw error;
        }
      },

      // Listings actions
      fetchListings: async (params = {}) => {
        set({ isLoading: true });
        try {
          const response = await axios.get('/api/listings', { params });
          set({
            listings: response.data.data,
            pagination: response.data.pagination,
            isLoading: false
          });
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to fetch listings',
            isLoading: false
          });
          throw error;
        }
      },

      fetchListing: async (id) => {
        set({ isLoading: true });
        try {
          const response = await axios.get(`/api/listings/${id}`);
          set({
            currentListing: response.data.data,
            isLoading: false
          });
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to fetch listing',
            isLoading: false
          });
          throw error;
        }
      },

      createListing: async (listingData) => {
        set({ isLoading: true });
        try {
          console.log('Creating listing with data:', listingData);
          const response = await axios.post('/api/listings', listingData);
          console.log('Listing created successfully:', response.data);
          const newListing = response.data.data;
          set(state => ({
            listings: [newListing, ...state.listings],
            isLoading: false
          }));
          return response.data;
        } catch (error) {
          console.error('Error creating listing:', error);
          set({
            error: error.response?.data?.message || 'Failed to create listing',
            isLoading: false
          });
          throw error;
        }
      },

      updateListing: async (id, listingData) => {
        set({ isLoading: true });
        try {
          const response = await axios.put(`/api/listings/${id}`, listingData);
          const updatedListing = response.data.data;
          set(state => ({
            listings: state.listings.map(listing =>
              listing.id === id ? updatedListing : listing
            ),
            currentListing: state.currentListing?.id === id ? updatedListing : state.currentListing,
            isLoading: false
          }));
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to update listing',
            isLoading: false
          });
          throw error;
        }
      },

      deleteListing: async (id) => {
        set({ isLoading: true });
        try {
          await axios.delete(`/api/listings/${id}`);
          set(state => ({
            listings: state.listings.filter(listing => listing.id !== id),
            currentListing: state.currentListing?.id === id ? null : state.currentListing,
            isLoading: false
          }));
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to delete listing',
            isLoading: false
          });
          throw error;
        }
      },

      fetchCategories: async () => {
        try {
          const response = await axios.get('/api/listings/categories/all');
          set({ categories: response.data.data });
          return response.data;
        } catch (error) {
          console.error('Failed to fetch categories:', error);
        }
      },

      // Filter actions
      setFilters: (filters) => {
        set({ filters: { ...get().filters, ...filters } });
      },

      clearFilters: () => {
        set({ filters: { category: '', location: '', search: '' } });
      },

      // Map actions
      setMapCenter: (center) => {
        set({ mapCenter: center });
      },

      setMapZoom: (zoom) => {
        set({ mapZoom: zoom });
      },

      setSelectedMarker: (marker) => {
        set({ selectedMarker: marker });
      },

      // Chat actions
      fetchChats: async () => {
        try {
          const response = await axios.get('/api/chat');
          set({ chats: response.data.data });
          return response.data;
        } catch (error) {
          console.error('Failed to fetch chats:', error);
        }
      },

      fetchMessages: async (chatId) => {
        try {
          const response = await axios.get(`/api/chat/${chatId}/messages`);
          set({ messages: response.data.data });
          return response.data;
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        }
      },

      sendMessage: async (chatId, content) => {
        try {
          const response = await axios.post(`/api/chat/${chatId}/messages`, { content });
          const newMessage = response.data.data;
          set(state => ({
            messages: [...state.messages, newMessage]
          }));
          return response.data;
        } catch (error) {
          console.error('Failed to send message:', error);
          throw error;
        }
      },

      // UI actions
      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },

      setModalOpen: (open, type = null) => {
        set({ modalOpen: open, modalType: type });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'savakv2-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        filters: state.filters,
        mapCenter: state.mapCenter,
        mapZoom: state.mapZoom
      })
    }
  )
);

export default useStore; 