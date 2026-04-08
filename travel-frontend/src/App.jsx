import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Tours from './pages/Tours';
import TourDetails from './pages/TourDetails'; // <-- Thêm dòng import này
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';
import Contact from './pages/Contact';
import Chatbot from './components/Chatbot';
import ItineraryPage from './pages/ItineraryPage';
import AdminDashboard from './pages/AdminDashboard';
import Payments from './pages/Payments';
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow bg-gray-50">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tours" element={<Tours />} />
              <Route path="/tours/:id" element={<TourDetails />} /> {/* <-- Thêm Route này */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/itinerary" element={<ItineraryPage />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/payments" element={<Payments />} />
            </Routes>
          </main>
          <Chatbot />
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;