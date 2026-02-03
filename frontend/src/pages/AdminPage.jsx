import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Download, ArrowLeft, Eye, EyeOff, Upload, Trash2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const ADMIN_PASSWORD = 'RestbySashaSloan!';

export const AdminPage = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rsvps, setRsvps] = useState([]);
  const [registry, setRegistry] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
  }, [authenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rsvpResponse, registryResponse] = await Promise.all([
        axios.get(`${API}/rsvp`),
        axios.get(`${API}/registry`)
      ]);
      setRsvps(rsvpResponse.data);
      setRegistry(registryResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      toast.success('Welcome back!');
    } else {
      toast.error('Incorrect password');
      setPassword('');
    }
  };

  const exportToCSV = (data, filename, headers) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header.toLowerCase().replace(/ /g, '_')] || '';
        return `"${value}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const exportRSVPs = () => {
    const formattedRSVPs = rsvps.map(rsvp => ({
      name: rsvp.name,
      pax: rsvp.pax,
      wishes: rsvp.wishes,
      timestamp: new Date(rsvp.timestamp).toLocaleString()
    }));
    exportToCSV(formattedRSVPs, 'rsvps.csv', ['Name', 'Pax', 'Wishes', 'Timestamp']);
    toast.success('RSVPs exported successfully!');
  };

  const exportContributions = () => {
    const allContributions = [];
    registry.forEach(item => {
      item.contributions.forEach(contrib => {
        allContributions.push({
          item_name: item.name,
          contributor_name: contrib.contributor_name,
          amount: `RM ${contrib.amount.toFixed(2)}`,
          timestamp: new Date(contrib.timestamp).toLocaleString()
        });
      });
    });
    exportToCSV(allContributions, 'gift_contributions.csv', ['Item_Name', 'Contributor_Name', 'Amount', 'Timestamp']);
    toast.success('Contributions exported successfully!');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/registry/upload-csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success(`Registry updated! ${response.data.items_count} items, ${response.data.total_contributions} contributions`);
      fetchData(); // Refresh data
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload CSV');
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['Item_name', 'Link', 'Total', 'Contributor', 'Amount', 'Timestamp'],
      ['Plates', 'https://shopee.com.my', '100', '0', '0', ''],
      ['Carpet', 'https://shopee.com.my', '200', 'John Doe', '50', new Date().toISOString()],
      ['Carpet', 'https://shopee.com.my', '200', 'Jane Smith', '30', new Date().toISOString()]
    ];
    
    const csvContent = sampleData.map(row => row.join(',').replace(/,(?=\S)/g, ', ')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'registry_template.csv';
    link.click();
    toast.success('Sample CSV downloaded!');
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream font-georgia">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-border-brown"
        >
          <h1 className="text-3xl font-bold text-warm-brown mb-6 text-center">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-dark-brown font-semibold mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border-brown focus:outline-none focus:ring-2 focus:ring-warm-brown pr-12"
                  required
                  data-testid="admin-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-medium-brown hover:text-warm-brown"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-warm-brown text-cream px-6 py-3 rounded-lg hover:bg-dark-brown transition-colors font-semibold"
              data-testid="admin-login-btn"
            >
              Enter
            </button>
          </form>
          <button
            onClick={() => navigate('/registry')}
            className="mt-4 w-full text-medium-brown hover:text-warm-brown transition-colors text-sm flex items-center justify-center gap-2"
            data-testid="admin-back-btn"
          >
            <ArrowLeft size={16} />
            Back to Registry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream font-georgia py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-warm-brown">Admin Dashboard</h1>
          <button
            onClick={() => navigate('/registry')}
            className="flex items-center gap-2 text-medium-brown hover:text-warm-brown transition-colors"
            data-testid="admin-dashboard-back-btn"
          >
            <ArrowLeft size={20} />
            Back to Registry
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-medium-brown text-lg">Loading data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upload CSV Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gold/10 border-2 border-gold rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-warm-brown mb-4">Upload Registry CSV</h2>
              <p className="text-dark-brown mb-4">
                Upload a CSV file to update the registry. Format: Item_name, Link, Total, Contributor, Amount, Timestamp
              </p>
              <p className="text-medium-brown text-sm mb-4">
                Note: If Contributor = 0, it will be added as a new item with no contributions.
              </p>
              <div className="flex gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  data-testid="csv-file-input"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 bg-warm-brown text-cream px-6 py-3 rounded-lg hover:bg-dark-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="upload-csv-btn"
                >
                  <Upload size={20} />
                  {uploading ? 'Uploading...' : 'Upload CSV'}
                </button>
                <button
                  onClick={downloadSampleCSV}
                  className="flex items-center gap-2 bg-light-cream text-warm-brown px-6 py-3 rounded-lg hover:bg-border-brown transition-colors border border-border-brown"
                  data-testid="download-template-btn"
                >
                  <Download size={20} />
                  Download Template
                </button>
              </div>
            </motion.div>

            {/* RSVPs Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-border-brown"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-warm-brown">RSVPs ({rsvps.length})</h2>
                <button
                  onClick={exportRSVPs}
                  className="flex items-center gap-2 bg-warm-brown text-cream px-4 py-2 rounded-lg hover:bg-dark-brown transition-colors"
                  data-testid="export-rsvps-btn"
                >
                  <Download size={18} />
                  Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-brown">
                      <th className="text-left py-3 px-4 text-dark-brown font-semibold">Name</th>
                      <th className="text-left py-3 px-4 text-dark-brown font-semibold">Pax</th>
                      <th className="text-left py-3 px-4 text-dark-brown font-semibold">Wishes</th>
                      <th className="text-left py-3 px-4 text-dark-brown font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rsvps.map((rsvp, index) => (
                      <tr key={rsvp.id} className="border-b border-light-cream hover:bg-light-cream/50" data-testid={`rsvp-row-${index}`}>
                        <td className="py-3 px-4 text-dark-brown">{rsvp.name}</td>
                        <td className="py-3 px-4 text-dark-brown">{rsvp.pax}</td>
                        <td className="py-3 px-4 text-dark-brown max-w-md truncate">{rsvp.wishes || '-'}</td>
                        <td className="py-3 px-4 text-medium-brown text-sm">
                          {new Date(rsvp.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {rsvps.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-medium-brown">
                          No RSVPs yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Gift Registry Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-border-brown"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-warm-brown">Gift Contributions</h2>
                <button
                  onClick={exportContributions}
                  className="flex items-center gap-2 bg-warm-brown text-cream px-4 py-2 rounded-lg hover:bg-dark-brown transition-colors"
                  data-testid="export-contributions-btn"
                >
                  <Download size={18} />
                  Export CSV
                </button>
              </div>
              <div className="space-y-6">
                {registry.map((item) => (
                  <div key={item.id} className="border border-border-brown rounded-lg p-4" data-testid={`registry-item-${item.id}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-warm-brown">{item.name}</h3>
                        <p className="text-medium-brown text-sm">Total: RM {item.total.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gold font-bold text-lg">RM {item.contributed.toFixed(2)}</p>
                        <p className="text-medium-brown text-sm">
                          {((item.contributed / item.total) * 100).toFixed(1)}% funded
                        </p>
                      </div>
                    </div>
                    {item.contributions.length > 0 ? (
                      <div className="bg-light-cream/50 rounded-lg p-3">
                        <p className="text-dark-brown font-semibold mb-2 text-sm">Contributors:</p>
                        <div className="space-y-1">
                          {item.contributions.map((contrib, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-dark-brown">{contrib.contributor_name}</span>
                              <span className="text-gold font-semibold">RM {contrib.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-medium-brown text-sm italic">No contributions yet</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};