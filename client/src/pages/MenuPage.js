import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardMedia, CardContent, Chip, Badge,
  IconButton, Drawer, Divider, TextField, Button, CircularProgress,
  Fab, Avatar, Collapse, Snackbar,
} from '@mui/material';
import {
  ShoppingCart, Add, Remove, Delete, Close, LocalDining,
  Spa, Whatshot, AccessTime, Star, Search, FilterList,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { useCart } from '../context/CartContext';

const CATEGORIES = ['All', 'Starters', 'Mains', 'Desserts', 'Beverages', 'Specials'];

const CATEGORY_EMOJI = {
  All: '🍽️', Starters: '🥗', Mains: '🍖', Desserts: '🍮', Beverages: '🥂', Specials: '⭐',
};

const FOOD_IMAGES = {
  'Bruschetta al Pomodoro': 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&q=80',
  'Calamari Fritti': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80',
  'Burrata Salad': 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&q=80',
  'Grilled Salmon': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80',
  'Ribeye Steak 300g': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
  'Mushroom Risotto': 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=80',
  'Margherita Pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
  'Spicy Arrabbiata Pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80',
  'Tiramisu': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80',
  'Panna Cotta': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
  'Chocolate Lava Cake': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80',
  'Aperol Spritz': 'https://images.unsplash.com/photo-1558171813-c63af36e78d5?w=400&q=80',
  'Espresso': 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&q=80',
  'Sparkling Water 500ml': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80',
  'Limoncello Cheesecake': 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80',
};

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableNumber = parseInt(searchParams.get('table') || '1');
  const { items: cartItems, addItem, removeItem, updateQuantity, clearCart, setTable, itemCount, subtotal, tax, total } = useCart();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    setTable(tableNumber);
    API.get('/menu?available=true')
      .then(({ data }) => setMenuItems(data))
      .catch(() => toast.error('Failed to load menu'))
      .finally(() => setLoading(false));
  }, [tableNumber, setTable]);

  const filtered = menuItems.filter((item) => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const getCartQty = (id) => cartItems.find((i) => i.menuItemId === id)?.quantity || 0;

  const handleAddItem = (item) => {
    addItem({ menuItemId: item._id, name: item.name, price: item.price });
    toast.success(`${item.name} added!`, { duration: 1500 });
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return toast.error('Cart is empty!');
    setPlacing(true);
    try {
      const { data } = await API.post('/orders', {
        tableNumber,
        customerName: customerName || 'Guest',
        specialInstructions: orderNote,
        items: cartItems.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          specialInstructions: i.specialInstructions || '',
        })),
      });
      clearCart();
      setCartOpen(false);
      navigate(`/order/confirmation?orderId=${data._id}&table=${tableNumber}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0D0D0D', pb: 12 }}>
      {/* Hero Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1a0a00 0%, #0D0D0D 60%)',
        borderBottom: '1px solid rgba(200,169,110,0.2)',
        px: { xs: 2, md: 4 }, pt: 4, pb: 3,
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(20px)',
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="h4" sx={{ color: '#C8A96E', fontFamily: '"Playfair Display",serif', fontWeight: 700, lineHeight: 1 }}>
              Kavin G Restaurant
            </Typography>
            <Typography variant="body2" sx={{ color: '#9E9E9E', mt: 0.5 }}>
              Table {tableNumber} · Fine Italian Dining
            </Typography>
          </Box>
          <Badge badgeContent={itemCount} color="warning" sx={{ '& .MuiBadge-badge': { bgcolor: '#C8A96E', color: '#0D0D0D', fontWeight: 700 } }}>
            <IconButton onClick={() => setCartOpen(true)} sx={{ bgcolor: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.3)', color: '#C8A96E', '&:hover': { bgcolor: 'rgba(200,169,110,0.2)' } }}>
              <ShoppingCart />
            </IconButton>
          </Badge>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth size="small" placeholder="Search dishes..."
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ color: '#666', mr: 1, fontSize: 18 }} />,
            sx: { bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3, color: '#F5F0E8', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } },
          }}
          sx={{ mb: 2 }}
        />

        {/* Category Tabs */}
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={`${CATEGORY_EMOJI[cat]} ${cat}`}
              onClick={() => setActiveCategory(cat)}
              sx={{
                flexShrink: 0,
                bgcolor: activeCategory === cat ? '#C8A96E' : 'rgba(255,255,255,0.06)',
                color: activeCategory === cat ? '#0D0D0D' : '#9E9E9E',
                fontWeight: activeCategory === cat ? 700 : 400,
                border: 'none',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: activeCategory === cat ? '#A8853E' : 'rgba(255,255,255,0.1)' },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Menu Grid */}
      <Box sx={{ px: { xs: 2, md: 4 }, pt: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress sx={{ color: '#C8A96E' }} />
          </Box>
        ) : (
          <Grid container spacing={2}>
            <AnimatePresence>
              {filtered.map((item, idx) => {
                const qty = getCartQty(item._id);
                const imgSrc = FOOD_IMAGES[item.name] || `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80`;
                return (
                  <Grid item xs={12} sm={6} md={4} key={item._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.35 }}
                    >
                      <Card sx={{
                        bgcolor: '#161616', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 3, overflow: 'hidden',
                        transition: 'all 0.2s', cursor: 'pointer',
                        '&:hover': { border: '1px solid rgba(200,169,110,0.3)', transform: 'translateY(-2px)' },
                      }}>
                        <Box sx={{ position: 'relative' }} onClick={() => setExpandedItem(expandedItem === item._id ? null : item._id)}>
                          <CardMedia component="img" height="180" image={imgSrc} alt={item.name}
                            sx={{ objectFit: 'cover', filter: !item.isAvailable ? 'grayscale(1)' : 'none' }} />
                          <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 0.5 }}>
                            {item.isVegetarian && <Chip icon={<Spa sx={{ fontSize: 12 }} />} label="Veg" size="small" sx={{ bgcolor: '#1B5E20', color: '#81C784', height: 22, '& .MuiChip-label': { fontSize: 10, px: 0.5 } }} />}
                            {item.isSpicy && <Chip icon={<Whatshot sx={{ fontSize: 12 }} />} label="Spicy" size="small" sx={{ bgcolor: '#7f1d1d', color: '#f87171', height: 22, '& .MuiChip-label': { fontSize: 10, px: 0.5 } }} />}
                            {item.tags?.includes('chef special') && <Chip icon={<Star sx={{ fontSize: 11 }} />} label="Chef's" size="small" sx={{ bgcolor: 'rgba(200,169,110,0.2)', color: '#C8A96E', height: 22, '& .MuiChip-label': { fontSize: 10, px: 0.5 } }} />}
                          </Box>
                          {!item.isAvailable && (
                            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.6)' }}>
                              <Chip label="Unavailable" sx={{ bgcolor: '#333', color: '#999' }} />
                            </Box>
                          )}
                        </Box>

                        <CardContent sx={{ pb: '12px !important', px: 2, pt: 1.5 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#F5F0E8', lineHeight: 1.2, flex: 1, pr: 1 }}>
                              {item.name}
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#C8A96E', whiteSpace: 'nowrap' }}>
                              £{item.price.toFixed(2)}
                            </Typography>
                          </Box>

                          <Collapse in={expandedItem === item._id}>
                            <Typography variant="caption" sx={{ color: '#9E9E9E', display: 'block', mb: 1 }}>
                              {item.description}
                            </Typography>
                          </Collapse>

                          <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <AccessTime sx={{ fontSize: 13, color: '#666' }} />
                              <Typography variant="caption" sx={{ color: '#666' }}>{item.preparationTime}m</Typography>
                            </Box>

                            {item.isAvailable && (
                              qty === 0 ? (
                                <Button
                                  size="small" variant="contained"
                                  onClick={() => handleAddItem(item)}
                                  startIcon={<Add sx={{ fontSize: 16 }} />}
                                  sx={{ bgcolor: '#C8A96E', color: '#0D0D0D', fontWeight: 700, borderRadius: 2, py: 0.5, minWidth: 90, '&:hover': { bgcolor: '#A8853E' } }}
                                >
                                  Add
                                </Button>
                              ) : (
                                <Box display="flex" alignItems="center" gap={0.5} sx={{ bgcolor: 'rgba(200,169,110,0.1)', borderRadius: 2, border: '1px solid rgba(200,169,110,0.3)', px: 0.5 }}>
                                  <IconButton size="small" onClick={() => updateQuantity(item._id, qty - 1)} sx={{ color: '#C8A96E', p: 0.3 }}><Remove sx={{ fontSize: 16 }} /></IconButton>
                                  <Typography fontWeight={700} sx={{ color: '#C8A96E', minWidth: 20, textAlign: 'center', fontSize: 14 }}>{qty}</Typography>
                                  <IconButton size="small" onClick={() => updateQuantity(item._id, qty + 1)} sx={{ color: '#C8A96E', p: 0.3 }}><Add sx={{ fontSize: 16 }} /></IconButton>
                                </Box>
                              )
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                );
              })}
            </AnimatePresence>
          </Grid>
        )}

        {!loading && filtered.length === 0 && (
          <Box textAlign="center" py={8}>
            <Typography variant="h2" sx={{ fontSize: 48, mb: 2 }}>🍽️</Typography>
            <Typography variant="h6" sx={{ color: '#9E9E9E' }}>No items found</Typography>
          </Box>
        )}
      </Box>

      {/* Cart FAB */}
      {itemCount > 0 && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 200 }}>
          <Button
            onClick={() => setCartOpen(true)}
            sx={{
              bgcolor: '#C8A96E', color: '#0D0D0D', fontWeight: 700, borderRadius: 4,
              px: 4, py: 1.5, fontSize: 16, boxShadow: '0 8px 32px rgba(200,169,110,0.4)',
              '&:hover': { bgcolor: '#A8853E' },
              display: 'flex', alignItems: 'center', gap: 2,
            }}
          >
            <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, px: 1, py: 0.2, fontWeight: 900 }}>{itemCount}</Box>
            View Cart · £{total.toFixed(2)}
          </Button>
        </motion.div>
      )}

      {/* Cart Drawer */}
      <Drawer anchor="bottom" open={cartOpen} onClose={() => setCartOpen(false)}
        PaperProps={{ sx: { bgcolor: '#161616', borderRadius: '24px 24px 0 0', maxHeight: '85vh', border: '1px solid rgba(200,169,110,0.2)' } }}>
        <Box sx={{ px: 2.5, pt: 2.5, pb: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" sx={{ fontFamily: '"Playfair Display",serif', color: '#C8A96E' }}>
              Your Order
            </Typography>
            <IconButton onClick={() => setCartOpen(false)} sx={{ color: '#9E9E9E' }}><Close /></IconButton>
          </Box>

          {/* Cart Items */}
          <Box sx={{ maxHeight: '40vh', overflowY: 'auto', mb: 2 }}>
            {cartItems.map((item) => (
              <Box key={item.menuItemId} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#F5F0E8' }}>{item.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#C8A96E' }}>£{item.price.toFixed(2)} each</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5} sx={{ bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 2, px: 0.5 }}>
                  <IconButton size="small" onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} sx={{ color: '#9E9E9E', p: 0.3 }}><Remove sx={{ fontSize: 15 }} /></IconButton>
                  <Typography sx={{ minWidth: 20, textAlign: 'center', fontWeight: 700, color: '#F5F0E8', fontSize: 14 }}>{item.quantity}</Typography>
                  <IconButton size="small" onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} sx={{ color: '#C8A96E', p: 0.3 }}><Add sx={{ fontSize: 15 }} /></IconButton>
                </Box>
                <Typography variant="body2" fontWeight={700} sx={{ color: '#F5F0E8', minWidth: 52, textAlign: 'right' }}>£{item.subtotal.toFixed(2)}</Typography>
                <IconButton size="small" onClick={() => removeItem(item.menuItemId)} sx={{ color: '#666', '&:hover': { color: '#E05C5C' } }}><Delete sx={{ fontSize: 16 }} /></IconButton>
              </Box>
            ))}
          </Box>

          {/* Customer Name */}
          <TextField fullWidth size="small" label="Your name (optional)" value={customerName}
            onChange={(e) => setCustomerName(e.target.value)} sx={{ mb: 1.5,
              '& .MuiInputLabel-root': { color: '#666' },
              '& .MuiOutlinedInput-root': { color: '#F5F0E8', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(200,169,110,0.4)' } }
            }} />
          <TextField fullWidth size="small" label="Special instructions (optional)" value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)} multiline rows={2}
            sx={{ mb: 2.5,
              '& .MuiInputLabel-root': { color: '#666' },
              '& .MuiOutlinedInput-root': { color: '#F5F0E8', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(200,169,110,0.4)' } }
            }} />

          {/* Totals */}
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2, p: 2, mb: 2.5 }}>
            {[['Subtotal', `£${subtotal.toFixed(2)}`], ['Tax (10%)', `£${tax.toFixed(2)}`]].map(([label, val]) => (
              <Box key={label} display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2" sx={{ color: '#9E9E9E' }}>{label}</Typography>
                <Typography variant="body2" sx={{ color: '#9E9E9E' }}>{val}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.08)' }} />
            <Box display="flex" justifyContent="space-between">
              <Typography fontWeight={700} sx={{ color: '#F5F0E8' }}>Total</Typography>
              <Typography fontWeight={700} sx={{ color: '#C8A96E', fontSize: 18 }}>£{total.toFixed(2)}</Typography>
            </Box>
          </Box>

          <Button fullWidth variant="contained" size="large" onClick={handlePlaceOrder} disabled={placing}
            startIcon={placing ? <CircularProgress size={18} sx={{ color: '#0D0D0D' }} /> : <LocalDining />}
            sx={{ bgcolor: '#C8A96E', color: '#0D0D0D', fontWeight: 700, borderRadius: 3, py: 1.8, fontSize: 16, '&:hover': { bgcolor: '#A8853E' }, '&:disabled': { bgcolor: 'rgba(200,169,110,0.4)' } }}>
            {placing ? 'Placing Order…' : `Place Order · £${total.toFixed(2)}`}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}
