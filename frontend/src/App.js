import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import AdminRoute from './components/auth/AdminRoute';

function App() {
  return (
    <>
      <Helmet>
        <title>SavakV2 - People Listing Map</title>
        <meta name="description" content="Find and connect with different types of people in your area" />
      </Helmet>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
      </Routes>
    </>
  );
}

export default App; 