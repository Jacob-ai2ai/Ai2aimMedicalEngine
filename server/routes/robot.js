const express = require('express');
const router = express.Router();

// Robot API endpoints
router.get('/status', async (req, res) => {
  try {
    res.json({
      status: 'connected',
      message: 'Robot API endpoint',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/commands', async (req, res) => {
  try {
    const { command, data } = req.body;
    
    res.json({
      message: 'Command received',
      command,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
