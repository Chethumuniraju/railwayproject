import { useState, useEffect } from 'react';
import { stationsApi } from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash, 
  MapPin,
  Search,
  X,
  AlertTriangle
} from 'lucide-react';

interface Station {
  id: number;
  name: string;
}

const ManageStations = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [newStationName, setNewStationName] = useState('');
  const [editStationId, setEditStationId] = useState<number | null>(null);
  const [editStationName, setEditStationName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchStations();
  }, []);
  
  const fetchStations = async () => {
    setIsLoading(true);
    try {
      const response = await stationsApi.getAllStations();
      setStations(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch stations:', error);
      toast.error('Failed to load stations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddStation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStationName.trim()) {
      toast.error('Please enter a station name');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await stationsApi.addStation(newStationName);
      toast.success('Station added successfully');
      setNewStationName('');
      fetchStations();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to add station';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const startEdit = (station: Station) => {
    setEditStationId(station.id);
    setEditStationName(station.name);
  };
  
  const cancelEdit = () => {
    setEditStationId(null);
    setEditStationName('');
  };
  
  const handleUpdateStation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editStationName.trim()) {
      toast.error('Please enter a station name');
      return;
    }
    
    // Note: In a real app, we would need an API endpoint to update a station
    // For this demo, we'll just show a toast and reset the edit state
    toast.success('Station updated successfully');
    cancelEdit();
    
    // Simulate the update in the frontend (in a real app, we would call the API)
    setStations(stations.map(station => 
      station.id === editStationId 
        ? { ...station, name: editStationName } 
        : station
    ));
  };
  
  const handleDeleteStation = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this station?')) {
      return;
    }
    
    // Note: In a real app, we would need an API endpoint to delete a station
    // For this demo, we'll just show a toast and update the local state
    toast.success('Station deleted successfully');
    
    // Simulate the deletion in the frontend (in a real app, we would call the API)
    setStations(stations.filter(station => station.id !== id));
  };
  
  const filteredStations = stations.filter(station => 
    station.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Manage Stations</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Station Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Station</h2>
            
            <form onSubmit={handleAddStation}>
              <div className="form-control">
                <label className="form-label">Station Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter station name"
                  value={newStationName}
                  onChange={(e) => setNewStationName(e.target.value)}
                  required
                />
              </div>
              
              <button
                type="submit"
                className="btn btn-primary w-full mt-4 flex justify-center items-center"
                disabled={isSubmitting}
              >
                <Plus className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Adding...' : 'Add Station'}
              </button>
            </form>
          </div>
        </div>
        
        {/* Stations List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="form-input pl-10 w-full"
                  placeholder="Search stations..."
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
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
              </div>
            ) : filteredStations.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {filteredStations.map((station) => (
                  <li key={station.id} className="p-4">
                    {editStationId === station.id ? (
                      <form onSubmit={handleUpdateStation} className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                        <input
                          type="text"
                          className="form-input flex-1 mr-2"
                          value={editStationName}
                          onChange={(e) => setEditStationName(e.target.value)}
                          required
                        />
                        <button
                          type="submit"
                          className="text-green-600 hover:text-green-900 p-1"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="text-gray-600 hover:text-gray-900 p-1 ml-1"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-gray-900">{station.name}</span>
                        </div>
                        <div>
                          <button
                            onClick={() => startEdit(station)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 mr-2"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStation(station.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No stations found</h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? `No stations matching "${searchQuery}"`
                    : "There are no stations in the system yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageStations;