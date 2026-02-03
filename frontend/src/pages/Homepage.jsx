import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { DoorEntrance } from '../components/DoorEntrance.jsx';
import { Countdown } from '../components/Countdown.jsx';
import { MenuBar } from '../components/MenuBar.jsx';
import { Modal } from '../components/Modal.jsx';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Homepage = () => {
  const navigate = useNavigate();
  const [doorOpen, setDoorOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  
  const [rsvpForm, setRsvpForm] = useState({
    name: '',
    pax: '',
    wishes: ''
  });

  const weddingDate = '2026-07-25T11:00:00';
  const rsvpCutoffDate = new Date('2026-07-24T23:59:59');
  const isRsvpClosed = new Date() > rsvpCutoffDate;

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    
    if (!rsvpForm.name || !rsvpForm.pax) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await axios.post(`${API}/rsvp`, {
        name: rsvpForm.name,
        pax: parseInt(rsvpForm.pax),
        wishes: rsvpForm.wishes
      });
      
      toast.success('Thank you for your RSVP! We look forward to seeing you!');
      setRsvpForm({ name: '', pax: '', wishes: '' });
      setRsvpOpen(false);
    } catch (error) {
      console.error('RSVP error:', error);
      toast.error('Failed to submit RSVP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden font-georgia">
      <DoorEntrance onOpen={() => setDoorOpen(true)} />
      
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1685040235380-a42a129ade4e?crop=entropy&cs=srgb&fm=jpg&q=85)',
          backgroundAttachment: 'fixed'
        }}
      />

      <div className="relative min-h-screen pt-[100vh] pb-32 px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-16 md:space-y-24">
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white/3 backdrop-blur-md border border-white/20 shadow-xl rounded-xl md:rounded-2xl p-8 md:p-12 text-center"
            data-testid="invitation-section"
          >
            <p className="text-lg md:text-xl text-medium-brown mb-4 tracking-wide">You're invited to</p>
            <h1 className="text-4xl md:text-6xl font-bold text-warm-brown mb-6 leading-tight">
              The Wedding of<br />Ana & Faris
            </h1>
            <div className="space-y-3 text-lg md:text-xl text-dark-brown">
              <p>at</p>
              <p className="font-semibold text-2xl md:text-3xl text-warm-brown">Rinjani Majestic, Subang</p>
              <p>on</p>
              <p className="font-semibold text-xl md:text-2xl">25th of July, 2026</p>
              <p className="text-medium-brown">11 am to 4 pm</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/3 backdrop-blur-md border border-white/20 shadow-xl rounded-xl md:rounded-2xl p-8 md:p-12"
            data-testid="countdown-section"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-warm-brown text-center mb-8">Countdown</h2>
            <Countdown targetDate={weddingDate} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white/3 backdrop-blur-md border border-white/20 shadow-xl rounded-xl md:rounded-2xl p-8 md:p-12"
            data-testid="agenda-section"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-warm-brown text-center mb-8">Wedding Agenda</h2>
            <div className="space-y-4 text-lg md:text-xl text-dark-brown">
              <div className="flex justify-between items-center border-b border-border-brown pb-4">
                <span className="font-semibold">Lunch Buffet</span>
                <span className="text-medium-brown">11:30 am - 4:00 pm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">The Arrival of Bride & Groom</span>
                <span className="text-medium-brown">12:30 pm</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      <MenuBar
        onContactClick={() => setContactOpen(true)}
        onLocationClick={() => setLocationOpen(true)}
        onRSVPClick={() => setRsvpOpen(true)}
        onGiftClick={() => navigate('/registry')}
      />

      <Modal isOpen={contactOpen} onClose={() => setContactOpen(false)} title="Contact Us">
        <div className="space-y-4">
          <p className="text-dark-brown text-lg">Feel free to reach out to us:</p>
          <div className="space-y-3">
            <a
              href="https://wa.me/60123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-warm-brown text-cream px-6 py-3 rounded-lg text-center hover:bg-dark-brown transition-colors"
              data-testid="contact-ana-btn"
            >
              Ana - WhatsApp
            </a>
            <a
              href="https://wa.me/60129876543"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-warm-brown text-cream px-6 py-3 rounded-lg text-center hover:bg-dark-brown transition-colors"
              data-testid="contact-faris-btn"
            >
              Faris - WhatsApp
            </a>
          </div>
        </div>
      </Modal>

      <Modal isOpen={locationOpen} onClose={() => setLocationOpen(false)} title="Location">
        <div className="space-y-4">
          <p className="text-dark-brown text-lg font-semibold">Rinjani Majestic, Subang</p>
          <div className="flex gap-4">
            <a
              href="https://maps.app.goo.gl/etJK5Ie0Ru06WHNCr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-warm-brown text-cream px-6 py-3 rounded-lg text-center hover:bg-dark-brown transition-colors"
              data-testid="location-google-maps-btn"
            >
              Google Maps
            </a>
            <a
              href="https://waze.com/ul/etJK5Ie0Ru06WHNCr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-warm-brown text-cream px-6 py-3 rounded-lg text-center hover:bg-dark-brown transition-colors"
              data-testid="location-waze-btn"
            >
              Waze
            </a>
          </div>
        </div>
      </Modal>

      <Modal isOpen={rsvpOpen} onClose={() => setRsvpOpen(false)} title="RSVP">
        {isRsvpClosed ? (
          <div className="text-center py-8">
            <p className="text-xl text-dark-brown font-semibold" data-testid="rsvp-closed-message">
              Sorry, RSVP is closed
            </p>
          </div>
        ) : (
          <form onSubmit={handleRsvpSubmit} className="space-y-4" data-testid="rsvp-form">
            <div>
              <label className="block text-dark-brown font-semibold mb-2">Name *</label>
              <input
                type="text"
                value={rsvpForm.name}
                onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-border-brown focus:outline-none focus:ring-2 focus:ring-warm-brown"
                required
                data-testid="rsvp-name-input"
              />
            </div>
            
            <div>
              <label className="block text-dark-brown font-semibold mb-2">No. Pax *</label>
              <input
                type="number"
                min="1"
                value={rsvpForm.pax}
                onChange={(e) => setRsvpForm({ ...rsvpForm, pax: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-border-brown focus:outline-none focus:ring-2 focus:ring-warm-brown"
                required
                data-testid="rsvp-pax-input"
              />
            </div>
            
            <div>
              <label className="block text-dark-brown font-semibold mb-2">Wishes</label>
              <textarea
                value={rsvpForm.wishes}
                onChange={(e) => setRsvpForm({ ...rsvpForm, wishes: e.target.value })}
                rows="4"
                className="w-full px-4 py-3 rounded-lg border border-border-brown focus:outline-none focus:ring-2 focus:ring-warm-brown resize-none"
                data-testid="rsvp-wishes-input"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-warm-brown text-cream px-6 py-4 rounded-lg text-lg font-semibold hover:bg-dark-brown transition-colors"
              data-testid="rsvp-submit-btn"
            >
              I'll be there
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};
