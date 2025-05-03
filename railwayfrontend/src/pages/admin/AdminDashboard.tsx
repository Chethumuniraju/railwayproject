import { useEffect, useState } from 'react';
import { trainsApi, stationsApi, bookingsApi } from '../../services/api';
import { BOOKING_STATUS } from '../../config/constants';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Users,
  Train,
  MapPin,
  CreditCard,
  BarChart2,
  Calendar,
  ChevronRight,
  Clock,
  TrendingUp
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTrains: 0,
    totalStations: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0
  });
  
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // In a real app, we'd have a specific endpoint for admin dashboard stats
        // For this demo, we'll simulate by fetching multiple resources
        
        const [trainsResponse, stationsResponse, bookingsResponse] = await Promise.all([
          trainsApi.getAllTrains(),
          stationsApi.getAllStations(),
          bookingsApi.getUserBookings() // In reality, this would be an admin-specific endpoint
        ]);
        
        const trains = trainsResponse.data.data || [];
        const stations = stationsResponse.data.data || [];
        const bookings = bookingsResponse.data.data || [];
        
        const pendingBookings = bookings.filter(b => b.status === BOOKING_STATUS.PAYMENT_PENDING);
        const confirmedBookings = bookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED);
        const cancelledBookings = bookings.filter(b => b.status === BOOKING_STATUS.CANCELLED);
        
        setStats({
          totalTrains: trains.length,
          totalStations: stations.length,
          totalBookings: bookings.length,
          pendingBookings: pendingBookings.length,
          confirmedBookings: confirmedBookings.length,
          cancelledBookings: cancelledBookings.length
        });
        
        // Sort bookings by booking time (most recent first)
        const sortedBookings = [...bookings].sort(
          (a, b) => new Date(b.bookingTime).getTime() - new Date(a.bookingTime).getTime()
        );
        
        setRecentBookings(sortedBookings.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 mb-1">Total Trains</p>
              <h3 className="text-3xl font-bold">{stats.totalTrains}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Train className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/trains" className="text-sm text-blue-600 hover:underline flex items-center">
              Manage Trains
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 mb-1">Total Stations</p>
              <h3 className="text-3xl font-bold">{stats.totalStations}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/stations" className="text-sm text-green-600 hover:underline flex items-center">
              Manage Stations
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 mb-1">Total Bookings</p>
              <h3 className="text-3xl font-bold">{stats.totalBookings}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/bookings" className="text-sm text-purple-600 hover:underline flex items-center">
              View All Bookings
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Booking Stats */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Booking Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-100 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-green-600 text-sm">Confirmed Bookings</p>
              <p className="text-2xl font-bold">{stats.confirmedBookings}</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100 flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-yellow-600 text-sm">Pending Payments</p>
              <p className="text-2xl font-bold">{stats.pendingBookings}</p>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4 border border-red-100 flex items-center">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-red-600 text-sm">Cancelled Bookings</p>
              <p className="text-2xl font-bold">{stats.cancelledBookings}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Recent Bookings</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Train
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{booking.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.train.name}</div>
                    <div className="text-xs text-gray-500">{booking.train.trainNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.train.source.name} → {booking.train.destination.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(new Date(booking.bookingTime), 'MMM d, yyyy')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(booking.bookingTime), 'HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{booking.totalPrice.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === BOOKING_STATUS.CONFIRMED
                        ? 'bg-green-100 text-green-800'
                        : booking.status === BOOKING_STATUS.PAYMENT_PENDING
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/bookings/${booking.id}`} className="text-[var(--primary-color)] hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {recentBookings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No bookings found</p>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200">
          <Link 
            to="/admin/bookings"
            className="text-[var(--primary-color)] hover:underline flex items-center justify-center"
          >
            View All Bookings
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

// Need to define these components for the dashboard
const CheckCircle = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
};

const X = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
};

export default AdminDashboard;