const validator = require('validator');

const validateSignup = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ success: false, error: 'Please provide a valid name' });
  }

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ success: false, error: 'Please provide a valid email address' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ success: false, error: 'Please provide a valid email address' });
  }

  if (!password) {
    return res.status(400).json({ success: false, error: 'Please provide a password' });
  }

  next();
};

const validateShorten = (req, res, next) => {
  const { longUrl, customAlias, expiresAt } = req.body;

  if (!longUrl) {
    return res.status(400).json({ success: false, error: 'Long URL is required' });
  }

  // Automatically prepend protocol if missing
  let normalizedUrl = longUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = 'http://' + normalizedUrl;
  }

  if (!validator.isURL(normalizedUrl, { require_protocol: true })) {
    return res.status(400).json({ success: false, error: 'Invalid URL format' });
  }

  // Update request body with the normalized URL
  req.body.longUrl = normalizedUrl;

  if (customAlias) {
    const aliasRegex = /^[a-zA-Z0-9-_]{3,15}$/;
    if (!aliasRegex.test(customAlias)) {
      return res.status(400).json({
        success: false,
        error: 'Custom alias must be alphanumeric, dashes, or underscores, between 3 to 15 characters'
      });
    }
  }

  if (expiresAt) {
    const expiryDate = new Date(expiresAt);
    if (isNaN(expiryDate.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid expiry date format' });
    }
    if (expiryDate <= new Date()) {
      return res.status(400).json({ success: false, error: 'Expiry date must be in the future' });
    }
  }

  next();
};

module.exports = {
  validateSignup,
  validateLogin,
  validateShorten
};
