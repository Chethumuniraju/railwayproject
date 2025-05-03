import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Train, Clock, CreditCard, Calendar } from 'lucide-react';
import { stationsApi } from '../services/api';

const Home = () => {
  const [sourceId, setSourceId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [stations, setStations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStations = async () => {
      setIsLoading(true);
      try {
        const response = await stationsApi.getAllStations();
        setStations(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch stations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStations();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceId && destinationId) {
      window.location.href = `/trains?sourceId=${sourceId}&destinationId=${destinationId}`;
    }
  };

  const features = [
    {
      icon: <Train className="h-10 w-10 text-[var(--primary-color)]" />,
      title: 'Find the Best Trains',
      description: 'Search and compare trains between stations to find the best options for your journey.'
    },
    {
      icon: <Clock className="h-10 w-10 text-[var(--primary-color)]" />,
      title: 'Save Time',
      description: 'Book your tickets online in minutes, avoiding long queues and waiting times.'
    },
    {
      icon: <Calendar className="h-10 w-10 text-[var(--primary-color)]" />,
      title: 'Manage Your Bookings',
      description: 'View, modify, or cancel your bookings easily through your personal dashboard.'
    },
    {
      icon: <CreditCard className="h-10 w-10 text-[var(--primary-color)]" />,
      title: 'Secure Payments',
      description: 'Pay securely using your preferred payment method with our encrypted payment system.'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white py-16 md:py-24">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Book Your Train Tickets with Ease
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Fast, secure, and convenient train booking for your journeys across the country.
              </p>
              <Link to="/trains" className="btn bg-white text-[var(--primary-color)] hover:bg-gray-100 btn-lg inline-flex items-center">
                Explore Trains
                <Train className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            <div className="lg:w-1/2 lg:pl-10 fade-in">
              <div className="bg-white rounded-lg shadow-xl p-6">
                <h2 className="text-[var(--primary-color)] text-xl font-semibold mb-4">Find Trains</h2>
                
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="form-control">
                    <label htmlFor="source" className="form-label text-gray-700">From</label>
                    <select
                      id="source"
                      className="form-select"
                      value={sourceId}
                      onChange={(e) => setSourceId(e.target.value)}
                      required
                      style={{ color: 'blue' }}
                    >
                      <option value="">Select departure station</option>
                      {stations.map((station) => (
                        <option key={station.id} value={station.id}>
                          {station.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-control">
                    <label htmlFor="destination" className="form-label text-gray-700">To</label>
                    <select
                      id="destination"
                      className="form-select"
                      value={destinationId}
                      onChange={(e) => setDestinationId(e.target.value)}
                      required
                      style={{ color: 'blue' }}
                    >
                      <option value="">Select arrival station</option>
                      {stations.map((station) => (
                        <option key={station.id} value={station.id}>
                          {station.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-control">
  <label htmlFor="date" className="form-label text-gray-700">Date</label>
  <input
    type="date"
    id="date"
    className="form-input text-blue-600"
    min={new Date().toISOString().split('T')[0]}
  />
</div>

                  
                  <button
                    type="submit"
                    className="btn btn-primary w-full flex justify-center items-center"
                    disabled={!sourceId || !destinationId || isLoading}
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Search Trains
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose RailBooker</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center p-3 bg-[var(--primary-color)] bg-opacity-10 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-[var(--primary-color)] text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Join thousands of travelers who book their train tickets with us for a seamless experience.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup" className="btn bg-white text-[var(--primary-color)] hover:bg-gray-100">
              Create an Account
            </Link>
            <Link to="/trains" className="btn border border-white text-white hover:bg-white hover:text-[var(--primary-color)]">
              Browse Trains
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;