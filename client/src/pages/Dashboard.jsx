import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Link2, Copy, QrCode, Trash2, BarChart2, ExternalLink, 
  PlusCircle, Calendar, Hash, MousePointerClick, Check, Settings 
} from 'lucide-react';
import { urlService } from '../services/api';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';
import QRModal from '../components/QRModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [urls, setUrls] = useState([]);
  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  // QR Modal State
  const [qrOpen, setQrOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');

  const fetchUrls = async () => {
    setLoading(true);
    try {
      const res = await urlService.getUrls();
      setUrls(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    } else {
      fetchUrls();
    }
  }, [navigate]);

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!longUrl) {
      toast.error('Please enter a URL to shorten');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await urlService.shortenUrl(longUrl, customAlias, expiresAt);
      toast.success('Link shortened successfully!');
      
      // Reset form fields
      setLongUrl('');
      setCustomAlias('');
      setExpiresAt('');
      setShowAdvanced(false);
      
      // Refresh list
      fetchUrls();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to shorten URL');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;
    try {
      await urlService.deleteUrl(id);
      toast.success('Link deleted successfully');
      setUrls(urls.filter(url => url._id !== id));
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete URL');
    }
  };

  const handleCopy = (code, id) => {
    const shortUrl = getShortUrl(code);
    navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQR = (code) => {
    setSelectedUrl(getShortUrl(code));
    setQrOpen(true);
  };

  // Helper to format short links targeting the backend server redirector
  const getShortUrl = (code) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5005';
    return `${backendUrl}/${code}`;
  };

  // Stats Aggregation
  const totalUrls = urls.length;
  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
  const mostClicked = urls.length > 0 
    ? [...urls].sort((a, b) => b.clicks - a.clicks)[0] 
    : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-950 text-white p-4 sm:p-6 lg:p-8 relative">
      {/* Decorative Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Title & Welcome */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-indigo-300 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-400 text-sm">Create, share, and track your links globally.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Links */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex items-center space-x-4 shadow-xl hover:border-gray-700 transition duration-300">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
              <Hash className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Active URLs</p>
              <h3 className="text-2xl font-bold mt-1">{totalUrls}</h3>
            </div>
          </div>

          {/* Card 2: Total Clicks */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex items-center space-x-4 shadow-xl hover:border-gray-700 transition duration-300">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
              <MousePointerClick className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Clicks</p>
              <h3 className="text-2xl font-bold mt-1">{totalClicks}</h3>
            </div>
          </div>

          {/* Card 3: Top Performing */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex items-center space-x-4 shadow-xl hover:border-gray-700 transition duration-300">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Top Performing URL</p>
              {mostClicked ? (
                <div className="mt-1">
                  <h3 className="text-lg font-bold truncate max-w-full" title={mostClicked.longUrl}>
                    {mostClicked.customAlias || mostClicked.shortCode}
                  </h3>
                  <span className="text-xs text-gray-400 flex items-center mt-0.5">
                    {mostClicked.clicks} click{mostClicked.clicks !== 1 && 's'}
                  </span>
                </div>
              ) : (
                <h3 className="text-lg font-bold text-gray-500 mt-1">No links created</h3>
              )}
            </div>
          </div>
        </div>

        {/* Shorten Link Box */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
          
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-indigo-400" />
            <span>Shorten a new URL</span>
          </h2>
          
          <form onSubmit={handleShorten} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                placeholder="Paste your long destination URL (e.g. google.com, http://example.com)..."
                className="flex-1 px-4 py-3.5 bg-gray-950 border border-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl placeholder-gray-600 focus:outline-none transition duration-200"
              />
              <button
                type="submit"
                disabled={submitLoading}
                className="px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-500/15 hover:shadow-indigo-500/25 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
              >
                {submitLoading ? <Spinner size="sm" color="white" /> : <span>Shorten</span>}
              </button>
            </div>

            {/* Advanced Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white cursor-pointer select-none transition duration-200"
            >
              <Settings className={`w-3.5 h-3.5 transform transition-transform duration-300 ${showAdvanced ? 'rotate-90 text-indigo-400' : ''}`} />
              <span>Advanced Options (Custom Alias & Expiry)</span>
            </button>

            {/* Advanced Inputs */}
            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-950 border border-gray-800/60 animate-scale-up">
                {/* Custom Alias */}
                <div>
                  <label className="block text-xs text-gray-400 font-semibold mb-2">Custom Alias (Optional)</label>
                  <input
                    type="text"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    placeholder="e.g. portfolio, my-promo"
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 focus:border-indigo-500 rounded-xl placeholder-gray-600 focus:outline-none text-sm transition"
                  />
                </div>
                {/* Expiry Date */}
                <div>
                  <label className="block text-xs text-gray-400 font-semibold mb-2">Expiration Date (Optional)</label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 focus:border-indigo-500 rounded-xl placeholder-gray-600 focus:outline-none text-sm text-gray-300 transition"
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* URLs Table List */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800/80 bg-gray-900/50 flex items-center justify-between">
            <h2 className="font-bold text-lg">My Links</h2>
            <button 
              onClick={fetchUrls} 
              className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-20">
              <Spinner size="lg" />
            </div>
          ) : urls.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <p className="text-lg">No shortened links yet.</p>
              <p className="text-sm mt-1">Paste a link above to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-950 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-800">
                    <th className="px-6 py-4">Original URL</th>
                    <th className="px-6 py-4">Shortened link</th>
                    <th className="px-6 py-4 text-center">Clicks</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {urls.map((url) => {
                    const isExpired = url.expiresAt && new Date() > new Date(url.expiresAt);
                    return (
                      <tr key={url._id} className="hover:bg-gray-800/30 transition duration-150">
                        {/* Target Link */}
                        <td className="px-6 py-4 max-w-[240px]">
                          <div className="truncate text-gray-200 font-medium" title={url.longUrl}>
                            {url.longUrl}
                          </div>
                        </td>

                        {/* Short Link Action */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <a 
                              href={getShortUrl(url.shortCode)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:text-indigo-300 font-semibold truncate hover:underline flex items-center space-x-1"
                            >
                              <span>{url.customAlias || url.shortCode}</span>
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                            
                            <button
                              onClick={() => handleCopy(url.shortCode, url._id)}
                              className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition cursor-pointer"
                              title="Copy URL"
                            >
                              {copiedId === url._id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleQR(url.shortCode)}
                              className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition cursor-pointer"
                              title="Show QR Code"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Clicks badge */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {url.clicks}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4 text-center">
                          {isExpired ? (
                            <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded bg-red-500/15 text-red-400 border border-red-500/20">
                              Expired
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              Active
                            </span>
                          )}
                        </td>

                        {/* Creation Date */}
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(url.createdAt).toLocaleDateString()}
                        </td>

                        {/* Actions group */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Analytics Button */}
                            <button
                              onClick={() => navigate(`/analytics/${url._id}`)}
                              className="p-2 text-indigo-400 hover:text-white hover:bg-indigo-600 rounded-xl transition cursor-pointer"
                              title="View Analytics"
                            >
                              <BarChart2 className="w-4 h-4" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(url._id)}
                              className="p-2 text-red-400 hover:text-white hover:bg-red-600 rounded-xl transition cursor-pointer"
                              title="Delete Link"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* QR modal popup */}
      <QRModal 
        isOpen={qrOpen} 
        onClose={() => setQrOpen(false)} 
        shortUrl={selectedUrl} 
      />
    </div>
  );
};

export default Dashboard;
