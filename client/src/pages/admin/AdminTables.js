import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress,
  Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { Add, QrCode2, Download, Refresh, TableRestaurant, People } from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../utils/api';

const STATUS_CONFIG = {
  available:   { color: '#4CAF82', bg: 'rgba(76,175,130,0.12)', label: 'Available' },
  occupied:    { color: '#F5A623', bg: 'rgba(245,166,35,0.12)', label: 'Occupied' },
  reserved:    { color: '#5B9CF6', bg: 'rgba(91,156,246,0.12)', label: 'Reserved' },
  maintenance: { color: '#E05C5C', bg: 'rgba(224,92,92,0.12)',  label: 'Maintenance' },
};

export default function AdminTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [qrPreview, setQrPreview] = useState(null);
  const [form, setForm] = useState({ tableNumber: '', capacity: 4, location: 'Main Hall' });
  const [bulkForm, setBulkForm] = useState({ count: 10, capacity: 4, location: 'Main Hall' });
  const [saving, setSaving] = useState(false);

  const fetchTables = () => {
    setLoading(true);
    API.get('/tables').then(({ data }) => setTables(data)).catch(() => toast.error('Failed to load tables')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTables(); }, []);

  const handleCreate = async () => {
    if (!form.tableNumber) return toast.error('Table number required');
    setSaving(true);
    try {
      await API.post('/tables', form);
      toast.success(`Table ${form.tableNumber} created with QR code`);
      setCreateOpen(false);
      setForm({ tableNumber: '', capacity: 4, location: 'Main Hall' });
      fetchTables();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create table');
    } finally { setSaving(false); }
  };

  const handleBulkCreate = async () => {
    setSaving(true);
    try {
      const { data } = await API.post('/tables/bulk', bulkForm);
      toast.success(data.message);
      setBulkOpen(false);
      fetchTables();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create tables');
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (tableId, status) => {
    try {
      await API.patch(`/tables/${tableId}/status`, { status });
      fetchTables();
    } catch { toast.error('Failed to update table status'); }
  };

  const available = tables.filter((t) => t.status === 'available').length;
  const occupied = tables.filter((t) => t.status === 'occupied').length;

  const fieldSx = {
    mb: 2,
    '& .MuiInputLabel-root': { color: '#666' },
    '& .MuiOutlinedInput-root': { color: '#F5F0E8', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(200,169,110,0.3)' }, '&.Mui-focused fieldset': { borderColor: '#C8A96E' } },
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Playfair Display",serif', color: '#F5F0E8' }}>Tables & QR Codes</Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            {tables.length} tables · {available} available · {occupied} occupied
          </Typography>
        </Box>
        <Box display="flex" gap={1.5}>
          <Button onClick={() => setBulkOpen(true)} variant="outlined"
            sx={{ borderColor: 'rgba(255,255,255,0.1)', color: '#9E9E9E', borderRadius: 2, '&:hover': { borderColor: 'rgba(200,169,110,0.4)', color: '#C8A96E' } }}>
            Bulk Create
          </Button>
          <Button onClick={() => setCreateOpen(true)} variant="contained" startIcon={<Add />}
            sx={{ bgcolor: '#C8A96E', color: '#0D0D0D', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#A8853E' } }}>
            Add Table
          </Button>
          <IconButton onClick={fetchTables} sx={{ bgcolor: 'rgba(200,169,110,0.1)', color: '#C8A96E', border: '1px solid rgba(200,169,110,0.2)' }}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} mb={3}>
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
          <Grid item xs={6} sm={3} key={status}>
            <Card sx={{ bgcolor: '#161616', border: `1px solid ${cfg.color}20`, borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h4" sx={{ color: '#F5F0E8', fontFamily: '"Playfair Display",serif' }}>
                  {tables.filter((t) => t.status === status).length}
                </Typography>
                <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 11, mt: 0.5 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tables Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress sx={{ color: '#C8A96E' }} /></Box>
      ) : (
        <Grid container spacing={2}>
          {tables.map((table, idx) => {
            const cfg = STATUS_CONFIG[table.status] || STATUS_CONFIG.available;
            return (
              <Grid item xs={6} sm={4} md={3} lg={2} key={table._id}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.03 }}>
                  <Card sx={{ bgcolor: '#161616', border: `1px solid ${cfg.color}25`, borderRadius: 3, textAlign: 'center', overflow: 'hidden' }}>
                    <Box sx={{ bgcolor: cfg.bg, py: 2.5, borderBottom: `1px solid ${cfg.color}20` }}>
                      <TableRestaurant sx={{ fontSize: 36, color: cfg.color, mb: 0.5 }} />
                      <Typography variant="h5" fontWeight={700} sx={{ color: '#F5F0E8', fontFamily: '"Playfair Display",serif' }}>
                        {table.tableNumber}
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 1.5 }}>
                      <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 10, mb: 1 }} />
                      <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} mb={1.5}>
                        <People sx={{ fontSize: 13, color: '#555' }} />
                        <Typography variant="caption" sx={{ color: '#666' }}>{table.capacity} seats</Typography>
                      </Box>
                      <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                        <Select value={table.status} onChange={(e) => handleStatusChange(table._id, e.target.value)}
                          sx={{ fontSize: 11, color: '#9E9E9E', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.08)' }, '& .MuiSelect-icon': { color: '#555' } }}>
                          {Object.entries(STATUS_CONFIG).map(([s, c]) => <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>{c.label}</MenuItem>)}
                        </Select>
                      </FormControl>
                      {table.qrCodeUrl && (
                        <Button fullWidth size="small" variant="outlined" startIcon={<QrCode2 sx={{ fontSize: 14 }} />}
                          onClick={() => setQrPreview(table)}
                          sx={{ borderColor: 'rgba(200,169,110,0.3)', color: '#C8A96E', borderRadius: 1.5, fontSize: 11, py: 0.7, '&:hover': { bgcolor: 'rgba(200,169,110,0.05)' } }}>
                          View QR
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      )}

      {tables.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <TableRestaurant sx={{ fontSize: 64, color: '#333', mb: 2 }} />
          <Typography sx={{ color: '#555', mb: 2 }}>No tables yet. Create some to generate QR codes.</Typography>
          <Button onClick={() => setBulkOpen(true)} variant="contained" sx={{ bgcolor: '#C8A96E', color: '#0D0D0D', fontWeight: 700, borderRadius: 2 }}>
            Bulk Create Tables
          </Button>
        </Box>
      )}

      {/* QR Preview Dialog */}
      <Dialog open={!!qrPreview} onClose={() => setQrPreview(null)} maxWidth="xs"
        PaperProps={{ sx: { bgcolor: '#161616', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: '#F5F0E8', textAlign: 'center', fontFamily: '"Playfair Display",serif' }}>
          Table {qrPreview?.tableNumber} QR Code
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {qrPreview?.qrCodeUrl && (
            <Box sx={{ bgcolor: '#fff', borderRadius: 2, p: 2, display: 'inline-block', mb: 2 }}>
              <img src={qrPreview.qrCodeUrl} alt={`QR Table ${qrPreview.tableNumber}`} style={{ width: 200, height: 200, display: 'block' }} />
            </Box>
          )}
          <Typography variant="body2" sx={{ color: '#9E9E9E', mb: 1 }}>Scan to order from Table {qrPreview?.tableNumber}</Typography>
          <Typography variant="caption" sx={{ color: '#555', wordBreak: 'break-all', display: 'block' }}>{qrPreview?.qrCode}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'center' }}>
          <Button onClick={() => {
            const a = document.createElement('a');
            a.href = qrPreview.qrCodeUrl;
            a.download = `table-${qrPreview.tableNumber}-qr.png`;
            a.click();
          }} variant="contained" startIcon={<Download />}
            sx={{ bgcolor: '#C8A96E', color: '#0D0D0D', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#A8853E' } }}>
            Download QR
          </Button>
          <Button onClick={() => setQrPreview(null)} sx={{ color: '#9E9E9E' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create Single Table Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: '#F5F0E8', fontFamily: '"Playfair Display",serif' }}>Add New Table</DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <TextField fullWidth label="Table Number *" type="number" value={form.tableNumber}
            onChange={(e) => setForm({ ...form, tableNumber: e.target.value })} sx={fieldSx} inputProps={{ min: 1 }} />
          <TextField fullWidth label="Capacity (seats)" type="number" value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })} sx={fieldSx} inputProps={{ min: 1, max: 20 }} />
          <TextField fullWidth label="Location" value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })} sx={fieldSx} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ color: '#9E9E9E' }}>Cancel</Button>
          <Button onClick={handleCreate} disabled={saving} variant="contained"
            sx={{ bgcolor: '#C8A96E', color: '#0D0D0D', fontWeight: 700, borderRadius: 2 }}>
            {saving ? <CircularProgress size={16} sx={{ color: '#0D0D0D' }} /> : 'Create & Generate QR'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Create Dialog */}
      <Dialog open={bulkOpen} onClose={() => setBulkOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: '#F5F0E8', fontFamily: '"Playfair Display",serif' }}>Bulk Create Tables</DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <Typography variant="body2" sx={{ color: '#9E9E9E', mb: 2 }}>Creates tables 1 through N with QR codes. Skips existing tables.</Typography>
          <TextField fullWidth label="Number of Tables" type="number" value={bulkForm.count}
            onChange={(e) => setBulkForm({ ...bulkForm, count: e.target.value })} sx={fieldSx} inputProps={{ min: 1, max: 100 }} />
          <TextField fullWidth label="Default Capacity" type="number" value={bulkForm.capacity}
            onChange={(e) => setBulkForm({ ...bulkForm, capacity: e.target.value })} sx={fieldSx} />
          <TextField fullWidth label="Location" value={bulkForm.location}
            onChange={(e) => setBulkForm({ ...bulkForm, location: e.target.value })} sx={fieldSx} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setBulkOpen(false)} sx={{ color: '#9E9E9E' }}>Cancel</Button>
          <Button onClick={handleBulkCreate} disabled={saving} variant="contained"
            sx={{ bgcolor: '#C8A96E', color: '#0D0D0D', fontWeight: 700, borderRadius: 2 }}>
            {saving ? <CircularProgress size={16} sx={{ color: '#0D0D0D' }} /> : `Create ${bulkForm.count} Tables`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
