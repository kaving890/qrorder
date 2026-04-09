const express = require('express');
const Table = require('../models/Table');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/tables - get all tables
router.get('/', protect, async (req, res) => {
  try {
    const tables = await Table.find({ isActive: true }).populate('currentOrder').sort({ tableNumber: 1 });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tables - create table
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { tableNumber, capacity, location } = req.body;
    const existing = await Table.findOne({ tableNumber });
    if (existing) return res.status(400).json({ message: 'Table already exists.' });

    const table = new Table({ tableNumber, capacity: capacity || 4, location: location || 'Main Hall' });
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    await table.generateQRCode(baseUrl);
    await table.save();
    res.status(201).json(table);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/tables/bulk - create multiple tables
router.post('/bulk', protect, adminOnly, async (req, res) => {
  try {
    const { count, capacity, location } = req.body;
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const tables = [];
    for (let i = 1; i <= count; i++) {
      const existing = await Table.findOne({ tableNumber: i });
      if (!existing) {
        const table = new Table({ tableNumber: i, capacity: capacity || 4, location: location || 'Main Hall' });
        await table.generateQRCode(baseUrl);
        await table.save();
        tables.push(table);
      }
    }
    res.status(201).json({ message: `${tables.length} tables created.`, tables });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/tables/:id/status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!table) return res.status(404).json({ message: 'Table not found.' });
    res.json(table);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/tables/:id - admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Table.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Table deactivated.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
