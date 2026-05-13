import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CircularProgress, 
  Select, MenuItem, FormControl, InputLabel, Avatar
} from '@mui/material';
import {
  TrendingUp,  AttachMoney, ShoppingBag,  EmojiEvents
} from '@mui/icons-material';
import {
   XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion'
import API from '../../utils/api';

const COLORS = ['#C8A96E', '#5B9CF6', '#4CAF82', '#E05C5C', '#A78BFA', '#F5A623'];

const StatCard = ({ icon, label, value, sub, color = '#C8A96E', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
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

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get(`/admin/analytics?period=${period}`)
      .then((res) => {
        setData(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  if (loading && !data) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress sx={{ color: '#C8A96E' }} />
    </Box>
  );

  const { revenueByDay, categoryRevenue, topSellers } = data || {};

  const totalRevenue = revenueByDay?.reduce((sum, d) => sum + d.revenue, 0) || 0;
  const totalOrders = revenueByDay?.reduce((sum, d) => sum + d.orders, 0) || 0;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Playfair Display",serif', color: '#F5F0E8' }}>Sales Analysis</Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>Deep dive into your restaurant's performance</Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ color: '#666' }}>Period</InputLabel>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            label="Period"
            sx={{
              color: '#F5F0E8',
              bgcolor: '#161616',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days (This Month)</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={2} mb={4}>
        {[
          { icon: <AttachMoney />, label: "Period Revenue", value: `£${totalRevenue.toFixed(2)}`, sub: "Total sales in period" },
          { icon: <ShoppingBag />, label: "Total Orders", value: totalOrders, sub: "Total checkouts", color: '#5B9CF6' },
          { icon: <TrendingUp />, label: "Avg. Order Value", value: `£${(totalRevenue / (totalOrders || 1)).toFixed(2)}`, sub: "Average per customer", color: '#4CAF82' },
          { icon: <EmojiEvents />, label: "Top Food Item", value: topSellers?.[0]?.name || 'N/A', sub: "Best performing dish", color: '#F5A623' },
        ].map((s, i) => (
          <Grid item xs={6} md={3} key={s.label}>
            <StatCard {...s} delay={i * 0.1} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Highly Sold Foods */}
        <Grid item xs={12} md={5}>
          <Card sx={{ bgcolor: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                <Box sx={{ bgcolor: 'rgba(200,169,110,0.1)', p: 1, borderRadius: 1.5 }}>
                  <EmojiEvents sx={{ color: '#C8A96E' }} />
                </Box>
                <Typography variant="h6" sx={{ color: '#F5F0E8', fontWeight: 600 }}>Highly Sold Foods</Typography>
              </Box>
              
              <Box>
                {topSellers?.map((item, i) => (
                  <Box key={item._id} sx={{ mb: 2.5 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: i < 3 ? 'rgba(200,169,110,0.2)' : 'rgba(255,255,255,0.03)', color: i < 3 ? '#C8A96E' : '#666', fontSize: 13, fontWeight: 700, border: i < 3 ? '1px solid rgba(200,169,110,0.3)' : '1px solid transparent' }}>
                          {i + 1}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ color: '#F5F0E8' }}>{item.name}</Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>{item.totalQuantity} units sold</Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#C8A96E' }}>£{item.revenue.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 4, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.totalQuantity / topSellers[0].totalQuantity) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                        style={{ height: '100%', backgroundColor: i < 3 ? '#C8A96E' : '#444', borderRadius: 2 }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Trend */}
        <Grid item xs={12} md={7}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ bgcolor: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ color: '#F5F0E8', mb: 4, fontSize: 16, fontWeight: 600 }}>Revenue Trend</Typography>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={revenueByDay}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C8A96E" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#C8A96E" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#555', fontSize: 11 }} tickFormatter={(v) => v.split('-').slice(1).join('/')} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#555', fontSize: 11 }} tickFormatter={(v) => `£${v}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#F5F0E8' }}
                        itemStyle={{ color: '#C8A96E' }}
                        formatter={(v) => [`£${v.toFixed(2)}`, 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#C8A96E" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ bgcolor: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ color: '#F5F0E8', mb: 3, fontSize: 16, fontWeight: 600 }}>Category Share</Typography>
                  <Grid container alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={categoryRevenue}
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="revenue"
                            stroke="none"
                          >
                            {categoryRevenue?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#F5F0E8' }}
                            formatter={(v) => [`£${v.toFixed(2)}`, 'Revenue']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        {categoryRevenue?.map((c, i) => (
                          <Box key={c._id} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                              <Typography variant="caption" sx={{ color: '#9E9E9E' }}>{c._id}</Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: '#F5F0E8', fontWeight: 600 }}>
                              {((c.revenue / totalRevenue) * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
