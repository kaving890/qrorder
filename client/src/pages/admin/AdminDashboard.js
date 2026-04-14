import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Chip, Avatar, Divider } from '@mui/material';
import { Receipt, TableRestaurant, AttachMoney, Pending } from '@mui/icons-material';

import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import API from '../../utils/api';

const STATUS_COLORS = { pending: '#F5A623', confirmed: '#5B9CF6', preparing: '#A78BFA', ready: '#4CAF82', served: '#9E9E9E', cancelled: '#E05C5C' };
const PIE_COLORS = ['#C8A96E', '#5B9CF6', '#4CAF82', '#E05C5C', '#A78BFA'];

const StatCard = ({ icon, label, value, sub, color = '#C8A96E', delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
    <Card sx={{ bgcolor: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Typography>
            <Typography variant="h4" sx={{ color: '#F5F0E8', fontFamily: '"Playfair Display",serif', mt: 0.5, mb: 0.5 }}>{value}</Typography>
            {sub && <Typography variant="caption" sx={{ color: '#666' }}>{sub}</Typography>}
          </Box>
          <Box sx={{ bgcolor: `${color}1a`, borderRadius: 2, p: 1.2, border: `1px solid ${color}33` }}>
            {React.cloneElement(icon, { sx: { color, fontSize: 22 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get('/admin/dashboard'), API.get('/admin/analytics?period=7d')])
      .then(([dashRes, analyticsRes]) => {
        setData(dashRes.data);
        setAnalytics(analyticsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: '#C8A96E' }} />
    </Box>
  );

  const { stats, topItems, recentOrders } = data || {};

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" sx={{ fontFamily: '"Playfair Display",serif', color: '#F5F0E8' }}>Dashboard</Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>Real-time restaurant overview</Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2} mb={3}>
        {[
          { icon: <Receipt />, label: "Today's Orders", value: stats?.todayOrders ?? 0, sub: `${stats?.totalOrders ?? 0} total` },
          { icon: <AttachMoney />, label: "Today's Revenue", value: `£${(stats?.todayRevenue ?? 0).toFixed(2)}`, sub: `Total £${(stats?.totalRevenue ?? 0).toFixed(2)}`, color: '#4CAF82' },
          { icon: <Pending />, label: 'Active Orders', value: stats?.pendingOrders ?? 0, sub: 'Need attention', color: '#F5A623' },
          { icon: <TableRestaurant />, label: 'Occupied Tables', value: stats?.activeTables ?? 0, sub: `${stats?.totalMenuItems ?? 0} menu items`, color: '#5B9CF6' },
        ].map((s, i) => (
          <Grid item xs={6} md={3} key={s.label}>
            <StatCard {...s} delay={i * 0.08} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} mb={3}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ bgcolor: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ color: '#F5F0E8', mb: 2, fontSize: 15, fontWeight: 600 }}>Revenue · Last 7 Days</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics?.revenueByDay || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="_id" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => v ? v.slice(5) : ''} />
                  <YAxis tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v}`} />
                  <RTooltip contentStyle={{ bgcolor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F5F0E8' }}
                    formatter={(v) => [`£${v?.toFixed(2)}`, 'Revenue']} labelFormatter={(l) => `Date: ${l}`} />
                  <Bar dataKey="revenue" fill="#C8A96E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Pie */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ color: '#F5F0E8', mb: 2, fontSize: 15, fontWeight: 600 }}>Sales by Category</Typography>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={analytics?.categoryRevenue || []} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                    dataKey="revenue" nameKey="_id" paddingAngle={3}>
                    {(analytics?.categoryRevenue || []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RTooltip contentStyle={{ bgcolor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F5F0E8' }}
                    formatter={(v) => [`£${v?.toFixed(2)}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
              <Box mt={1}>
                {(analytics?.categoryRevenue || []).slice(0, 4).map((c, i) => (
                  <Box key={c._id} display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <Typography variant="caption" sx={{ color: '#9E9E9E' }}>{c._id}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#F5F0E8', fontWeight: 600 }}>£{c.revenue.toFixed(0)}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Recent Orders */}
        <Grid item xs={12} md={7}>
          <Card sx={{ bgcolor: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ color: '#F5F0E8', mb: 2, fontSize: 15, fontWeight: 600 }}>Recent Orders</Typography>
              {(recentOrders || []).map((order, i) => (
                <Box key={order._id}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" py={1}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(200,169,110,0.1)', color: '#C8A96E', fontSize: 11, fontWeight: 700 }}>
                        T{order.tableNumber}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#F5F0E8', fontSize: 13 }}>{order.orderNumber}</Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>{order.customerName} · {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                      </Box>
                    </Box>
                    <Box textAlign="right">
                      <Chip label={order.status} size="small" sx={{ bgcolor: `${STATUS_COLORS[order.status]}20`, color: STATUS_COLORS[order.status], fontSize: 10, height: 20, fontWeight: 600 }} />
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#C8A96E', mt: 0.3, fontSize: 13 }}>£{order.total.toFixed(2)}</Typography>
                    </Box>
                  </Box>
                  {i < (recentOrders?.length - 1) && <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)' }} />}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Selling Items */}
        <Grid item xs={12} md={5}>
          <Card sx={{ bgcolor: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ color: '#F5F0E8', mb: 2, fontSize: 15, fontWeight: 600 }}>Top Sellers</Typography>
              {(topItems || []).map((item, i) => (
                <Box key={item._id} display="flex" alignItems="center" gap={1.5} mb={1.5}>
                  <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(200,169,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#C8A96E' }}>#{i + 1}</Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#F5F0E8', fontSize: 13 }}>{item.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>{item.category} · £{item.price.toFixed(2)}</Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#4CAF82', fontSize: 13 }}>{item.totalOrders}</Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>orders</Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
