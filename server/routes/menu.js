const express = require('express');
const MenuItem = require('../models/MenuItem');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/menu - public
router.get('/', async (req, res) => {
  try {
    const { category, available, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (available === 'true') filter.isAvailable = true;
    if (search) filter.$text = { $search: search };
    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/menu/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/menu - admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/menu/:id - admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/menu/:id - admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Menu item deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/menu/:id/toggle - toggle availability
router.patch('/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/menu/seed - seed sample data
router.post('/seed', protect, adminOnly, async (req, res) => {
  try {
    await MenuItem.deleteMany({});
    const sampleMenu = [
      { name: 'Bruschetta al Pomodoro', description: 'Toasted bread with fresh tomatoes, garlic, and basil', price: 8.99, category: 'Starters', isVegetarian: true, preparationTime: 10, tags: ['popular'] },
      { name: 'Calamari Fritti', description: 'Golden fried squid rings with marinara sauce', price: 12.99, category: 'Starters', preparationTime: 12 },
      { name: 'Burrata Salad', description: 'Fresh burrata with heirloom tomatoes and pesto', price: 14.99, category: 'Starters', isVegetarian: true, preparationTime: 5 },
      { name: 'Grilled Salmon', description: 'Atlantic salmon with lemon butter and seasonal veggies', price: 26.99, category: 'Mains', preparationTime: 20 },
      { name: 'Ribeye Steak 300g', description: '28-day aged ribeye with truffle fries and red wine jus', price: 44.99, category: 'Mains', preparationTime: 25, tags: ['chef special'] },
      { name: 'Mushroom Risotto', description: 'Arborio rice with wild mushrooms, parmesan and truffle oil', price: 19.99, category: 'Mains', isVegetarian: true, preparationTime: 22 },
      { name: 'Margherita Pizza', description: 'San Marzano tomato, fresh mozzarella, basil', price: 17.99, category: 'Mains', isVegetarian: true, preparationTime: 18 },
      { name: 'Spicy Arrabbiata Pasta', description: 'Penne with fiery tomato sauce, chilli, and garlic', price: 16.99, category: 'Mains', isVegetarian: true, isSpicy: true, preparationTime: 15 },
      { name: 'Tiramisu', description: 'Classic Italian dessert with mascarpone and espresso', price: 9.99, category: 'Desserts', preparationTime: 5, tags: ['popular'] },
      { name: 'Panna Cotta', description: 'Vanilla panna cotta with berry compote', price: 8.99, category: 'Desserts', isVegetarian: true, preparationTime: 5 },
      { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten centre and vanilla ice cream', price: 10.99, category: 'Desserts', preparationTime: 12 },
      { name: 'Sparkling Water 500ml', description: 'Italian sparkling mineral water', price: 3.99, category: 'Beverages', preparationTime: 1 },
      { name: 'Aperol Spritz', description: 'Aperol, Prosecco, and soda with orange slice', price: 11.99, category: 'Beverages', preparationTime: 3, tags: ['popular'] },
      { name: 'Espresso', description: 'Single shot of premium arabica espresso', price: 3.49, category: 'Beverages', preparationTime: 2 },
      { name: 'Limoncello Cheesecake', description: "Chef's special: lemon curd cheesecake with limoncello glaze", price: 13.99, category: 'Specials', isVegetarian: true, preparationTime: 5, tags: ['chef special'] },
    ];
    const items = await MenuItem.insertMany(sampleMenu);
    res.status(201).json({ message: `${items.length} menu items seeded.`, items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
