import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import TrainSearch from './pages/trains/TrainSearch';
import TrainDetails from './pages/trains/TrainDetails';
import BookingForm from './pages/bookings/BookingForm';
import PaymentPage from './pages/bookings/PaymentPage';
import UserDashboard from './pages/user/UserDashboard';
import BookingHistory from './pages/user/BookingHistory';
import BookingDetails from './pages/user/BookingDetails';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageTrains from './pages/admin/ManageTrains';
import ManageStations from './pages/admin/ManageStations';
import ViewBookings from './pages/admin/ViewBookings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/trains" element={<TrainSearch />} />
            <Route path="/trains/:id" element={<TrainDetails />} />
            
            {/* Protected routes for authenticated users */}
            <Route path="/booking/:trainId" element={
              <PrivateRoute>
                <BookingForm />
              </PrivateRoute>
            } />
            <Route path="/payment/:bookingId" element={
              <PrivateRoute>
                <PaymentPage />
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            } />
            <Route path="/bookings" element={
              <PrivateRoute>
                <BookingHistory />
              </PrivateRoute>
            } />
            <Route path="/bookings/:id" element={
              <PrivateRoute>
                <BookingDetails />
              </PrivateRoute>
            } />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="trains" element={<ManageTrains />} />
            <Route path="stations" element={<ManageStations />} />
            <Route path="bookings" element={<ViewBookings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;