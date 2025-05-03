import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { BOOKING_STATUS } from '../../config/constants';
import { format } from 'date-fns';
import {
  Train,
  User,
  CreditCard,
  Calendar,
  Clock,
  ChevronRight,
  TicketIcon
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const response = await bookingsApi.getUserBookings();
        setBookings(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, []);

  // Separate bookings by status
  const upcomingBookings = bookings.filter(
    booking => booking.status === BOOKING_STATUS.CONFIRMED
  ).sort((a, b) => new Date(a.train.departureTime).getTime() - new Date(b.train.departureTime).getTime());
  
  const pendingBookings = bookings.filter(
    booking => booking.status === BOOKING_STATUS.PAYMENT_PENDING
  );
  
  const cancelledBookings = bookings.filter(
    booking => booking.status === BOOKING_STATUS.CANCELLED
  );
  
  return (
    <div className="container-custom py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.username}</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Link to="/trains" className="btn btn-primary inline-flex items-center">
            <Train className="mr-2 h-4 w-4" />
            Find Trains
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-6 lg:col-span-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md text-white p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-white text-opacity-80 mb-1">Total Bookings</p>
                <h3 className="text-3xl font-bold">{bookings.length}</h3>
              </div>
              <TicketIcon className="h-10 w-10 text-white text-opacity-30" />
            </div>
          </div>
        </div>
        
        <div className="md:col-span-6 lg:col-span-3">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md text-white p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-white text-opacity-80 mb-1">Confirmed</p>
                <h3 className="text-3xl font-bold">{upcomingBookings.length}</h3>
              </div>
              <Calendar className="h-10 w-10 text-white text-opacity-30" />
            </div>
          </div>
        </div>
        
        <div className="md:col-span-6 lg:col-span-3">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-md text-white p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-white text-opacity-80 mb-1">Pending Payment</p>
                <h3 className="text-3xl font-bold">{pendingBookings.length}</h3>
              </div>
              <CreditCard className="h-10 w-10 text-white text-opacity-30" />
            </div>
          </div>
        </div>
        
        <div className="md:col-span-6 lg:col-span-3">
          <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-lg shadow-md text-white p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-white text-opacity-80 mb-1">Cancelled</p>
                <h3 className="text-3xl font-bold">{cancelledBookings.length}</h3>
              </div>
              <Clock className="h-10 w-10 text-white text-opacity-30" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="bg-[var(--primary-color)] text-white p-4 rounded-full mb-3">
                <User className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-semibold">{user?.username}</h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Role</span>
                <span className="font-medium">{user?.role}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">2023</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <Link to="/profile" className="btn btn-outline w-full">
                Edit Profile
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/trains" className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Train className="h-5 w-5 text-gray-500 mr-3" />
                  <span>Search Trains</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
              <Link to="/bookings" className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <TicketIcon className="h-5 w-5 text-gray-500 mr-3" />
                  <span>View All Bookings</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Upcoming bookings card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upcoming Journeys</h2>
              <Link to="/bookings" className="text-[var(--primary-color)] text-sm hover:underline">
                View all
              </Link>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
              </div>
            ) : upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.slice(0, 3).map((booking) => {
                  const departureDate = new Date(booking.train.departureTime);
                  const isToday = new Date().toDateString() === departureDate.toDateString();
                  
                  // Parse passenger details
                  const passengerDetails = JSON.parse(booking.passengerDetails);
                  const passengersCount = passengerDetails.passengers ? passengerDetails.passengers.length : 0;
                  
                  return (
                    <Link
                      key={booking.id}
                      to={`/bookings/${booking.id}`}
                      className="block bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{booking.train.name}</h3>
                          <p className="text-sm text-gray-500">#{booking.train.trainNumber}</p>
                        </div>
                        {isToday && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Today
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm mb-3">
                        <div>
                          <p className="font-medium">{format(departureDate, 'HH:mm')}</p>
                          <p className="text-gray-500">{booking.train.source.name}</p>
                        </div>
                        <div className="flex-1 mx-2 border-t border-gray-300"></div>
                        <div>
                          <p className="font-medium">{format(new Date(booking.train.arrivalTime), 'HH:mm')}</p>
                          <p className="text-gray-500">{booking.train.destination.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{format(departureDate, 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{passengersCount} {passengersCount === 1 ? 'passenger' : 'passengers'}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-100 inline-flex rounded-full p-4 mb-4">
                  <Calendar className="h-6 w-6 text-gray-500" />
                </div>
                <p className="text-gray-600 mb-4">You don't have any upcoming journeys</p>
                <Link to="/trains" className="btn btn-primary">
                  Book a Train
                </Link>
              </div>
            )}
          </div>
          
          {/* Payments pending card */}
          {pendingBookings.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Payments Pending</h2>
              
              <div className="space-y-4">
                {pendingBookings.slice(0, 2).map((booking) => (
                  <div key={booking.id} className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{booking.train.name}</h3>
                        <p className="text-sm text-gray-500">
                          {booking.train.source.name} to {booking.train.destination.name}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-[var(--primary-color)]">
                        ₹{booking.totalPrice.toFixed(2)}
                      </span>
                    </div>
                    
                    <Link 
                      to={`/payment/${booking.id}`}
                      className="btn btn-primary btn-sm w-full mt-2"
                    >
                      Complete Payment
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;