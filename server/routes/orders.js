const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders - place an order (public)
router.post('/', async (req, res) => {
  try {
    const { tableNumber, items, customerName, specialInstructions } = req.body;
    if (!tableNumber || !items || items.length === 0) {
      return res.status(400).json({ message: 'Table number and items are required.' });
    }

    // Validate and enrich items
    let subtotal = 0;
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const menuItem = await MenuItem.findById(item.menuItemId);
        if (!menuItem || !menuItem.isAvailable) {
          throw new Error(`Item "${item.name || item.menuItemId}" is unavailable.`);
        }
        const itemSubtotal = menuItem.price * item.quantity;
        subtotal += itemSubtotal;
        menuItem.totalOrders += item.quantity;
        await menuItem.save();
        return {
          menuItem: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions || '',
          subtotal: itemSubtotal,
        };
      })
    );

    const TAX_RATE = 0.1; // 10%
    const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));

    const order = await Order.create({
      tableNumber,
      items: enrichedItems,
      customerName: customerName || 'Guest',
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax,
      total,
      specialInstructions: specialInstructions || '',
      estimatedTime: Math.max(...enrichedItems.map((i) => 15)),
      statusHistory: [{ status: 'pending', timestamp: new Date() }],
    });

    // Update table status
    await Table.findOneAndUpdate({ tableNumber }, { status: 'occupied', currentOrder: order._id });

    const populated = await Order.findById(order._id).populate('items.menuItem', 'name image');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/orders - get all orders (staff/admin)
router.get('/', protect, async (req, res) => {
  try {
    const { status, tableNumber, date, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (tableNumber) filter.tableNumber = Number(tableNumber);
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('items.menuItem', 'name image category'),
      Order.countDocuments(filter),
    ]);
    res.json({ orders, total, pages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem', 'name image category');
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/status - update order status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date(), note: note || '' });

    if (status === 'served' || status === 'cancelled') {
      await Table.findOneAndUpdate(
        { tableNumber: order.tableNumber },
        { status: 'available', currentOrder: null }
      );
    }
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/payment
router.patch('/:id/payment', protect, async (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, paymentMethod },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/orders/table/:tableNumber - get orders for a table
router.get('/table/:tableNumber', async (req, res) => {
  try {
    const orders = await Order.find({
      tableNumber: req.params.tableNumber,
      status: { $nin: ['served', 'cancelled'] },
    }).sort({ createdAt: -1 }).populate('items.menuItem', 'name image');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
