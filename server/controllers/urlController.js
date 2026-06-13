const Url = require('../models/Url');
const useragent = require('useragent');

// Helper to generate a random 6-character short code
const generateShortCode = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// @desc    Create a shortened URL
// @route   POST /api/shorten
// @access  Private
const shorten = async (req, res, next) => {
  try {
    const { longUrl, customAlias, expiresAt } = req.body;
    let shortCode;

    if (customAlias) {
      // Check if custom alias is already taken as shortCode or customAlias
      const existingUrl = await Url.findOne({
        $or: [{ shortCode: customAlias }, { customAlias }]
      });

      if (existingUrl) {
        return res.status(400).json({
          success: false,
          error: 'Custom alias is already taken. Please choose another one.'
        });
      }
      shortCode = customAlias;
    } else {
      // Generate unique short code (with collision avoidance retry loop)
      let attempts = 0;
      let isUnique = false;
      while (!isUnique && attempts < 10) {
        shortCode = generateShortCode();
        const existing = await Url.findOne({
          $or: [{ shortCode }, { customAlias: shortCode }]
        });
        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }
      if (!isUnique) {
        return res.status(500).json({
          success: false,
          error: 'Failed to generate a unique short code. Please try again.'
        });
      }
    }

    const newUrl = await Url.create({
      longUrl,
      shortCode,
      customAlias: customAlias || null,
      user: req.user._id,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    res.status(201).json({
      success: true,
      data: newUrl
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all URLs for logged-in user
// @route   GET /api/urls
// @access  Private
const getUrls = async (req, res, next) => {
  try {
    const urls = await Url.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: urls.length,
      data: urls
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete URL
// @route   DELETE /api/urls/:id
// @access  Private
const deleteUrl = async (req, res, next) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({ success: false, error: 'URL not found' });
    }

    // Check ownership
    if (url.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this URL' });
    }

    await Url.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'URL deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get URL analytics
// @route   GET /api/urls/:id/analytics
// @access  Private
const getAnalytics = async (req, res, next) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({ success: false, error: 'URL not found' });
    }

    // Check ownership
    if (url.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to access these analytics' });
    }

    // Sort visits by timestamp descending (most recent first)
    const sortedVisits = url.visits.sort((a, b) => b.timestamp - a.timestamp);
    const lastVisited = sortedVisits.length > 0 ? sortedVisits[0].timestamp : null;

    res.json({
      success: true,
      data: {
        totalClicks: url.clicks,
        lastVisited,
        visits: sortedVisits
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Redirect short URL to long URL & record analytics
// @route   GET /:shortCode
// @access  Public
const redirect = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    // Search by shortCode or customAlias
    const url = await Url.findOne({
      $or: [{ shortCode }, { customAlias: shortCode }]
    });

    if (!url) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Not Found</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-900 text-white min-h-screen flex items-center justify-center font-sans">
          <div class="max-w-md w-full bg-gray-800 border border-gray-700 p-8 rounded-2xl shadow-2xl text-center backdrop-blur-md">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/50 border border-red-500 text-red-500 mb-6 text-2xl font-bold">!</div>
            <h1 class="text-3xl font-extrabold mb-2 bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">Link Not Found</h1>
            <p class="text-gray-400 mb-8">The shortened link you are trying to visit does not exist or has been deleted.</p>
            <a href="/" class="inline-block w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition duration-200">Go to Home</a>
          </div>
        </body>
        </html>
      `);
    }

    // Check expiration
    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Expired</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-900 text-white min-h-screen flex items-center justify-center font-sans">
          <div class="max-w-md w-full bg-gray-800 border border-gray-700 p-8 rounded-2xl shadow-2xl text-center backdrop-blur-md">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-900/50 border border-amber-500 text-amber-500 mb-6 text-2xl font-bold">⏰</div>
            <h1 class="text-3xl font-extrabold mb-2 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Link Expired</h1>
            <p class="text-gray-400 mb-8">This link had an expiration date set by its creator and is no longer active.</p>
            <a href="/" class="inline-block w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition duration-200">Go to Home</a>
          </div>
        </body>
        </html>
      `);
    }

    // Collect Analytics
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
    const rawUserAgent = req.headers['user-agent'] || 'Unknown';
    const agent = useragent.parse(rawUserAgent);

    // Determine device type
    let device = 'Desktop';
    if (/mobile|android|iphone|ipod|phone|blackberry|opera mini/i.test(rawUserAgent)) {
      device = 'Mobile';
    } else if (/ipad|tablet|playbook|silk/i.test(rawUserAgent)) {
      device = 'Tablet';
    }

    // Push new visit log
    url.visits.push({
      ip: ip.split(',')[0].trim(), // Get client IP if forwarded
      userAgent: agent.toString(),
      device,
      timestamp: new Date()
    });

    // Increment click count
    url.clicks += 1;
    await url.save();

    // Perform redirect
    res.redirect(302, url.longUrl);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  shorten,
  getUrls,
  deleteUrl,
  getAnalytics,
  redirect
};
