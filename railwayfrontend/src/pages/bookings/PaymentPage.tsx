import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsApi } from '../../services/api';
import { toast } from 'react-hot-toast';
import { PAYMENT_METHODS } from '../../config/constants';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Lock
} from 'lucide-react';

const PaymentPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await bookingsApi.getBookingById(bookingId);
        setBooking(response.data.data);
        
        // If booking is already confirmed or cancelled, redirect to booking details
        if (response.data.data.status !== 'PAYMENT_PENDING') {
          toast.info('This booking has already been processed.');
          navigate(`/bookings/${bookingId}`);
        }
      } catch (error) {
        console.error('Failed to fetch booking details:', error);
        setError('Could not load booking details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, navigate]);
  
  const formatCardNumber = (value: string) => {
    const regex = /^(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})$/g;
    const onlyNumbers = value.replace(/[^\d]/g, '');
    
    return onlyNumbers.replace(regex, (regex, $1, $2, $3, $4) =>
      [$1, $2, $3, $4].filter(group => !!group).join(' ')
    );
  };
  
  const formatExpiryDate = (value: string) => {
    const regex = /^(\d{0,2})(\d{0,2})$/g;
    const onlyNumbers = value.replace(/[^\d]/g, '');
    
    return onlyNumbers.replace(regex, (regex, $1, $2) =>
      [$1, $2].filter(group => !!group).join('/')
    );
  };
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue.substring(0, 19)); // 16 digits + 3 spaces
  };
  
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatExpiryDate(e.target.value);
    setExpiryDate(formattedValue.substring(0, 5)); // MM/YY
  };
  
  const validateForm = () => {
    if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
        toast.error('Please enter a valid 16-digit card number');
        return false;
      }
      
      if (!cardName) {
        toast.error('Please enter the cardholder name');
        return false;
      }
      
      if (!expiryDate || expiryDate.length !== 5) {
        toast.error('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      
      if (!cvv || cvv.length !== 3) {
        toast.error('Please enter a valid 3-digit CVV');
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
    
    setIsProcessing(true);
    
    try {
      // For demonstration, we'll use a dummy token
      const paymentToken = 'tok_visa';
      
      const paymentData = {
        bookingId: parseInt(bookingId as string),
        paymentMethod,
        paymentToken
      };
      
      await bookingsApi.processPayment(paymentData);
      
      toast.success('Payment successful! Your booking is confirmed.');
      navigate(`/bookings/${bookingId}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Payment processing failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
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
  
  // Parse passenger details
  const passengerDetails = JSON.parse(booking.passengerDetails);
  const passengers = passengerDetails.passengers || [];
  
  return (
    <div className="container-custom py-12">
      <button 
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-[var(--primary-color)] hover:underline mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </button>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Complete Your Payment</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Payment form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              
              <div className="mb-6">
                {PAYMENT_METHODS.map((method) => (
                  <div key={method.id} className="mb-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="form-radio h-4 w-4 text-[var(--primary-color)]"
                        disabled={isProcessing}
                      />
                      <span className="ml-2">{method.name}</span>
                    </label>
                  </div>
                ))}
              </div>
              
              {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && (
                <form onSubmit={handleSubmit}>
                  <div className="border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="form-control">
                      <label className="form-label">Card Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          className="form-input pr-10"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          maxLength={19}
                          required
                          disabled={isProcessing}
                        />
                        <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      </div>
                    </div>
                    
                    <div className="form-control">
                      <label className="form-label">Cardholder Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        required
                        disabled={isProcessing}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="form-label">Expiry Date</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={handleExpiryDateChange}
                          maxLength={5}
                          required
                          disabled={isProcessing}
                        />
                      </div>
                      
                      <div className="form-control">
                        <label className="form-label">CVV</label>
                        <input
                          type="password"
                          className="form-input"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                          maxLength={3}
                          required
                          disabled={isProcessing}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-6">
                    <div className="flex items-center h-5">
                      <input
                        id="save-card"
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-[var(--primary-color)]"
                        disabled={isProcessing}
                      />
                    </div>
                    <label htmlFor="save-card" className="ml-2 text-sm text-gray-600">
                      Save card for future payments
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg mb-6">
                    <Lock className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">Your payment information is secure and encrypted</span>
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : `Pay ₹${booking.totalPrice.toFixed(2)}`}
                  </button>
                </form>
              )}
              
              {(paymentMethod === 'UPI' || paymentMethod === 'NET_BANKING') && (
                <div className="text-center p-6">
                  <p className="mb-4 text-gray-600">
                    For demo purposes, please use the dummy payment option.
                  </p>
                  <button
                    onClick={handleSubmit}
                    className="btn btn-primary w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : `Pay ₹${booking.totalPrice.toFixed(2)}`}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
              
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="font-medium">{booking.train.name} - #{booking.train.trainNumber}</p>
                <p className="text-sm text-gray-500 mb-2">
                  {format(new Date(booking.train.departureTime), 'EEE, MMM d, yyyy')}
                </p>
                
                <div className="flex items-center">
                  <div className="text-sm">
                    <p className="font-medium">{format(new Date(booking.train.departureTime), 'HH:mm')}</p>
                    <p className="text-gray-500">{booking.train.source.name}</p>
                  </div>
                  <div className="mx-2 border-t border-gray-300 w-12"></div>
                  <div className="text-sm">
                    <p className="font-medium">{format(new Date(booking.train.arrivalTime), 'HH:mm')}</p>
                    <p className="text-gray-500">{booking.train.destination.name}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h3 className="font-medium mb-2">Passengers</h3>
                <ul className="space-y-1">
                  {passengers.map((passenger: any, index: number) => (
                    <li key={index} className="text-sm flex justify-between">
                      <span>{passenger.name} ({passenger.age}, {passenger.gender})</span>
                      <span className="font-medium">₹{booking.train.price.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{booking.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tax</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-[var(--primary-color)]">₹{booking.totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-green-700">
                  Your booking will be confirmed immediately after successful payment. 
                  E-tickets will be sent to your email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;