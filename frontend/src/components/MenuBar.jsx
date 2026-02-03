import { Phone, MapPin, MailOpen, Gift, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export const MenuBar = ({ onContactClick, onLocationClick, onRSVPClick, onGiftClick, showHome = false }) => {
  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="fixed bottom-3 left-3 z-40"
    >
      <div className="bg-warm-brown text-cream rounded-full px-8 py-4 shadow-2xl flex gap-6 md:gap-8">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onContactClick}
          className="hover:text-gold transition-colors"
          aria-label="Contact"
          data-testid="menu-contact-btn"
        >
          <Phone size={24} />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLocationClick}
          className="hover:text-gold transition-colors"
          aria-label="Location"
          data-testid="menu-location-btn"
        >
          <MapPin size={24} />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRSVPClick}
          className="hover:text-gold transition-colors"
          aria-label="RSVP"
          data-testid="menu-rsvp-btn"
        >
          <MailOpen size={24} />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGiftClick}
          className="hover:text-gold transition-colors"
          aria-label={showHome ? "Home" : "Gift Registry"}
          data-testid={showHome ? "menu-home-btn" : "menu-gift-btn"}
        >
          {showHome ? <Home size={24} /> : <Gift size={24} />}
        </motion.button>
      </div>
    </motion.div>
  );
};
