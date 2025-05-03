import { useState, useEffect } from 'react';
import { trainsApi, stationsApi } from '../../services/api';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { 
  Plus, 
  Edit, 
  Trash, 
  Search, 
  X,
  AlertTriangle
} from 'lucide-react';

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

interface TrainFormData {
  id?: number;
  name: string;
  trainNumber: string;
  sourceId: string;
  destinationId: string;
  departureTime: string;
  arrivalTime: string;
  totalSeats: string;
  price: string;
}

const EmptyForm: TrainFormData = {
  name: '',
  trainNumber: '',
  sourceId: '',
  destinationId: '',
  departureTime: '',
  arrivalTime: '',
  totalSeats: '',
  price: ''
};

const ManageTrains = () => {
  const [trains, setTrains] = useState<Train[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [formData, setFormData] = useState<TrainFormData>(EmptyForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchTrains();
    fetchStations();
  }, []);
  
  const fetchTrains = async () => {
    setIsLoading(true);
    try {
      const response = await trainsApi.getAllTrains();
      setTrains(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch trains:', error);
      toast.error('Failed to load trains. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchStations = async () => {
    try {
      const response = await stationsApi.getAllStations();
      setStations(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch stations:', error);
      toast.error('Failed to load stations. Please try again.');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validateForm = () => {
    if (!formData.name || !formData.trainNumber || !formData.sourceId || 
        !formData.destinationId || !formData.departureTime || !formData.arrivalTime || 
        !formData.totalSeats || !formData.price) {
      toast.error('Please fill in all fields');
      return false;
    }
    
    if (formData.sourceId === formData.destinationId) {
      toast.error('Source and destination cannot be the same');
      return false;
    }
    
    const departureTime = new Date(formData.departureTime);
    const arrivalTime = new Date(formData.arrivalTime);
    
    if (arrivalTime <= departureTime) {
      toast.error('Arrival time must be after departure time');
      return false;
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
      const trainData = {
        name: formData.name,
        trainNumber: formData.trainNumber,
        sourceId: parseInt(formData.sourceId),
        destinationId: parseInt(formData.destinationId),
        departureTime: formData.departureTime,
        arrivalTime: formData.arrivalTime,
        totalSeats: parseInt(formData.totalSeats),
        price: parseFloat(formData.price)
      };
      
      if (isEditing) {
        await trainsApi.updateTrain(formData.id!.toString(), trainData);
        toast.success('Train updated successfully');
      } else {
        await trainsApi.addTrain(trainData);
        toast.success('Train added successfully');
      }
      
      fetchTrains();
      closeModal();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
        (isEditing ? 'Failed to update train' : 'Failed to add train');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = (train: Train) => {
    // Convert to local datetime string format for inputs
    const departureDateObj = new Date(train.departureTime);
    const arrivalDateObj = new Date(train.arrivalTime);
    
    // Format for the datetime-local input
    const formatDateTimeLocal = (date: Date) => {
      return format(date, "yyyy-MM-dd'T'HH:mm");
    };
    
    setFormData({
      id: train.id,
      name: train.name,
      trainNumber: train.trainNumber,
      sourceId: train.source.id.toString(),
      destinationId: train.destination.id.toString(),
      departureTime: formatDateTimeLocal(departureDateObj),
      arrivalTime: formatDateTimeLocal(arrivalDateObj),
      totalSeats: train.totalSeats.toString(),
      price: train.price.toString()
    });
    
    setIsEditing(true);
    setIsModalOpen(true);
  };
  
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this train?')) {
      return;
    }
    
    try {
      await trainsApi.deleteTrain(id.toString());
      toast.success('Train deleted successfully');
      fetchTrains();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete train';
      toast.error(errorMessage);
    }
  };
  
  const openAddModal = () => {
    setFormData(EmptyForm);
    setIsEditing(false);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(EmptyForm);
  };
  
  const filteredTrains = trains.filter(train => 
    train.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    train.trainNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    train.source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    train.destination.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Manage Trains</h1>
        
        <button
          onClick={openAddModal}
          className="btn btn-primary inline-flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Train
        </button>
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
              placeholder="Search trains by name, number, source or destination..."
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
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
            </div>
          ) : filteredTrains.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Train
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arrival
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrains.map((train) => (
                  <tr key={train.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{train.name}</div>
                      <div className="text-sm text-gray-500">{train.trainNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{train.source.name}</div>
                      <div className="text-sm text-gray-500">to {train.destination.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(train.departureTime), 'MMM d, yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(train.departureTime), 'HH:mm')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(train.arrivalTime), 'MMM d, yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(train.arrivalTime), 'HH:mm')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {train.availableSeats}/{train.totalSeats}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{train.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(train)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(train.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trains found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery 
                  ? `No trains matching "${searchQuery}"`
                  : "There are no trains in the system yet."}
              </p>
              <button 
                onClick={openAddModal}
                className="btn btn-primary"
              >
                Add Your First Train
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Add/Edit Train Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {isEditing ? 'Edit Train' : 'Add New Train'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="form-control">
                    <label className="form-label">Train Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="form-label">Train Number</label>
                    <input
                      type="text"
                      name="trainNumber"
                      className="form-input"
                      value={formData.trainNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="form-control">
                    <label className="form-label">Source Station</label>
                    <select
                      name="sourceId"
                      className="form-select"
                      value={formData.sourceId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select source station</option>
                      {stations.map((station) => (
                        <option 
                          key={station.id} 
                          value={station.id}
                          disabled={station.id.toString() === formData.destinationId}
                        >
                          {station.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-control">
                    <label className="form-label">Destination Station</label>
                    <select
                      name="destinationId"
                      className="form-select"
                      value={formData.destinationId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select destination station</option>
                      {stations.map((station) => (
                        <option 
                          key={station.id} 
                          value={station.id}
                          disabled={station.id.toString() === formData.sourceId}
                        >
                          {station.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="form-control">
                    <label className="form-label">Departure Time</label>
                    <input
                      type="datetime-local"
                      name="departureTime"
                      className="form-input"
                      value={formData.departureTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="form-label">Arrival Time</label>
                    <input
                      type="datetime-local"
                      name="arrivalTime"
                      className="form-input"
                      value={formData.arrivalTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="form-control">
                    <label className="form-label">Total Seats</label>
                    <input
                      type="number"
                      name="totalSeats"
                      className="form-input"
                      min="1"
                      value={formData.totalSeats}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="form-label">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      className="form-input"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Saving...'
                    : isEditing
                    ? 'Update Train'
                    : 'Add Train'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTrains;