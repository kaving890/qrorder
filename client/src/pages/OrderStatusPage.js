import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button, Divider } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked, AccessTime, DinnerDining } from '@mui/icons-material';
import { motion } from 'framer-motion';
import API from '../utils/api';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Received', icon: '📋', desc: 'Your order is in queue' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅', desc: 'Kitchen accepted your order' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', desc: "Chef is preparing your food" },
  { key: 'ready', label: 'Ready', icon: '🔔', desc: 'Your order is ready to serve' },
  { key: 'served', label: 'Served', icon: '🍽️', desc: 'Enjoy your meal!' },
];

const STATUS_INDEX = Object.fromEntries(STATUS_STEPS.map((s, i) => [s.key, i]));

export default function OrderStatusPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = () => {
    API.get(`/orders/${orderId}`)
      .then(({ data }) => setOrder(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [orderId]);

  const currentIdx = order ? (STATUS_INDEX[order.status] ?? 0) : 0;

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#0D0D0D">
      <CircularProgress sx={{ color: '#C8A96E' }} />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0D0D0D', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 6 }}>
      <Box sx={{ maxWidth: 420, width: '100%' }}>
        <Typography variant="h4" sx={{ fontFamily: '"Playfair Display",serif', color: '#C8A96E', mb: 0.5, textAlign: 'center' }}>
          Order Status
        </Typography>
        {order && (
          <Typography sx={{ color: '#9E9E9E', mb: 4, textAlign: 'center' }}>
            {order.orderNumber} · Table {order.tableNumber}
          </Typography>
        )}

        {/* Progress Steps */}
        <Box sx={{ bgcolor: '#161616', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', p: 3, mb: 3 }}>
          {STATUS_STEPS.filter(s => s.key !== 'cancelled').map((step, idx) => {
            const done = idx <= currentIdx;
            const active = idx === currentIdx;
            return (
              <Box key={step.key}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {active ? (
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'rgba(200,169,110,0.15)', border: '2px solid #C8A96E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                          {step.icon}
                        </Box>
                      </motion.div>
                    ) : done ? (
                      <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'rgba(76,175,130,0.15)', border: '2px solid #4CAF82', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle sx={{ fontSize: 18, color: '#4CAF82' }} />
                      </Box>
                    ) : (
                      <Box sx={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, opacity: 0.3 }}>
                        {step.icon}
                      </Box>
                    )}
                  </Box>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={active ? 700 : 500} sx={{ color: active ? '#C8A96E' : done ? '#F5F0E8' : '#555' }}>
                      {step.label}
                    </Typography>
                    {active && <Typography variant="caption" sx={{ color: '#9E9E9E' }}>{step.desc}</Typography>}
                  </Box>
                  {active && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#C8A96E', animation: 'pulse 1s infinite' }} />}
                </Box>
                {idx < STATUS_STEPS.length - 2 && (
                  <Box sx={{ ml: 2.2, width: 2, height: 24, bgcolor: done && idx < currentIdx ? 'rgba(76,175,130,0.4)' : 'rgba(255,255,255,0.06)', my: 0.5 }} />
                )}
              </Box>
            );
          })}
        </Box>

        {/* Order Summary */}
        {order && (
          <Box sx={{ bgcolor: '#161616', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', p: 2.5, mb: 3 }}>
            <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1.5 }}>Items</Typography>
            {order.items.map((item, i) => (
              <Box key={i} display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2" sx={{ color: '#F5F0E8' }}>{item.quantity}× {item.name}</Typography>
                <Typography variant="body2" sx={{ color: '#9E9E9E' }}>£{item.subtotal.toFixed(2)}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />
            <Box display="flex" justifyContent="space-between">
              <Typography fontWeight={700} sx={{ color: '#F5F0E8' }}>Total</Typography>
              <Typography fontWeight={700} sx={{ color: '#C8A96E' }}>£{order.total.toFixed(2)}</Typography>
            </Box>
          </Box>
        )}

        <Box display="flex" gap={1.5}>
          <Button component={Link} to={`/menu?table=${order?.tableNumber}`} fullWidth variant="outlined"
            sx={{ borderColor: 'rgba(200,169,110,0.4)', color: '#C8A96E', borderRadius: 2, py: 1.5, '&:hover': { borderColor: '#C8A96E', bgcolor: 'rgba(200,169,110,0.05)' } }}>
            Order More
          </Button>
          <Button onClick={fetchOrder} fullWidth variant="contained"
            sx={{ bgcolor: '#C8A96E', color: '#0D0D0D', fontWeight: 700, borderRadius: 2, py: 1.5, '&:hover': { bgcolor: '#A8853E' } }}>
            Refresh
          </Button>
        </Box>

        <Typography variant="caption" sx={{ color: '#555', display: 'block', textAlign: 'center', mt: 2 }}>
          Auto-refreshes every 15 seconds
        </Typography>
      </Box>
    </Box>
  );
}
