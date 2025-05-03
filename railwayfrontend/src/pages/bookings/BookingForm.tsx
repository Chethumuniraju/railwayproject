import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trainsApi, bookingsApi } from '../../services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ArrowLeft, Plus, Trash, Users, AlertTriangle } from 'lucide-react';

interface Passenger {
  name: string;
  age: string;
  gender: string;
}

const BookingForm = () => {
  const { trainId } = useParams<{ trainId: string }>();
  const navigate = useNavigate();
  
  const [train, setTrain] = useState<any>(null);
  const [numberOfSeats, setNumberOfSeats] = useState<number>(1);
  const [passengers, setPassengers] = useState<Passenger[]>([
    { name: '', age: '', gender: 'Male' }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTrainDetails = async () => {
      if (!trainId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await trainsApi.getTrainById(trainId);
        setTrain(response.data.data);
      } catch (error) {
        console.error('Failed to fetch train details:', error);
        setError('Could not load train details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainDetails();
  }, [trainId]);
  
  useEffect(() => {
    // Update passengers array when number of seats changes
    if (numberOfSeats > passengers.length) {
      const newPassengers = [...passengers];
      for (let i = passengers.length; i < numberOfSeats; i++) {
        newPassengers.push({ name: '', age: '', gender: 'Male' });
      }
      setPassengers(newPassengers);
    } else if (numberOfSeats < passengers.length) {
      setPassengers(passengers.slice(0, numberOfSeats));
    }
  }, [numberOfSeats]);
  
  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = { ...updatedPassengers[index], [field]: value };
    setPassengers(updatedPassengers);
  };
  
  const validateForm = () => {
    for (const passenger of passengers) {
      if (!passenger.name || !passenger.age) {
        toast.error('Please fill in all passenger details');
        return false;
      }
      
      const age = parseInt(passenger.age);
      if (isNaN(age) || age <= 0 || age > 120) {
        toast.error('Please enter a valid age for all passengers');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare passenger details as a JSON string
      const passengerDetails = JSON.stringify({ passengers });
      
      const bookingData = {
        trainId: parseInt(trainId as string),
        numberOfSeats,
        passengerDetails
      };
      
      const response = await bookingsApi.createBooking(bookingData);
      const bookingId = response.data.data.id;
      
      toast.success('Booking created! Proceed to payment.');
      navigate(`/payment/${bookingId}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create booking. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
          <button 
            onClick={() => navigate(-1)}
            className="btn btn-primary inline-flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  const departureDate = new Date(train.departureTime);
  const totalPrice = numberOfSeats * train.price;

  return (
    <div className="container-custom py-12">
      <button 
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-[var(--primary-color)] hover:underline mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Train Details
      </button>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Book Your Tickets</h1>
        
        {/* Train summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{train.name} - #{train.trainNumber}</h2>
          
          <div className="flex flex-wrap justify-between mb-4">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">{format(departureDate, 'EEE, MMM d, yyyy')}</p>
              
              <div className="flex items-start mt-2">
                <div className="text-right mr-3">
                  <p className="font-bold">{format(departureDate, 'HH:mm')}</p>
                  <p className="text-sm text-gray-500">{train.source.name}</p>
                </div>
                <div className="flex flex-col items-center px-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--primary-color)]"></div>
                  <div className="w-0.5 h-8 bg-gray-300 my-1"></div>
                  <div className="w-2 h-2 rounded-full bg-[var(--accent-color)]"></div>
                </div>
                <div className="ml-3">
                  <p className="font-bold">{format(new Date(train.arrivalTime), 'HH:mm')}</p>
                  <p className="text-sm text-gray-500">{train.destination.name}</p>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Price per passenger:</p>
              <p className="font-bold text-lg text-[var(--primary-color)]">₹{train.price.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-500">
              {train.availableSeats} seats available out of {train.totalSeats}
            </span>
          </div>
        </div>
        
        {/* Booking form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Passenger Details</h2>
          
          <div className="form-control mb-6">
            <label htmlFor="numberOfSeats" className="form-label">Number of Seats</label>
            <select
              id="numberOfSeats"
              className="form-select"
              value={numberOfSeats}
              onChange={(e) => setNumberOfSeats(parseInt(e.target.value))}
              disabled={isSubmitting}
            >
              {[...Array(Math.min(6, train.availableSeats))].map((_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1} {i === 0 ? 'passenger' : 'passengers'}
                </option>
              ))}
            </select>
          </div>
          
          {passengers.map((passenger, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Passenger {index + 1}</h3>
                {passengers.length > 1 && (
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-800"
                    onClick={() => {
                      const newPassengers = [...passengers];
                      newPassengers.splice(index, 1);
                      setPassengers(newPassengers);
                      setNumberOfSeats(numberOfSeats - 1);
                    }}
                    disabled={isSubmitting}
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={passenger.name}
                    onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="form-control">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    max="120"
                    value={passenger.age}
                    onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="form-control md:col-span-2">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={passenger.gender}
                    onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          
          {passengers.length < Math.min(6, train.availableSeats) && (
            <button
              type="button"
              className="flex items-center text-[var(--primary-color)] hover:text-[var(--secondary-color)] mb-6"
              onClick={() => {
                setPassengers([...passengers, { name: '', age: '', gender: 'Male' }]);
                setNumberOfSeats(numberOfSeats + 1);
              }}
              disabled={isSubmitting}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add another passenger
            </button>
          )}
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg">Total Price:</span>
              <span className="text-xl font-bold text-[var(--primary-color)]">
                ₹{totalPrice.toFixed(2)}
              </span>
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;