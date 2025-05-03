import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, AlertCircle } from 'lucide-react';
import { trainsApi, stationsApi } from '../../services/api';
import TrainCard from '../../components/trains/TrainCard';

const TrainSearch = () => {
  const [searchParams] = useSearchParams();
  const initialSourceId = searchParams.get('sourceId') || '';
  const initialDestinationId = searchParams.get('destinationId') || '';
  
  const [sourceId, setSourceId] = useState(initialSourceId);
  const [destinationId, setDestinationId] = useState(initialDestinationId);
  const [stations, setStations] = useState<any[]>([]);
  const [trains, setTrains] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialSourceId && !!initialDestinationId);
  
  // Filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [departureTime, setDepartureTime] = useState<string>('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await stationsApi.getAllStations();
        setStations(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch stations:', error);
      }
    };
    
    fetchStations();
    
    // If both sourceId and destinationId are provided in URL, search trains
    if (initialSourceId && initialDestinationId) {
      handleSearch();
    }
  }, [initialSourceId, initialDestinationId]);
  
  const handleSearch = async () => {
    if (!sourceId || !destinationId) {
      return;
    }
    
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const response = await trainsApi.searchTrains(sourceId, destinationId);
      setTrains(response.data.data || []);
      
      // If we have trains, update price range based on min and max prices
      if (response.data.data && response.data.data.length > 0) {
        const prices = response.data.data.map((train: any) => train.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        setPriceRange([minPrice, maxPrice]);
      }
    } catch (error) {
      console.error('Failed to search trains:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const applyFilters = () => {
    return trains.filter((train) => {
      const trainPrice = train.price;
      if (trainPrice < priceRange[0] || trainPrice > priceRange[1]) {
        return false;
      }
      
      if (departureTime) {
        const trainDepartureHour = new Date(train.departureTime).getHours();
        const selectedHour = parseInt(departureTime);
        
        if (trainDepartureHour !== selectedHour) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  const filteredTrains = hasSearched ? applyFilters() : [];

  return (
    <div className="py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">Find Trains</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with search form and filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Search Trains</h2>
              
              <div className="space-y-4">
                <div className="form-control">
                  <label htmlFor="source" className="form-label">From</label>
                  <select
                    id="source"
                    className="form-select"
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    required
                  >
                    <option value="">Select departure station</option>
                    {stations.map((station) => (
                      <option 
                        key={station.id} 
                        value={station.id}
                        disabled={station.id === parseInt(destinationId)}
                      >
                        {station.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-control">
                  <label htmlFor="destination" className="form-label">To</label>
                  <select
                    id="destination"
                    className="form-select"
                    value={destinationId}
                    onChange={(e) => setDestinationId(e.target.value)}
                    required
                  >
                    <option value="">Select arrival station</option>
                    {stations.map((station) => (
                      <option 
                        key={station.id} 
                        value={station.id}
                        disabled={station.id === parseInt(sourceId)}
                      >
                        {station.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-control">
                  <label htmlFor="date" className="form-label">Date</label>
                  <input
                    type="date"
                    id="date"
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <button
                  type="button"
                  className="btn btn-primary w-full flex justify-center items-center"
                  onClick={handleSearch}
                  disabled={!sourceId || !destinationId || isLoading}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search Trains
                </button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              >
                <h2 className="text-xl font-semibold">Filters</h2>
                <Filter className="h-5 w-5" />
              </div>
              
              <div className={`mt-4 space-y-4 ${isFiltersOpen ? 'block' : 'hidden lg:block'}`}>
                <div>
                  <h3 className="font-medium mb-2">Price Range</h3>
                  <div className="flex items-center space-x-2">
                    <span>₹{priceRange[0]}</span>
                    <input
                      type="range"
                      min={0}
                      max={5000}
                      step={100}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Departure Time</h3>
                  <select
                    className="form-select"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                  >
                    <option value="">Any Time</option>
                    <option value="0">00:00 - 01:00</option>
                    <option value="6">06:00 - 07:00</option>
                    <option value="8">08:00 - 09:00</option>
                    <option value="12">12:00 - 13:00</option>
                    <option value="16">16:00 - 17:00</option>
                    <option value="20">20:00 - 21:00</option>
                  </select>
                </div>
                
                <button 
                  type="button" 
                  className="btn btn-outline w-full"
                  onClick={() => {
                    setPriceRange([0, 5000]);
                    setDepartureTime('');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
          
          {/* Main content with train results */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
              </div>
            ) : hasSearched ? (
              <>
                {filteredTrains.length > 0 ? (
                  <div className="space-y-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                      <p className="text-gray-600">
                        {filteredTrains.length} trains found from{' '}
                        <span className="font-medium">{stations.find(s => s.id === parseInt(sourceId))?.name}</span>{' '}
                        to{' '}
                        <span className="font-medium">{stations.find(s => s.id === parseInt(destinationId))?.name}</span>
                      </p>
                    </div>
                    
                    {filteredTrains.map((train) => (
                      <TrainCard key={train.id} train={train} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-yellow-700 mb-2">No Trains Found</h3>
                    <p className="text-yellow-600">
                      No trains available for the selected route or filters.
                      Try changing your search criteria or filters.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                <Search className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-700 mb-2">Search for Trains</h3>
                <p className="text-blue-600 max-w-md mx-auto">
                  Select your departure and arrival stations to find available trains.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainSearch;