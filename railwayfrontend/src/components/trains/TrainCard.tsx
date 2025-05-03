import { format } from 'date-fns';
import { ArrowRight, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Station {
  id: number;
  name: string;
}

interface Train {
  id: number;
  name: string;
  trainNumber: string;
  source: Station;
  destination: Station;
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
}

interface TrainCardProps {
  train: Train;
}

const TrainCard = ({ train }: TrainCardProps) => {
  const departureDate = new Date(train.departureTime);
  const arrivalDate = new Date(train.arrivalTime);
  
  // Calculate duration in hours and minutes
  const durationMs = arrivalDate.getTime() - departureDate.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  // Calculate percentage of available seats
  const availabilityPercentage = (train.availableSeats / train.totalSeats) * 100;
  
  // Determine availability status color
  let availabilityColor = 'bg-green-100 text-green-800';
  if (availabilityPercentage < 20) {
    availabilityColor = 'bg-red-100 text-red-800';
  } else if (availabilityPercentage < 50) {
    availabilityColor = 'bg-yellow-100 text-yellow-800';
  }

  return (
    <div className="card transition-transform hover:shadow-lg">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{train.name}</h3>
            <p className="text-sm text-gray-500">Train #{train.trainNumber}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${availabilityColor}`}>
            {train.availableSeats} seats available
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-500 flex items-center mb-1">
              <Calendar className="h-4 w-4 mr-1" />
              {format(departureDate, 'EEE, MMM d, yyyy')}
            </p>
            
            <div className="flex items-start mt-2">
              <div className="text-right mr-3">
                <p className="font-bold text-xl">{format(departureDate, 'HH:mm')}</p>
                <p className="text-sm text-gray-500">{train.source.name}</p>
              </div>
              <div className="flex flex-col items-center px-2">
                <div className="w-2 h-2 rounded-full bg-[var(--primary-color)]"></div>
                <div className="w-0.5 h-10 bg-gray-300 my-1"></div>
                <div className="w-2 h-2 rounded-full bg-[var(--accent-color)]"></div>
              </div>
              <div className="ml-3">
                <p className="font-bold text-xl">{format(arrivalDate, 'HH:mm')}</p>
                <p className="text-sm text-gray-500">{train.destination.name}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end justify-between">
            <div className="text-right mb-2">
              <span className="block text-sm text-gray-500">Duration</span>
              <span className="font-medium flex items-center text-gray-800">
                <Clock className="h-4 w-4 mr-1" />
                {hours}h {minutes}m
              </span>
            </div>
            
            <div className="text-right">
              <span className="block text-lg font-bold text-[var(--primary-color)]">
                ₹{train.price.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500">per passenger</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            <span>{train.availableSeats}/{train.totalSeats} available</span>
          </div>
          
          <Link 
            to={`/trains/${train.id}`} 
            className="btn btn-primary flex items-center"
          >
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TrainCard;