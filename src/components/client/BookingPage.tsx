import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  CreditCard,
  User,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface SeatMap {
  [key: string]: {
    available: boolean;
    type: 'premium' | 'standard' | 'economy';
    price: number;
  };
}

const BookingPage: React.FC = () => {
  const { performanceId } = useParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Seat Selection, 2: Customer Info, 3: Payment, 4: Confirmation
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [bookingReference, setBookingReference] = useState('');

  // Mock performance data
  const performance = {
    id: performanceId,
    title: 'Hamilton Musical',
    venue: 'Broadway Theater',
    date: '2024-03-15',
    time: '19:30',
    basePrice: 150,
    image: 'https://images.unsplash.com/photo-1539964604210-db87088e0c2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwcGVyZm9ybWFuY2UlMjBzdGFnZXxlbnwxfHx8fDE3NTYzNTYxMzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  };

  // Mock seat map - simplified version
  const seatMap: SeatMap = {
    'A1': { available: true, type: 'premium', price: 200 },
    'A2': { available: true, type: 'premium', price: 200 },
    'A3': { available: false, type: 'premium', price: 200 },
    'A4': { available: true, type: 'premium', price: 200 },
    'A5': { available: true, type: 'premium', price: 200 },
    'B1': { available: true, type: 'standard', price: 150 },
    'B2': { available: false, type: 'standard', price: 150 },
    'B3': { available: true, type: 'standard', price: 150 },
    'B4': { available: true, type: 'standard', price: 150 },
    'B5': { available: true, type: 'standard', price: 150 },
    'C1': { available: true, type: 'economy', price: 100 },
    'C2': { available: true, type: 'economy', price: 100 },
    'C3': { available: true, type: 'economy', price: 100 },
    'C4': { available: false, type: 'economy', price: 100 },
    'C5': { available: true, type: 'economy', price: 100 },
  };

  const toggleSeatSelection = (seatId: string) => {
    if (!seatMap[seatId].available) return;
    
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const getSeatColor = (seatId: string) => {
    if (!seatMap[seatId].available) return 'bg-gray-400 cursor-not-allowed';
    if (selectedSeats.includes(seatId)) return 'bg-blue-600 text-white';
    
    switch (seatMap[seatId].type) {
      case 'premium': return 'bg-yellow-200 hover:bg-yellow-300 cursor-pointer';
      case 'standard': return 'bg-green-200 hover:bg-green-300 cursor-pointer';
      case 'economy': return 'bg-blue-200 hover:bg-blue-300 cursor-pointer';
      default: return 'bg-gray-200';
    }
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => {
      return total + seatMap[seatId].price;
    }, 0);
  };

  const handleNextStep = () => {
    if (step === 1 && selectedSeats.length === 0) return;
    if (step === 4) {
      navigate('/client/my-bookings');
      return;
    }
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleBooking = () => {
    // Mock booking process
    const reference = 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setBookingReference(reference);
    setStep(4);
  };

  const renderSeatSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="bg-gray-800 text-white py-2 px-4 rounded-lg inline-block mb-4">
          🎭 STAGE 🎭
        </div>
      </div>
      
      {/* Seat Map */}
      <div className="space-y-4">
        {['A', 'B', 'C'].map(row => (
          <div key={row} className="flex items-center justify-center gap-2">
            <span className="w-8 text-center font-bold">{row}</span>
            {[1, 2, 3, 4, 5].map(seatNum => {
              const seatId = `${row}${seatNum}`;
              return (
                <button
                  key={seatId}
                  onClick={() => toggleSeatSelection(seatId)}
                  className={`w-8 h-8 rounded-lg border-2 border-gray-300 flex items-center justify-center text-xs font-medium ${getSeatColor(seatId)}`}
                  disabled={!seatMap[seatId].available}
                >
                  {seatNum}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-200 rounded"></div>
          <span>Premium ($200)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 rounded"></div>
          <span>Standard ($150)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-200 rounded"></div>
          <span>Economy ($100)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span>Unavailable</span>
        </div>
      </div>

      {/* Selected Seats */}
      {selectedSeats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Seats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedSeats.map(seatId => (
                <div key={seatId} className="flex justify-between items-center">
                  <span>Seat {seatId} ({seatMap[seatId].type})</span>
                  <span>${seatMap[seatId].price}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center font-bold">
                <span>Total</span>
                <span>${calculateTotal()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCustomerInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={customerInfo.firstName}
            onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
            placeholder="Enter your first name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={customerInfo.lastName}
            onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
            placeholder="Enter your last name"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={customerInfo.email}
          onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
          placeholder="Enter your email address"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={customerInfo.phone}
          onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
          placeholder="Enter your phone number"
          required
        />
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This is a demo booking system. No real payment will be processed.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-2">
        <Label htmlFor="cardholderName">Cardholder Name</Label>
        <Input
          id="cardholderName"
          value={paymentInfo.cardholderName}
          onChange={(e) => setPaymentInfo({...paymentInfo, cardholderName: e.target.value})}
          placeholder="Name on card"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          id="cardNumber"
          value={paymentInfo.cardNumber}
          onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
          placeholder="1234 5678 9012 3456"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            value={paymentInfo.expiryDate}
            onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
            placeholder="MM/YY"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            value={paymentInfo.cvv}
            onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
            placeholder="123"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600">Your tickets have been successfully booked.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Booking Reference:</span>
            <span className="font-mono font-bold">{bookingReference}</span>
          </div>
          <div className="flex justify-between">
            <span>Performance:</span>
            <span>{performance.title}</span>
          </div>
          <div className="flex justify-between">
            <span>Date & Time:</span>
            <span>{new Date(performance.date).toLocaleDateString()} at {performance.time}</span>
          </div>
          <div className="flex justify-between">
            <span>Venue:</span>
            <span>{performance.venue}</span>
          </div>
          <div className="flex justify-between">
            <span>Seats:</span>
            <span>{selectedSeats.join(', ')}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total Paid:</span>
            <span>${calculateTotal()}</span>
          </div>
        </CardContent>
      </Card>
      
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          A confirmation email has been sent to {customerInfo.email}
        </AlertDescription>
      </Alert>
    </div>
  );

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Select Your Seats';
      case 2: return 'Customer Information';
      case 3: return 'Payment Details';
      case 4: return 'Booking Confirmed';
      default: return '';
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedSeats.length > 0;
      case 2: return customerInfo.firstName && customerInfo.lastName && customerInfo.email && customerInfo.phone;
      case 3: return paymentInfo.cardNumber && paymentInfo.expiryDate && paymentInfo.cvv && paymentInfo.cardholderName;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Performance
        </Button>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNum <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum < step ? <CheckCircle className="h-4 w-4" /> : stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    stepNum < step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Select Seats</span>
            <span>Customer Info</span>
            <span>Payment</span>
            <span>Confirmation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{getStepTitle()}</CardTitle>
                <CardDescription>
                  Step {step} of 4
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {step === 1 && renderSeatSelection()}
                {step === 2 && renderCustomerInfo()}
                {step === 3 && renderPayment()}
                {step === 4 && renderConfirmation()}
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{new Date(performance.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{performance.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{performance.venue}</span>
                  </div>
                </div>
                
                {selectedSeats.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Selected Seats</h4>
                      <div className="space-y-1">
                        {selectedSeats.map(seatId => (
                          <div key={seatId} className="flex justify-between text-sm">
                            <span>Seat {seatId}</span>
                            <span>${seatMap[seatId].price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${calculateTotal()}</span>
                    </div>
                  </>
                )}
                
                <div className="space-y-2 pt-4 border-t">
                  {step > 1 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handlePreviousStep}
                    >
                      Previous Step
                    </Button>
                  )}
                  
                  <Button 
                    className="w-full" 
                    onClick={step === 3 ? handleBooking : handleNextStep}
                    disabled={!canProceed()}
                  >
                    {step === 1 && 'Continue to Customer Info'}
                    {step === 2 && 'Continue to Payment'}
                    {step === 3 && 'Complete Booking'}
                    {step === 4 && 'View My Bookings'}
                  </Button>
                  
                  {step === 3 && (
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                      <CreditCard className="h-3 w-3" />
                      <span>Secure payment processing</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;