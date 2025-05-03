import { useEffect, useState } from 'react';
import { bookingsApi } from '../../services/api';
import BookingCard from '../../components/bookings/BookingCard';
import { BOOKING_STATUS } from '../../config/constants';
import { toast } from 'react-hot-toast';
import { TicketIcon } from 'lucide-react';

const BookingHistory = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const response = await bookingsApi.getUserBookings();
        const bookingsData = response.data.data || [];
        setBookings(bookingsData);
        setFilteredBookings(bookingsData);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        toast.error('Failed to load bookings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, []);
  
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === statusFilter));
    }
  }, [statusFilter, bookings]);
  
  const statusCounts = {
    [BOOKING_STATUS.CONFIRMED]: bookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED).length,
    [BOOKING_STATUS.PAYMENT_PENDING]: bookings.filter(b => b.status === BOOKING_STATUS.PAYMENT_PENDING).length,
    [BOOKING_STATUS.CANCELLED]: bookings.filter(b => b.status === BOOKING_STATUS.CANCELLED).length,
  };

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
      
      {/* Status filter tabs */}
      <div className="mb-8 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                statusFilter === 'all'
                  ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setStatusFilter('all')}
            >
              All ({bookings.length})
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                statusFilter === BOOKING_STATUS.CONFIRMED
                  ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setStatusFilter(BOOKING_STATUS.CONFIRMED)}
            >
              Confirmed ({statusCounts[BOOKING_STATUS.CONFIRMED]})
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                statusFilter === BOOKING_STATUS.PAYMENT_PENDING
                  ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setStatusFilter(BOOKING_STATUS.PAYMENT_PENDING)}
            >
              Payment Pending ({statusCounts[BOOKING_STATUS.PAYMENT_PENDING]})
            </button>
          </li>
          <li>
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                statusFilter === BOOKING_STATUS.CANCELLED
                  ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setStatusFilter(BOOKING_STATUS.CANCELLED)}
            >
              Cancelled ({statusCounts[BOOKING_STATUS.CANCELLED]})
            </button>
          </li>
        </ul>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-6">
          {filteredBookings.map(booking => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <TicketIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookings found</h3>
          <p className="text-gray-500 mb-6">
            {statusFilter === 'all'
              ? "You haven't made any bookings yet."
              : `You don't have any ${statusFilter.toLowerCase().replace('_', ' ')} bookings.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;