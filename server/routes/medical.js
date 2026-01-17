const express = require('express');
const router = express.Router();

// Medical data endpoints
router.get('/patients', async (req, res) => {
  try {
    res.json({
      message: 'Patients endpoint',
      patients: [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/prescriptions', async (req, res) => {
  try {
    res.json({
      message: 'Prescriptions endpoint',
      prescriptions: [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
