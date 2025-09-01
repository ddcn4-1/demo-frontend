import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../App';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import ClientNavbar from './ClientNavbar';
import PerformanceListing from './PerformanceListing';
import PerformanceDetails from './PerformanceDetails';
import BookingPage from './BookingPage';
import MyBookings from './MyBookings';
import { Search, Calendar, MapPin, Filter } from 'lucide-react';

const ClientApp: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  const isOnHomepage = location.pathname === '/client' || location.pathname === '/client/';

  if (!isOnHomepage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientNavbar />
        <main className="pt-16">
          <Routes>
            <Route path="performances" element={<PerformanceListing />} />
            <Route path="performance/:id" element={<PerformanceDetails />} />
            <Route path="booking/:performanceId" element={<BookingPage />} />
            <Route path="my-bookings" element={<MyBookings />} />
          </Routes>
        </main>
      </div>
    );
  }

  // Featured performances
  const featuredPerformances = [
    {
      id: '1',
      title: 'Hamilton Musical',
      venue: 'Broadway Theater',
      date: '2024-03-15',
      price: 150,
      image: 'https://images.unsplash.com/photo-1539964604210-db87088e0c2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwcGVyZm9ybWFuY2UlMjBzdGFnZXxlbnwxfHx8fDE3NTYzNTYxMzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: '2',
      title: 'Rock Concert',
      venue: 'Madison Square Garden',
      date: '2024-03-20',
      price: 85,
      image: 'https://images.unsplash.com/photo-1656283384093-1e227e621fad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwY3Jvd2QlMjBtdXNpY3xlbnwxfHx8fDE3NTY0NDU3Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: '3',
      title: 'Jazz Night',
      venue: 'Blue Note',
      date: '2024-03-25',
      price: 45,
      image: 'https://images.unsplash.com/photo-1731185762173-f7068929fb22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXp6JTIwY2x1YiUyMG11c2ljfGVufDF8fHx8MTc1NjQwNTk0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/client/performances?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientNavbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Discover Amazing Events
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Book tickets for the best performances and events in town
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search for performances, venues, or artists..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-3 text-gray-900 bg-white"
                    />
                  </div>
                  <Button type="submit" size="lg" className="bg-orange-500 hover:bg-orange-600">
                    Search
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Quick Filters */}
        <section className="py-8 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate('/client/performances?category=musical')}
              >
                <Calendar className="h-4 w-4" />
                Musicals
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate('/client/performances?category=concert')}
              >
                <Calendar className="h-4 w-4" />
                Concerts
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate('/client/performances?category=comedy')}
              >
                <Calendar className="h-4 w-4" />
                Comedy
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate('/client/performances?category=theater')}
              >
                <Calendar className="h-4 w-4" />
                Theater
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate('/client/performances')}
              >
                <Filter className="h-4 w-4" />
                All Events
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Performances */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Performances</h2>
              <p className="text-lg text-gray-600">Don't miss these popular shows</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPerformances.map((performance) => (
                <div key={performance.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gray-200 relative">
                    <img 
                      src={performance.image} 
                      alt={performance.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-white text-gray-900 px-2 py-1 rounded-lg text-sm font-semibold">
                        ${performance.price}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{performance.title}</h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{performance.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(performance.date).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        onClick={() => navigate(`/client/performance/${performance.id}`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/client/booking/${performance.id}`)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/client/performances')}
              >
                View All Performances
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">45+</div>
                <div className="text-lg text-gray-300">Active Performances</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">1,250+</div>
                <div className="text-lg text-gray-300">Happy Customers</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">15+</div>
                <div className="text-lg text-gray-300">Venue Partners</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-orange-50">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Experience Amazing Events?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of satisfied customers and book your next unforgettable experience
            </p>
            <Button 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => navigate('/client/performances')}
            >
              Browse All Events
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold mb-4">Ticketing Service</h3>
              <p className="text-gray-300 mb-4">
                Your premier destination for booking tickets to the best performances and events.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><button onClick={() => navigate('/client/performances')}>All Events</button></li>
                <li><button onClick={() => navigate('/client/my-bookings')}>My Bookings</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>FAQ</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Ticketing Service. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientApp;