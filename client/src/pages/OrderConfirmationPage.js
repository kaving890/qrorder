import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Divider, Chip } from '@mui/material';
import { CheckCircle, Receipt, TableRestaurant, AccessTime } from '@mui/icons-material';
import { motion } from 'framer-motion';
import API from '../utils/api';

export default function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const tableNumber = searchParams.get('table');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      API.get(`/orders/${orderId}`)
        .then(({ data }) => setOrder(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#0D0D0D">
      <CircularProgress sx={{ color: '#C8A96E' }} />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0D0D0D', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
        <Box sx={{ bgcolor: '#161616', borderRadius: 4, border: '1px solid rgba(200,169,110,0.3)', p: 4, maxWidth: 420, width: '100%', textAlign: 'center' }}>
          {/* Success Icon */}
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: 1, duration: 0.4 }}>
            <CheckCircle sx={{ fontSize: 72, color: '#4CAF82', mb: 2 }} />
          </motion.div>

          <Typography variant="h4" sx={{ fontFamily: '"Playfair Display",serif', color: '#F5F0E8', mb: 1 }}>
            Order Placed!
          </Typography>
          <Typography sx={{ color: '#9E9E9E', mb: 3 }}>
            Your order has been sent to the kitchen. Sit back and relax!
          </Typography>

          {order && (
            <>
              {/* Order Info Cards */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 3 }}>
                {[
                  { icon: <Receipt sx={{ fontSize: 20, color: '#C8A96E' }} />, label: 'Order', value: order.orderNumber },
                  { icon: <TableRestaurant sx={{ fontSize: 20, color: '#C8A96E' }} />, label: 'Table', value: `#${order.tableNumber}` },
                  { icon: <AccessTime sx={{ fontSize: 20, color: '#C8A96E' }} />, label: 'Est. Time', value: `~${order.estimatedTime} min` },
                  { icon: null, label: 'Total', value: `£${order.total.toFixed(2)}` },
                ].map(({ icon, label, value }) => (
                  <Box key={label} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2, p: 1.5 }}>
                    {icon && <Box sx={{ mb: 0.5 }}>{icon}</Box>}
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>{label}</Typography>
                    <Typography variant="body1" fontWeight={700} sx={{ color: '#F5F0E8' }}>{value}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Items Summary */}
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2, p: 2, mb: 3, textAlign: 'left' }}>
                <Typography variant="caption" sx={{ color: '#9E9E9E', display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1 }}>Items Ordered</Typography>
                {order.items.map((item, i) => (
                  <Box key={i} display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" sx={{ color: '#F5F0E8' }}>{item.quantity}× {item.name}</Typography>
                    <Typography variant="body2" sx={{ color: '#9E9E9E' }}>£{item.subtotal.toFixed(2)}</Typography>
                  </Box>
                ))}
              </Box>

              <Chip label={`Status: ${order.status.toUpperCase()}`} sx={{
                bgcolor: 'rgba(76,175,130,0.15)', color: '#4CAF82',
                border: '1px solid rgba(76,175,130,0.3)', fontWeight: 600, mb: 3,
              }} />
            </>
          )}

          <Box display="flex" flexDirection="column" gap={1.5}>
            <Button component={Link} to={`/order/status/${orderId}`} variant="contained"
              sx={{ bgcolor: '#C8A96E', color: '#0D0D0D', fontWeight: 700, borderRadius: 2, py: 1.5, '&:hover': { bgcolor: '#A8853E' } }}>
              Track Order Status
            </Button>
            <Button component={Link} to={`/menu?table=${tableNumber}`} variant="outlined"
              sx={{ borderColor: 'rgba(200,169,110,0.4)', color: '#C8A96E', borderRadius: 2, py: 1.5, '&:hover': { borderColor: '#C8A96E', bgcolor: 'rgba(200,169,110,0.05)' } }}>
              Order More Items
            </Button>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}
