import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingsApi } from '../../services/api';
import { BOOKING_STATUS, STATUS_COLORS } from '../../config/constants';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  AlertTriangle,
  Printer,
  Download,
  AlertCircle
} from 'lucide-react';

const BookingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState<any>(null);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await bookingsApi.getBookingById(id);
        setBooking(response.data.data);
        
        // Parse passenger details from JSON string
        if (response.data.data.passengerDetails) {
          const parsedDetails = JSON.parse(response.data.data.passengerDetails);
          setPassengers(parsedDetails.passengers || []);
        }
      } catch (error) {
        console.error('Failed to fetch booking details:', error);
        setError('Could not load booking details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id]);
  
  const getStatusBadgeClass = (status: string) => {
    return `px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[status]}`;
  };
  
  const getStatusText = (status: string) => {
    switch(status) {
      case BOOKING_STATUS.PAYMENT_PENDING:
        return 'Payment Pending';
      case BOOKING_STATUS.CONFIRMED:
        return 'Confirmed';
      case BOOKING_STATUS.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };
  
  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }
    
    setIsCancelling(true);
    
    try {
      const response = await bookingsApi.cancelBooking(id!);
      setBooking(response.data.data);
      toast.success('Booking cancelled successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to cancel booking. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container-custom py-12 min-h-[60vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }
  
  if (error || !booking) {
    return (
      <div className="container-custom py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error || 'Booking not found'}</p>
          <button 
            onClick={() => navigate('/bookings')}
            className="btn btn-primary inline-flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }
  
  const departureDate = new Date(booking.train.departureTime);
  const arrivalDate = new Date(booking.train.arrivalTime);
  const bookingDate = new Date(booking.bookingTime);
  
  // Calculate if the booking is for future travel
  const isFutureTravel = departureDate.getTime() > new Date().getTime();
  
  // Calculate if the booking can be cancelled
  // For this demo, we'll allow cancellation if the booking is confirmed and for future travel
  const canBeCancelled = booking.status === BOOKING_STATUS.CONFIRMED && isFutureTravel;

  return (
    <div className="container-custom py-12">
      <Link 
        to="/bookings"
        className="inline-flex items-center text-[var(--primary-color)] hover:underline mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to My Bookings
      </Link>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white p-6">
            <div className="flex flex-wrap justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold mb-1">Booking #{booking.id}</h1>
                <p className="text-white text-opacity-90">
                  Booked on {format(bookingDate, 'MMMM d, yyyy')} at {format(bookingDate, 'HH:mm')}
                </p>
              </div>
              
              <span className={getStatusBadgeClass(booking.status)}>
                {getStatusText(booking.status)}
              </span>
            </div>
          </div>
          
          {/* Train Details */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Train Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="font-medium text-lg">{booking.train.name}</p>
                <p className="text-gray-500 mb-3">Train #{booking.train.trainNumber}</p>
                
                <div className="flex items-center mb-3">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <span>{format(departureDate, 'EEEE, MMMM d, yyyy')}</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-start">
                  <div className="min-w-[60px] text-right mr-3">
                    <p className="font-bold">{format(departureDate, 'HH:mm')}</p>
                    <p className="text-sm text-gray-500">{format(departureDate, 'MMM d')}</p>
                  </div>
                  <div className="flex flex-col items-center mx-2">
                    <div className="w-3 h-3 rounded-full bg-[var(--primary-color)]"></div>
                    <div className="w-0.5 h-16 bg-gray-300 my-1"></div>
                    <div className="w-3 h-3 rounded-full bg-[var(--accent-color)]"></div>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{booking.train.source.name}</p>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      Departure
                    </p>
                    
                    <div className="mt-8">
                      <p className="font-medium">{booking.train.destination.name}</p>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        Arrival
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Passenger Details */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold">Passenger Details</h2>
              <span className="ml-auto bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {booking.numberOfSeats} {booking.numberOfSeats === 1 ? 'Passenger' : 'Passengers'}
              </span>
            </div>
            
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {passengers.map((passenger, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{passenger.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{passenger.age} years</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{passenger.gender}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Payment Details */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Fare per passenger</p>
                <p className="font-medium">₹{booking.train.price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Number of passengers</p>
                <p className="font-medium">{booking.numberOfSeats}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total fare</p>
                <p className="font-bold text-lg text-[var(--primary-color)]">
                  ₹{booking.totalPrice.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment status</p>
                <p className="font-medium">
                  <span className={getStatusBadgeClass(booking.status)}>
                    {getStatusText(booking.status)}
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="p-6 bg-gray-50 flex flex-wrap justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <button 
                className="btn btn-outline inline-flex items-center"
                onClick={() => window.print()}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </button>
              
              <button className="btn btn-outline inline-flex items-center">
                <Download className="mr-2 h-4 w-4" />
                Download E-Ticket
              </button>
            </div>
            
            <div>
              {booking.status === BOOKING_STATUS.PAYMENT_PENDING && (
                <Link 
                  to={`/payment/${booking.id}`}
                  className="btn btn-accent inline-flex items-center"
                >
                  Complete Payment
                </Link>
              )}
              
              {canBeCancelled && (
                <button
                  className="btn bg-red-600 text-white hover:bg-red-700 inline-flex items-center"
                  onClick={handleCancelBooking}
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}
            </div>
          </div>
          
          {/* Info Box */}
          {booking.status === BOOKING_STATUS.CONFIRMED && !canBeCancelled && (
            <div className="p-6 bg-yellow-50 border-t border-yellow-100">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-yellow-700">
                  This booking cannot be cancelled as the departure date has passed or is too close.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;