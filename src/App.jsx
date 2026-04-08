import { useState, useEffect, useCallback } from 'react';
import './App.css';

const API = import.meta.env.VITE_API_URL || '/api';
const PRICE_PER_SEAT = 350;

const SHOWS = [
  { id: 1, movie: '🎬 Interstellar', time: '10:00 AM', genre: 'Sci-Fi', duration: '2h 49m', rating: '8.6' },
  { id: 2, movie: '🔥 Dune: Part Two', time: '1:30 PM', genre: 'Adventure', duration: '2h 46m', rating: '8.5' },
  { id: 3, movie: '🕷️ Venom 3', time: '4:00 PM', genre: 'Action', duration: '1h 49m', rating: '7.0' },
  { id: 4, movie: '🌙 Oppenheimer', time: '7:30 PM', genre: 'Drama', duration: '3h', rating: '8.9' },
];

function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  return { toasts, addToast };
}

export default function App() {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [activeShow, setActiveShow] = useState(SHOWS[0]);
  const { toasts, addToast } = useToast();

  const fetchSeats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/seats`);
      const data = await res.json();
      setSeats(data);
    } catch {
      addToast('Failed to connect to server. Is the backend running?', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchSeats();
  }, [fetchSeats]);

  const toggleSeat = (seat) => {
    if (seat.status === 'booked') return;
    setSelectedSeats(prev =>
      prev.includes(seat.id)
        ? prev.filter(id => id !== seat.id)
        : [...prev, seat.id]
    );
  };

  const handleBook = async () => {
    if (selectedSeats.length === 0) return;
    setBooking(true);
    try {
      const res = await fetch(`${API}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatIds: selectedSeats }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const newTicket = {
        id: `TKT-${Date.now()}`,
        show: activeShow,
        seats: [...selectedSeats],
        price: selectedSeats.length * PRICE_PER_SEAT,
        bookedAt: new Date().toLocaleTimeString(),
      };
      setTickets(prev => [newTicket, ...prev]);
      setSelectedSeats([]);
      addToast(`✅ ${selectedSeats.length} seat(s) booked successfully!`, 'success');
      fetchSeats();
    } catch (err) {
      addToast(err.message || 'Booking failed', 'error');
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (ticket) => {
    try {
      const res = await fetch(`${API}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatIds: ticket.seats }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setTickets(prev => prev.filter(t => t.id !== ticket.id));
      addToast(`🗑️ Booking ${ticket.id} cancelled.`, 'success');
      fetchSeats();
    } catch (err) {
      addToast(err.message || 'Cancellation failed', 'error');
    }
  };

  const availableCount = seats.filter(s => s.status === 'available').length;
  const bookedCount = seats.filter(s => s.status === 'booked').length;
  const totalPrice = selectedSeats.length * PRICE_PER_SEAT;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">🎭</div>
            <span className="logo-text">CineBook</span>
          </div>
          <div className="header-badges">
            <span className="badge badge-available">
              <span className="dot" />
              {availableCount} Available
            </span>
            <span className="badge badge-booked">
              <span className="dot" />
              {bookedCount} Booked
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        <h1 className="page-title">Book Your Seats</h1>
        <p className="page-subtitle">Select your preferred seats and confirm your booking</p>

        {/* Show Selector */}
        <div className="show-selector">
          <label>🎞️ Select Show:</label>
          <div className="show-time-badges">
            {SHOWS.map(show => (
              <button
                key={show.id}
                className={`time-badge ${activeShow.id === show.id ? 'active' : ''}`}
                onClick={() => { setActiveShow(show); setSelectedSeats([]); }}
              >
                {show.time}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-screen">
            <div className="loader" />
            <p className="loading-text">Loading seat map...</p>
          </div>
        ) : (
          <div className="layout-grid">
            {/* Seat Map */}
            <div>
              {/* Cinema Screen */}
              <div className="cinema-screen-wrap">
                <div className="cinema-screen">
                  <span className="screen-label">SCREEN</span>
                </div>
                <div className="screen-shadow" />
              </div>

              <div className="seat-section">
                <div className="seat-section-title">
                  🪑 Seat Map — {activeShow.movie}
                </div>

                <div className="seat-grid">
                  {seats.map(seat => (
                    <button
                      key={seat.id}
                      className={`seat ${
                        seat.status === 'booked'
                          ? 'seat-booked-state'
                          : selectedSeats.includes(seat.id)
                          ? 'seat-selected-state'
                          : ''
                      }`}
                      onClick={() => toggleSeat(seat)}
                      title={seat.status === 'booked' ? 'Already booked' : `Seat ${seat.id}`}
                    >
                      <span className="seat-number">{seat.id}</span>
                    </button>
                  ))}
                </div>

                {/* Legend */}
                <div className="legend">
                  <div className="legend-item">
                    <div className="legend-dot available" />
                    Available
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot selected" />
                    Selected
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot booked" />
                    Booked
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="panel">
              {/* Movie Info */}
              <div className="panel-card">
                <div className="panel-card-title">🎬 Now Showing</div>
                <div className="movie-info">
                  <div className="movie-poster">
                    {activeShow.movie.split(' ')[0]}
                  </div>
                  <div>
                    <div className="movie-title-card">{activeShow.movie.substring(3)}</div>
                    <div className="movie-meta">
                      <span className="meta-tag">{activeShow.genre}</span>
                      <span className="meta-tag">{activeShow.duration}</span>
                      <span className="meta-tag">⭐ {activeShow.rating}</span>
                      <span className="meta-tag">🕐 {activeShow.time}</span>
                    </div>
                  </div>
                  <div className="price-per-seat">
                    <span className="price-label">Price per seat</span>
                    <span className="price-value">₹{PRICE_PER_SEAT}</span>
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="panel-card">
                <div className="panel-card-title">🎟️ Your Selection</div>

                <div className="selected-seats-list">
                  {selectedSeats.length === 0 ? (
                    <span className="empty-state">Click on seats to select them</span>
                  ) : (
                    selectedSeats.sort((a, b) => a - b).map(id => (
                      <span key={id} className="selected-seat-chip">S{id}</span>
                    ))
                  )}
                </div>

                <div className="summary-total">
                  <div>
                    <div className="total-label">Total ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})</div>
                  </div>
                  <span className="total-price">₹{totalPrice.toLocaleString()}</span>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleBook}
                  disabled={selectedSeats.length === 0 || booking}
                >
                  {booking ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <span className="loader" style={{ width: 16, height: 16, borderTopColor: '#000' }} />
                      Processing...
                    </span>
                  ) : `Confirm Booking`}
                </button>

                {selectedSeats.length > 0 && (
                  <button
                    className="btn btn-secondary btn-gap"
                    onClick={() => setSelectedSeats([])}
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Booked Tickets */}
        {tickets.length > 0 && (
          <>
            <div className="divider" />
            <div className="booked-tickets">
              <div className="section-title">
                🎫 Your Tickets ({tickets.length})
              </div>
              <div className="tickets-grid">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="ticket-card">
                    <div className="ticket-header">
                      <span className="ticket-id">{ticket.id}</span>
                      <span className="ticket-status">
                        <span className="dot" style={{ background: 'var(--green)', width: 6, height: 6, borderRadius: '50%', display: 'inline-block' }} />
                        Confirmed
                      </span>
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                        {ticket.show.movie.substring(3)}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {ticket.show.time} · Booked at {ticket.bookedAt}
                      </div>
                    </div>

                    <div className="ticket-seats-label">Seats</div>
                    <div className="ticket-seats">
                      {ticket.seats.sort((a, b) => a - b).map(id => (
                        <span key={id} className="ticket-seat-chip">S{id}</span>
                      ))}
                    </div>

                    <div className="ticket-footer">
                      <div>
                        <div className="ticket-price-label">Total Paid</div>
                        <div className="ticket-price">₹{ticket.price.toLocaleString()}</div>
                      </div>
                      <button
                        className="ticket-cancel-btn"
                        onClick={() => handleCancel(ticket)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tickets.length === 0 && !loading && (
          <>
            <div className="divider" />
            <div className="no-tickets">
              <div className="no-tickets-icon">🎟️</div>
              No tickets booked yet. Select seats above to get started!
            </div>
          </>
        )}
      </main>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
