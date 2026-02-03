import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { MenuBar } from '../components/MenuBar.jsx';
import { Modal } from '../components/Modal.jsx';
import { Progress } from '../components/ui/progress';
import { ExternalLink } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Registry = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [contributorsOpen, setContributorsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [contributionForm, setContributionForm] = useState({
    contributor_name: '',
    amount: ''
  });
  const [rsvpForm, setRsvpForm] = useState({
    name: '',
    pax: '',
    wishes: ''
  });

  const weddingDate = '2026-07-25T11:00:00';
  const rsvpCutoffDate = new Date('2026-07-24T23:59:59');
  const isRsvpClosed = new Date() > rsvpCutoffDate;

  useEffect(() => {
    fetchRegistry();
  }, []);

  const fetchRegistry = async () => {
    try {
      const response = await axios.get(`${API}/registry`);
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch registry:', error);
      toast.error('Failed to load registry items');
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    
    if (!contributionForm.contributor_name || !contributionForm.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(contributionForm.amount);
    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    try {
      await axios.post(`${API}/registry/contribute`, {
        item_id: selectedItem.id,
        contributor_name: contributionForm.contributor_name,
        amount: amount
      });
      
      toast.success('Thank you for your generous contribution!');
      setContributionForm({ contributor_name: '', amount: '' });
      setContributeOpen(false);
      setSelectedItem(null);
      fetchRegistry();
    } catch (error) {
      console.error('Contribution error:', error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to submit contribution. Please try again.');
      }
    }
  };

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

  const openContributeModal = (item) => {
    setSelectedItem(item);
    setContributeOpen(true);
  };

  const openContributorsModal = (item) => {
    setSelectedItem(item);
    setContributorsOpen(true);
  };

  const getProgressPercentage = (item) => {
    return (item.contributed / item.total) * 100;
  };

  const getRemainingAmount = (item) => {
    return item.total - item.contributed;
  };

  const isPurchased = (item) => {
    return item.contributed >= item.total;
  };

  return (
    <div className="min-h-screen relative font-georgia bg-cream">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10 opacity-30"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1762086931964-373bceb5a690?crop=entropy&cs=srgb&fm=jpg&q=85)',
          backgroundAttachment: 'fixed'
        }}
      />

      <div className="relative min-h-screen py-12 px-4 md:px-8 pb-32">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-warm-brown mb-4">Gift Registry</h1>
            <p className="text-lg md:text-xl text-medium-brown">
              Your contributions will help us start our journey together
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" data-testid="registry-items-grid">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-border-brown"
                data-testid={`registry-item-${item.id}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-warm-brown mb-2">{item.name}</h3>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-medium-brown hover:text-warm-brown flex items-center gap-1 text-sm"
                      data-testid={`item-link-${item.id}`}
                    >
                      View on Shopee <ExternalLink size={14} />
                    </a>
                  </div>
                  {isPurchased(item) && (
                    <span 
                      className="bg-gold text-dark-brown px-3 py-1 rounded-full text-sm font-semibold"
                      data-testid={`purchased-badge-${item.id}`}
                    >
                      Purchased
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-dark-brown">Progress</span>
                    <span className="text-medium-brown font-semibold">
                      RM {item.contributed.toFixed(2)} / RM {item.total.toFixed(2)}
                    </span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(item)} 
                    className="h-3"
                    data-testid={`progress-${item.id}`}
                  />
                  {!isPurchased(item) && (
                    <p className="text-sm text-medium-brown mt-2">
                      RM {getRemainingAmount(item).toFixed(2)} remaining
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  {!isPurchased(item) && (
                    <button
                      onClick={() => openContributeModal(item)}
                      className="flex-1 bg-warm-brown text-cream px-4 py-2 rounded-lg hover:bg-dark-brown transition-colors font-semibold"
                      data-testid={`contribute-btn-${item.id}`}
                    >
                      Contribute
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <MenuBar
        onContactClick={() => {}}
        onLocationClick={() => {}}
        onRSVPClick={() => {}}
        onGiftClick={() => navigate('/')}
        showHome={true}
      />

      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => navigate('/admin')}
          className="text-xs text-medium-brown hover:text-warm-brown transition-colors underline"
          data-testid="admin-link"
        >
          Ana & Faris's eyes only
        </button>
      </div>

      <Modal 
        isOpen={contributeOpen} 
        onClose={() => {
          setContributeOpen(false);
          setSelectedItem(null);
          setContributionForm({ contributor_name: '', amount: '' });
        }} 
        title={`Contribute to ${selectedItem?.name}`}
      >
        <form onSubmit={handleContribute} className="space-y-4" data-testid="contribution-form">
          <div>
            <p className="text-medium-brown mb-4">
              Remaining: <span className="font-bold text-warm-brown">
                RM {selectedItem ? getRemainingAmount(selectedItem).toFixed(2) : '0.00'}
              </span>
            </p>
          </div>
          
          <div>
            <label className="block text-dark-brown font-semibold mb-2">Your Name *</label>
            <input
              type="text"
              value={contributionForm.contributor_name}
              onChange={(e) => setContributionForm({ ...contributionForm, contributor_name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-border-brown focus:outline-none focus:ring-2 focus:ring-warm-brown"
              required
              data-testid="contribution-name-input"
            />
          </div>
          
          <div>
            <label className="block text-dark-brown font-semibold mb-2">Amount (MYR) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={contributionForm.amount}
              onChange={(e) => setContributionForm({ ...contributionForm, amount: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-border-brown focus:outline-none focus:ring-2 focus:ring-warm-brown"
              required
              data-testid="contribution-amount-input"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-warm-brown text-cream px-6 py-4 rounded-lg text-lg font-semibold hover:bg-dark-brown transition-colors"
            data-testid="contribution-submit-btn"
          >
            Submit Contribution
          </button>
        </form>
      </Modal>

      <Modal 
        isOpen={contributorsOpen} 
        onClose={() => {
          setContributorsOpen(false);
          setSelectedItem(null);
        }} 
        title={`Contributors to ${selectedItem?.name}`}
      >
        <div className="space-y-3" data-testid="contributors-list">
          {selectedItem?.contributions.map((contrib, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center border-b border-border-brown pb-3"
              data-testid={`contributor-${index}`}
            >
              <span className="text-dark-brown font-semibold">{contrib.contributor_name}</span>
              <span className="text-gold font-bold">RM {contrib.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};
