import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, MousePointerClick, Activity, Monitor, 
  Smartphone, Tablet, Info, Link2, ExternalLink, Globe 
} from 'lucide-react';
import { urlService } from '../services/api';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';

// Chart.js imports & registrations
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Analytics Data
  const [metadata, setMetadata] = useState(null);
  const [analytics, setAnalytics] = useState({ totalClicks: 0, lastVisited: null, visits: [] });

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch URL details from full links list to get metadata
      const urlsRes = await urlService.getUrls();
      const matched = urlsRes.data.find(url => url._id === id);
      if (!matched) {
        toast.error('URL metadata not found');
        navigate('/dashboard');
        return;
      }
      setMetadata(matched);

      // Fetch visits details
      const analyticsRes = await urlService.getUrlAnalytics(id);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load analytics details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    } else {
      fetchAnalytics();
    }
  }, [id, navigate]);

  // Process visits to structure clicks by date for chart input
  const getChartData = () => {
    const visits = analytics.visits || [];
    const dateCounts = {};

    // Group clicks by formatted local date
    visits.forEach(visit => {
      const dateStr = new Date(visit.timestamp).toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric' 
      });
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    });

    // Sort dates chronologically (oldest to newest)
    const sortedDates = Object.keys(dateCounts).reverse();
    const sortedValues = sortedDates.map(date => dateCounts[date]);

    return {
      labels: sortedDates.length > 0 ? sortedDates : ['No Clicks'],
      datasets: [
        {
          label: 'Clicks',
          data: sortedValues.length > 0 ? sortedValues : [0],
          borderColor: '#6366f1', // Indigo-500
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#a855f7', // Purple-500
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7,
        }
      ]
    };
  };

  const getDeviceIcon = (device) => {
    switch(device?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-3.5 h-3.5 mr-1 text-purple-400" />;
      case 'tablet':
        return <Tablet className="w-3.5 h-3.5 mr-1 text-amber-400" />;
      default:
        return <Monitor className="w-3.5 h-3.5 mr-1 text-indigo-400" />;
    }
  };

  const getShortUrl = (code) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5005';
    return `${backendUrl}/${code}`;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#f3f4f6',
        bodyColor: '#e5e7eb',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 }
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
          stepSize: 1,
          precision: 0
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-950 text-white flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const shortCode = metadata?.customAlias || metadata?.shortCode;
  const targetShortUrl = getShortUrl(shortCode);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-950 text-white p-4 sm:p-6 lg:p-8 relative">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header Navigation */}
        <div className="flex items-center space-x-3">
          <Link 
            to="/dashboard" 
            className="p-2 bg-gray-900 border border-gray-800 hover:border-gray-700 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl transition duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Link Analytics
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-0.5">Track your audience metrics and click patterns.</p>
          </div>
        </div>

        {/* Link Metadata Panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Shortened Link</span>
              <div className="flex items-center space-x-2">
                <a 
                  href={targetShortUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xl font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center space-x-1.5"
                >
                  <span>{shortCode}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
            
            <div className="space-y-1 flex-1 lg:max-w-xl">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Destination URL</span>
              <p className="text-gray-300 text-sm truncate font-medium" title={metadata?.longUrl}>
                {metadata?.longUrl}
              </p>
            </div>

            <div className="flex gap-4 sm:gap-8 border-t lg:border-t-0 lg:border-l border-gray-800 pt-4 lg:pt-0 lg:pl-8">
              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Created</span>
                <p className="text-gray-300 text-sm font-semibold mt-1">
                  {new Date(metadata?.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Expiry</span>
                <p className="text-gray-300 text-sm font-semibold mt-1">
                  {metadata?.expiresAt ? new Date(metadata.expiresAt).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex items-center space-x-4 shadow-md">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
              <MousePointerClick className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Total Clicks</p>
              <h3 className="text-2xl font-bold mt-1">{analytics.totalClicks}</h3>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex items-center space-x-4 shadow-md">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Last Visit</p>
              <h3 className="text-sm sm:text-base font-bold mt-1.5 truncate max-w-[170px]">
                {analytics.lastVisited ? new Date(analytics.lastVisited).toLocaleString() : 'No visits yet'}
              </h3>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex items-center space-x-4 shadow-md">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Health Status</p>
              <h3 className="text-base font-bold mt-1.5 text-emerald-400">
                {(metadata?.expiresAt && new Date() > new Date(metadata.expiresAt)) ? 'Expired' : 'Active'}
              </h3>
            </div>
          </div>
        </div>

        {/* Charts & Graphs section */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl">
          <h2 className="text-lg font-bold mb-6 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span>Click Activity Trend</span>
          </h2>
          <div className="h-80 w-full relative">
            {analytics.visits && analytics.visits.length > 0 ? (
              <Line data={getChartData()} options={chartOptions} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                <Info className="w-8 h-8 mb-2 text-gray-600" />
                <p>No visitor charts available yet</p>
                <p className="text-xs text-gray-600 mt-0.5">Visits will display here once the link is shared and clicked.</p>
              </div>
            )}
          </div>
        </div>

        {/* Visits History logs */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 flex items-center space-x-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-lg">Recent Visits Log</h2>
          </div>

          {analytics.visits && analytics.visits.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p className="text-sm">No visitor logs recorded for this link yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-950 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-800">
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">IP Address</th>
                    <th className="px-6 py-4">Device</th>
                    <th className="px-6 py-4">User Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-sm">
                  {analytics.visits.map((visit) => (
                    <tr key={visit._id} className="hover:bg-gray-800/20 transition duration-150">
                      <td className="px-6 py-4 text-gray-300 font-medium">
                        {new Date(visit.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-400 font-mono">
                        {visit.ip}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-800 border border-gray-700 text-gray-300 capitalize">
                          {getDeviceIcon(visit.device)}
                          <span>{visit.device}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 truncate max-w-[320px]" title={visit.userAgent}>
                        {visit.userAgent}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
