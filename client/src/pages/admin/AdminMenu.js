import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardMedia, Chip, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, Switch, FormControlLabel, CircularProgress, Tooltip,
} from '@mui/material';
import { Add, Edit, Delete, Spa, Whatshot, Star, Refresh } from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../utils/api';

const CATEGORIES = ['Starters', 'Mains', 'Desserts', 'Beverages', 'Specials'];

const defaultForm = {
  name: '', description: '', price: '', category: 'Mains',
  isVegetarian: false, isVegan: false, isSpicy: false,
  preparationTime: 15, isAvailable: true, image: '',
};

const fieldSx = {
  mb: 2,
  '& .MuiInputLabel-root': { color: '#666' },
  '& .MuiOutlinedInput-root': { color: '#F5F0E8', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(200,169,110,0.3)' }, '&.Mui-focused fieldset': { borderColor: '#C8A96E' } },
  '& .MuiSelect-icon': { color: '#666' },
};

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchItems = () => {
    setLoading(true);
    API.get('/menu').then(({ data }) => setItems(data)).catch(() => toast.error('Failed to load menu')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const filtered = filterCat === 'All' ? items : items.filter((i) => i.category === filterCat);

  const openAdd = () => { setEditItem(null); setForm(defaultForm); setDialogOpen(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description, price: item.price, category: item.category, isVegetarian: item.isVegetarian, isVegan: item.isVegan, isSpicy: item.isSpicy, preparationTime: item.preparationTime, isAvailable: item.isAvailable, image: item.image || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.description || !form.price) return toast.error('Fill required fields');
    setSaving(true);
    try {
      if (editItem) {
        await API.put(`/menu/${editItem._id}`, { ...form, price: parseFloat(form.price) });
        toast.success('Item updated');
      } else {
        await API.post('/menu', { ...form, price: parseFloat(form.price) });
        toast.success('Item added');
      }
      setDialogOpen(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/menu/${deleteId}`);
      toast.success('Item deleted');
      setDeleteId(null);
      fetchItems();
    } catch { toast.error('Delete failed'); }
  };

  const handleToggle = async (id) => {
    try {
      await API.patch(`/menu/${id}/toggle`);
      fetchItems();
    } catch { toast.error('Toggle failed'); }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await API.post('/menu/seed');
      toast.success('Sample menu seeded!');
      fetchItems();
    } catch { toast.error('Seed failed'); } finally { setSeeding(false); }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Playfair Display",serif', color: '#F5F0E8' }}>Menu Manager</Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>{items.length} items · {items.filter(i => i.isAvailable).length} available</Typography>
        </Box>
        <Box display="flex" gap={1.5}>
          <Button onClick={handleSeed} disabled={seeding} variant="outlined" size="small"
            sx={{ borderColor: 'rgba(255,255,255,0.1)', color: '#9E9E9E', borderRadius: 2, '&:hover': { borderColor: 'rgba(200,169,110,0.4)', color: '#C8A96E' } }}>
            {seeding ? <CircularProgress size={14} sx={{ color: '#C8A96E' }} /> : '🌱 Seed Sample Menu'}
          </Button>
          <Button onClick={openAdd} variant="contained" startIcon={<Add />}
            sx={{ bgcolor: '#C8A96E', color: '#0D0D0D', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#A8853E' } }}>
            Add Item
          </Button>
        </Box>
      </Box>

      {/* Category Filter */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {['All', ...CATEGORIES].map((cat) => (
          <Chip key={cat} label={cat} onClick={() => setFilterCat(cat)}
            sx={{ bgcolor: filterCat === cat ? '#C8A96E' : 'rgba(255,255,255,0.06)', color: filterCat === cat ? '#0D0D0D' : '#9E9E9E', fontWeight: filterCat === cat ? 700 : 400, cursor: 'pointer', '&:hover': { bgcolor: filterCat === cat ? '#A8853E' : 'rgba(255,255,255,0.1)' } }} />
        ))}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress sx={{ color: '#C8A96E' }} /></Box>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                <Card sx={{ bgcolor: '#161616', border: `1px solid ${item.isAvailable ? 'rgba(255,255,255,0.08)' : 'rgba(224,92,92,0.2)'}`, borderRadius: 3, overflow: 'hidden', height: '100%' }}>
                  <Box sx={{ position: 'relative', height: 140, bgcolor: '#1E1E1E' }}>
                    {item.image && <CardMedia component="img" height="140" image={item.image} alt={item.name} sx={{ objectFit: 'cover', filter: !item.isAvailable ? 'grayscale(0.8) brightness(0.6)' : 'none' }} />}
                    {!item.isAvailable && (
                      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Chip label="Unavailable" size="small" sx={{ bgcolor: 'rgba(224,92,92,0.8)', color: '#fff' }} />
                      </Box>
                    )}
                  </Box>
                  <CardContent sx={{ p: 1.5 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#F5F0E8', flex: 1, pr: 1, lineHeight: 1.3 }}>{item.name}</Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#C8A96E', whiteSpace: 'nowrap' }}>£{item.price.toFixed(2)}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#666', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1 }}>
                      {item.description}
                    </Typography>
                    <Box display="flex" gap={0.5} mb={1} flexWrap="wrap">
                      <Chip label={item.category} size="small" sx={{ bgcolor: 'rgba(200,169,110,0.1)', color: '#C8A96E', height: 18, fontSize: 10 }} />
                      {item.isVegetarian && <Chip icon={<Spa sx={{ fontSize: 10 }} />} label="Veg" size="small" sx={{ bgcolor: 'rgba(76,175,82,0.1)', color: '#4CAF82', height: 18, fontSize: 10, '& .MuiChip-label': { pl: 0.5 } }} />}
                      {item.isSpicy && <Chip icon={<Whatshot sx={{ fontSize: 10 }} />} label="Spicy" size="small" sx={{ bgcolor: 'rgba(224,92,92,0.1)', color: '#E05C5C', height: 18, fontSize: 10, '& .MuiChip-label': { pl: 0.5 } }} />}
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Switch checked={item.isAvailable} onChange={() => handleToggle(item._id)} size="small"
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#4CAF82' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#4CAF82' } }} />
                      <Box>
                        <IconButton size="small" onClick={() => openEdit(item)} sx={{ color: '#9E9E9E', '&:hover': { color: '#C8A96E' }, p: 0.5 }}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => setDeleteId(item._id)} sx={{ color: '#9E9E9E', '&:hover': { color: '#E05C5C' }, p: 0.5 }}><Delete fontSize="small" /></IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: '#F5F0E8', fontFamily: '"Playfair Display",serif' }}>
          {editItem ? 'Edit Menu Item' : 'Add Menu Item'}
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <TextField fullWidth label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} sx={fieldSx} />
          <TextField fullWidth label="Description *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={2} sx={fieldSx} />
          <Box display="flex" gap={2}>
            <TextField label="Price (£) *" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} sx={{ ...fieldSx, flex: 1 }} inputProps={{ min: 0, step: 0.01 }} />
            <TextField label="Prep Time (min)" type="number" value={form.preparationTime} onChange={(e) => setForm({ ...form, preparationTime: e.target.value })} sx={{ ...fieldSx, flex: 1 }} />
          </Box>
          <FormControl fullWidth sx={fieldSx}>
            <InputLabel sx={{ color: '#666' }}>Category *</InputLabel>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} label="Category *"
              sx={{ color: '#F5F0E8', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }}>
              {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField fullWidth label="Image URL (optional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} sx={fieldSx} />
          <Box display="flex" gap={2} flexWrap="wrap">
            {[['isVegetarian', '🌱 Vegetarian'], ['isVegan', '🌿 Vegan'], ['isSpicy', '🌶 Spicy'], ['isAvailable', '✅ Available']].map(([key, label]) => (
              <FormControlLabel key={key} control={<Switch checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} size="small"
                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#C8A96E' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#C8A96E' } }} />}
                label={<Typography variant="body2" sx={{ color: '#9E9E9E' }}>{label}</Typography>} />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#9E9E9E' }}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} variant="contained"
            sx={{ bgcolor: '#C8A96E', color: '#0D0D0D', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#A8853E' } }}>
            {saving ? <CircularProgress size={16} sx={{ color: '#0D0D0D' }} /> : (editItem ? 'Save Changes' : 'Add Item')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs"
        PaperProps={{ sx: { bgcolor: '#161616', border: '1px solid rgba(224,92,92,0.2)', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: '#F5F0E8' }}>Delete Item?</DialogTitle>
        <DialogContent><Typography sx={{ color: '#9E9E9E' }}>This action cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ color: '#9E9E9E' }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" sx={{ bgcolor: '#E05C5C', color: '#fff', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#C04040' } }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
