import { format } from 'date-fns';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BOOKING_STATUS, STATUS_COLORS } from '../../config/constants';

interface BookingCardProps {
  booking: any;
}

const BookingCard = ({ booking }: BookingCardProps) => {
  const departureDate = new Date(booking.train.departureTime);
  const bookingDate = new Date(booking.bookingTime);
  
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
  
  // Parse passenger details from JSON string
  const passengerDetails = JSON.parse(booking.passengerDetails);
  const passengers = passengerDetails.passengers || [];

  return (
    <div className="card mb-6 hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{booking.train.name} - #{booking.train.trainNumber}</h3>
            <p className="text-sm text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Booked on {format(bookingDate, 'MMM d, yyyy')}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${STATUS_COLORS[booking.status]}`}>
            {getStatusText(booking.status)}
          </span>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center my-3">
            <div className="text-right mr-3">
              <p className="font-medium">{format(departureDate, 'HH:mm')}</p>
              <p className="text-sm text-gray-500">{booking.train.source.name}</p>
            </div>
            <div className="flex flex-col items-center px-2">
              <div className="w-2 h-2 rounded-full bg-[var(--primary-color)]"></div>
              <div className="w-0.5 h-6 bg-gray-300 my-1"></div>
              <div className="w-2 h-2 rounded-full bg-[var(--accent-color)]"></div>
            </div>
            <div className="ml-3">
              <p className="font-medium">{format(new Date(booking.train.arrivalTime), 'HH:mm')}</p>
              <p className="text-sm text-gray-500">{booking.train.destination.name}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-between items-center text-sm">
          <div>
            <p>
              <span className="text-gray-600">Passengers:</span>{' '}
              <span className="font-medium">{booking.numberOfSeats}</span>
            </p>
            <p>
              <span className="text-gray-600">Total:</span>{' '}
              <span className="font-bold text-[var(--primary-color)]">
                ₹{booking.totalPrice.toFixed(2)}
              </span>
            </p>
          </div>
          
          <div className="mt-3 sm:mt-0">
            {booking.status === BOOKING_STATUS.PAYMENT_PENDING && (
              <Link 
                to={`/payment/${booking.id}`} 
                className="btn btn-accent mr-3"
              >
                Pay Now
              </Link>
            )}
            
            <Link 
              to={`/bookings/${booking.id}`} 
              className="btn btn-outline flex items-center"
            >
              View Details
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;