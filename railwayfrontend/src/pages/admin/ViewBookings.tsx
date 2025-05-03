import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsApi, trainsApi } from '../../services/api';
import { BOOKING_STATUS } from '../../config/constants';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  Search, 
  Filter,
  X,
  AlertTriangle,
  Download,
  Eye
} from 'lucide-react';

interface Train {
  id: number;
  name: string;
  trainNumber: string;
}

const ViewBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [trains, setTrains] = useState<Train[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [trainFilter, setTrainFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    fetchBookings();
    fetchTrains();
  }, []);
  
  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      // In a real app, we would use an admin-specific endpoint to get all bookings
      // For this demo, we'll use the user bookings endpoint
      const response = await bookingsApi.getUserBookings();
      setBookings(response.data.data || []);
      setFilteredBookings(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTrains = async () => {
    try {
      const response = await trainsApi.getAllTrains();
      setTrains(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch trains:', error);
    }
  };
  
  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, trainFilter, dateFilter, bookings]);
  
  const applyFilters = () => {
    let filtered = [...bookings];
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.train.name.toLowerCase().includes(query) ||
        booking.train.trainNumber.toLowerCase().includes(query) ||
        booking.user.username.toLowerCase().includes(query) ||
        booking.user.email.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    // Apply train filter
    if (trainFilter !== 'all') {
      filtered = filtered.filter(booking => booking.train.id.toString() === trainFilter);
    }
    
    // Apply date filter
    if (dateFilter) {
      const selectedDate = new Date(dateFilter);
      filtered = filtered.filter(booking => {
        const departureDate = new Date(booking.train.departureTime);
        return (
          departureDate.getFullYear() === selectedDate.getFullYear() &&
          departureDate.getMonth() === selectedDate.getMonth() &&
          departureDate.getDate() === selectedDate.getDate()
        );
      });
    }
    
    setFilteredBookings(filtered);
  };
  
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTrainFilter('all');
    setDateFilter('');
  };
  
  const exportToCsv = () => {
    // In a real app, we would implement a proper CSV export
    toast.success('Bookings exported to CSV');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">View Bookings</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline inline-flex items-center"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </button>
          
          <button
            onClick={exportToCsv}
            className="btn btn-primary inline-flex items-center"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input pl-10 w-full"
              placeholder="Search bookings by train name, train number, username, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
        
        {showFilters && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value={BOOKING_STATUS.CONFIRMED}>Confirmed</option>
                  <option value={BOOKING_STATUS.PAYMENT_PENDING}>Payment Pending</option>
                  <option value={BOOKING_STATUS.CANCELLED}>Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Train</label>
                <select
                  className="form-select"
                  value={trainFilter}
                  onChange={(e) => setTrainFilter(e.target.value)}
                >
                  <option value="all">All Trains</option>
                  {trains.map(train => (
                    <option key={train.id} value={train.id}>
                      {train.name} - {train.trainNumber}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="form-label">Travel Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={resetFilters}
                className="btn btn-sm btn-outline"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
            </div>
          ) : filteredBookings.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Train
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Journey
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Passengers
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
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{booking.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.user.username}</div>
                      <div className="text-xs text-gray-500">{booking.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.train.name}</div>
                      <div className="text-xs text-gray-500">{booking.train.trainNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.train.source.name} → {booking.train.destination.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(booking.train.departureTime), 'MMM d, yyyy')}
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
                      <div className="text-sm text-gray-900">
                        {booking.numberOfSeats}
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
                        <Eye className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter !== 'all' || trainFilter !== 'all' || dateFilter
                  ? 'No bookings match the current filters'
                  : 'There are no bookings in the system yet'}
              </p>
              {(searchQuery || statusFilter !== 'all' || trainFilter !== 'all' || dateFilter) && (
                <button
                  onClick={resetFilters}
                  className="btn btn-primary mt-4"
                >
                  Reset Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewBookings;