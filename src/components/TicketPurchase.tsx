import { useState } from 'react';
import { Calendar, MapPin, Star, X, Users, Crown } from 'lucide-react';

// Define ticket type
type Ticket = {
  type: string;
  price: string;
  icon?: React.ComponentType<{ className?: string }>;
  remaining: number;
};

// Define Event type
type Event = {
  id: number;
  artist: string;
  venue: string;
  date: string;
  time: string;
  genre: string;
  description?: string;
  image: string;
  tickets: Ticket[];
};

interface TicketPurchaseProps {
  event: Event;
  onClose: () => void;
  onPurchase: (eventId: number, ticketType: string, quantity: number) => void;
}

export default function TicketPurchase({ event, onClose, onPurchase }: TicketPurchaseProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(
    event.tickets && event.tickets.length > 0 ? event.tickets[0] : null
  );
  const [quantity, setQuantity] = useState(1);

  const calculatePrices = () => {
    if (!selectedTicket) return { subtotal: 0, serviceFee: 0, total: 0 };
    
    const ticketPrice = parseFloat(selectedTicket.price.replace(/[^0-9.]/g, ''));
    const subtotal = ticketPrice * quantity;
    const serviceFee = subtotal * 0.10; // 10% service fee
    const total = subtotal + serviceFee;
    
    return {
      subtotal: subtotal.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const handlePurchase = () => {
    if (selectedTicket) {
      onPurchase(event.id, selectedTicket.type, quantity);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Purchase Tickets</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left column - Event details */}
            <div className="md:w-1/3">
              <img 
                src={event.image} 
                alt={event.artist}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-bold mb-1">{event.artist}</h3>
              <div className="text-gray-600 text-sm mb-4">
                <div className="flex items-center mb-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  {event.date} at {event.time}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.venue}
                </div>
              </div>
              
              <div className="border-t pt-4 mb-6">
                {(() => {
                  const prices = calculatePrices();
                  return (
                    <>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">NPR{prices.subtotal}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Service Fee</span>
                        <span className="font-medium">NPR{prices.serviceFee}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>NPR{prices.total}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
            
            {/* Right column - Ticket selection */}
            <div className="md:w-2/3">
              <div className="space-y-4 mb-6">
                <h4 className="font-medium text-gray-700">Select Ticket Type</h4>
                {event.tickets && event.tickets.map((ticket: Ticket, index: number) => (
                  <div 
                    key={ticket.type}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-indigo-500
                      ${selectedTicket === ticket ? 'border-indigo-500 bg-indigo-50' :
                        index === 0 ? 'border-amber-400 bg-amber-50' : 
                        index === 1 ? 'border-gray-400 bg-gray-50' : 
                        index === 2 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {index === 0 ? (
                          <Users className="h-5 w-5 mr-2 text-amber-500" />
                        ) : index === 1 ? (
                          <Star className="h-5 w-5 mr-2 text-gray-500" />
                        ) : (
                          <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                        )}
                        <span className="font-medium">{ticket.type}</span>
                      </div>
                      <span className="font-bold">{ticket.price}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {ticket.remaining} tickets remaining
                    </div>
                    {index === 2 && (
                      <div className="mt-1 text-xs text-yellow-600 font-medium">
                        ✨ Best Experience
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 mb-6">
                <h4 className="font-medium text-gray-700">Quantity</h4>
                <div className="flex items-center border rounded-lg">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center">{quantity}</div>
                  <button 
                    onClick={() => setQuantity(prev => Math.min(10, prev + 1))}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <button 
                onClick={handlePurchase}
                className="w-full bg-indigo-600 text-white py-3 rounded-full hover:bg-indigo-700 transition-colors font-medium"
                disabled={!selectedTicket}
              >
                Complete Purchase
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                By completing this purchase, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}