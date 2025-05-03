import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { trainsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Clock3, 
  Train, 
  MapPin, 
  Users, 
  CreditCard,
  AlertTriangle
} from 'lucide-react';

const TrainDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [train, setTrain] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await trainsApi.getTrainById(id);
        setTrain(response.data.data);
      } catch (error) {
        console.error('Failed to fetch train details:', error);
        setError('Could not load train details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container-custom py-12 min-h-[60vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  if (error || !train) {
    return (
      <div className="container-custom py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error || 'Train not found'}</p>
          <Link to="/trains" className="btn btn-primary inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Train Search
          </Link>
        </div>
      </div>
    );
  }
  
  const departureDate = new Date(train.departureTime);
  const arrivalDate = new Date(train.arrivalTime);
  
  // Calculate duration in hours and minutes
  const durationMs = arrivalDate.getTime() - departureDate.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  // Calculate percentage of available seats
  const availabilityPercentage = (train.availableSeats / train.totalSeats) * 100;
  
  // Determine availability status color and text
  let availabilityColor = 'bg-green-100 text-green-800';
  let availabilityText = 'Good Availability';
  
  if (availabilityPercentage < 20) {
    availabilityColor = 'bg-red-100 text-red-800';
    availabilityText = 'Few Seats Left';
  } else if (availabilityPercentage < 50) {
    availabilityColor = 'bg-yellow-100 text-yellow-800';
    availabilityText = 'Limited Availability';
  }

  return (
    <div className="container-custom py-12">
      <Link to="/trains" className="inline-flex items-center text-[var(--primary-color)] hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Train Search
      </Link>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white p-6">
          <div className="flex flex-wrap items-start justify-between">
            <div>
              <div className="flex items-center">
                <Train className="h-6 w-6 mr-2" />
                <h1 className="text-2xl font-bold">{train.name}</h1>
              </div>
              <p className="text-white text-opacity-90 mt-1">Train #{train.trainNumber}</p>
            </div>
            
            <div className={`px-4 py-2 rounded-full text-sm font-medium mt-2 sm:mt-0 ${availabilityColor}`}>
              {availabilityText}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center mt-6 space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{format(departureDate, 'EEE, MMM d, yyyy')}</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              <span>{format(departureDate, 'HH:mm')} - {format(arrivalDate, 'HH:mm')}</span>
            </div>
            
            <div className="flex items-center">
              <Clock3 className="h-5 w-5 mr-2" />
              <span>{hours}h {minutes}m</span>
            </div>
          </div>
        </div>
        
        {/* Train Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Journey Details</h2>
              
              <div className="mb-6">
                <div className="flex items-start mb-8">
                  <div className="min-w-[100px] text-right mr-4">
                    <p className="font-bold text-xl">{format(departureDate, 'HH:mm')}</p>
                    <p className="text-sm text-gray-500">{format(departureDate, 'EEE, MMM d')}</p>
                  </div>
                  <div className="flex flex-col items-center mx-2">
                    <div className="w-3 h-3 rounded-full bg-[var(--primary-color)]"></div>
                    <div className="w-0.5 h-16 bg-gray-300 my-1"></div>
                    <div className="w-3 h-3 rounded-full bg-[var(--accent-color)]"></div>
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">{train.source.name} Station</p>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      Departure
                    </p>
                    
                    <div className="mt-12">
                      <p className="font-medium">{train.destination.name} Station</p>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        Arrival
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Journey Duration</span>
                    <span className="font-medium">{hours}h {minutes}m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Distance</span>
                    <span className="font-medium">~{(hours * 60).toFixed(0)} km</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Booking Information</h2>
              
              <div className="bg-gray-50 p-5 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600">Price per passenger</span>
                  <span className="font-bold text-lg text-[var(--primary-color)]">₹{train.price.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-gray-600" />
                    <span className="text-gray-600">Available seats</span>
                  </div>
                  <span className="font-medium">{train.availableSeats} / {train.totalSeats}</span>
                </div>
                
                <div className="h-2 bg-gray-200 rounded-full mb-4">
                  <div 
                    className={`h-full rounded-full ${
                      availabilityPercentage < 20 ? 'bg-red-500' : 
                      availabilityPercentage < 50 ? 'bg-yellow-500' : 'bg-green-500'
                    }`} 
                    style={{width: `${100 - availabilityPercentage}%`}}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                    <span className="text-gray-600">Payment methods</span>
                  </div>
                  <span className="text-sm text-gray-500">Credit/Debit Card, UPI, Net Banking</span>
                </div>
                
                {isAuthenticated ? (
                  <Link 
                    to={`/booking/${train.id}`} 
                    className="btn btn-primary w-full flex justify-center items-center"
                  >
                    Book Now
                  </Link>
                ) : (
                  <div className="text-center">
                    <Link 
                      to="/login" 
                      className="btn btn-primary w-full mb-2"
                    >
                      Login to Book
                    </Link>
                    <p className="text-sm text-gray-500">
                      Don't have an account?{' '}
                      <Link to="/signup" className="text-[var(--primary-color)] hover:underline">
                        Sign up
                      </Link>
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-800 mb-2">Important Information</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Please arrive at the station at least 30 minutes before departure.</li>
                  <li>• Carry a valid ID proof for all passengers.</li>
                  <li>• Cancellation charges may apply as per railway policy.</li>
                  <li>• Children below 5 years travel free without a seat.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainDetails;