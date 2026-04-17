import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = {
    mb: 2,
    '& .MuiInputLabel-root': { color: '#666' },
    '& .MuiOutlinedInput-root': {
      color: '#F5F0E8', bgcolor: 'rgba(255,255,255,0.04)',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
      '&:hover fieldset': { borderColor: 'rgba(200,169,110,0.4)' },
      '&.Mui-focused fieldset': { borderColor: '#C8A96E' },
    },
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 400 }}>
        <Box textAlign="center" mb={4}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <LockOutlined sx={{ color: '#C8A96E', fontSize: 28 }} />
          </Box>
          <Typography variant="h4" sx={{ fontFamily: '"Playfair Display",serif', color: '#F5F0E8' }}>Admin Portal</Typography>
          <Typography sx={{ color: '#9E9E9E', mt: 0.5, fontSize: 14 }}>Kavin G Restaurant System</Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ bgcolor: '#161616', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', p: 4 }}>
          <TextField fullWidth label="Email Address" type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required sx={fieldSx} />
          <TextField fullWidth label="Password" type={showPass ? 'text' : 'password'} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} required sx={fieldSx}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPass(!showPass)} edge="end" sx={{ color: '#666' }}>
                    {showPass ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }} />

          <Button fullWidth type="submit" variant="contained" size="large" disabled={loading}
            sx={{ bgcolor: '#C8A96E', color: '#0D0D0D', fontWeight: 700, borderRadius: 2, py: 1.8, mt: 1, fontSize: 16, '&:hover': { bgcolor: '#A8853E' }, '&:disabled': { bgcolor: 'rgba(200,169,110,0.4)' } }}>
            {loading ? <CircularProgress size={22} sx={{ color: '#0D0D0D' }} /> : 'Sign In'}
          </Button>

          <Box sx={{ mt: 2.5, p: 2, bgcolor: 'rgba(200,169,110,0.05)', borderRadius: 2, border: '1px solid rgba(200,169,110,0.1)' }}>
            <Typography variant="caption" sx={{ color: '#666', display: 'block', textAlign: 'center' }}>
              Demo credentials: admin@gmail.com / admin123
            </Typography>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}
