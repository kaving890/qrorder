import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, IconButton, Avatar, Divider, useMediaQuery, useTheme, Tooltip,
} from '@mui/material';
import {
  Dashboard, RestaurantMenu, Receipt, TableBar, Menu as MenuIcon,
  Logout, ChevronLeft, QrCode2,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const DRAWER_W = 240;
const MINI_W = 64;

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
  { label: 'Live Orders', icon: <Receipt />, path: '/admin/orders' },
  { label: 'Menu Manager', icon: <RestaurantMenu />, path: '/admin/menu' },
  { label: 'Tables & QR', icon: <TableBar />, path: '/admin/tables' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawerW = collapsed && !isMobile ? MINI_W : DRAWER_W;

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/admin/login');
  };

  const DrawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#111', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Logo */}
      <Box sx={{ px: collapsed ? 1 : 2.5, py: 3, display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: collapsed ? 'center' : 'space-between' }}>
        {!collapsed && (
          <Box>
            <Typography variant="h6" sx={{ fontFamily: '"Playfair Display",serif', color: '#C8A96E', lineHeight: 1 }}>Kavin G Restaurant</Typography>
            <Typography variant="caption" sx={{ color: '#555' }}>Admin Console</Typography>
          </Box>
        )}
        {!isMobile && (
          <IconButton size="small" onClick={() => setCollapsed(!collapsed)} sx={{ color: '#555', '&:hover': { color: '#C8A96E' } }}>
            {collapsed ? <MenuIcon fontSize="small" /> : <ChevronLeft fontSize="small" />}
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* Nav Items */}
      <List sx={{ px: 1, flex: 1, pt: 2 }}>
        {NAV_ITEMS.map(({ label, icon, path }) => {
          const active = location.pathname === path;
          return (
            <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={collapsed ? label : ''} placement="right">
                <ListItemButton component={Link} to={path} onClick={() => setMobileOpen(false)}
                  sx={{
                    borderRadius: 2, px: collapsed ? 1.5 : 2, py: 1.2,
                    bgcolor: active ? 'rgba(200,169,110,0.12)' : 'transparent',
                    border: active ? '1px solid rgba(200,169,110,0.25)' : '1px solid transparent',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                  }}>
                  <ListItemIcon sx={{ color: active ? '#C8A96E' : '#666', minWidth: collapsed ? 0 : 36 }}>
                    {React.cloneElement(icon, { fontSize: 'small' })}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? '#C8A96E' : '#9E9E9E' }} />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* User & Logout */}
      <Box sx={{ px: 1.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(200,169,110,0.2)', color: '#C8A96E', fontSize: 13, fontWeight: 700 }}>
          {user?.name?.[0]?.toUpperCase()}
        </Avatar>
        {!collapsed && (
          <Box flex={1} overflow="hidden">
            <Typography variant="body2" fontWeight={600} noWrap sx={{ color: '#F5F0E8', fontSize: 13 }}>{user?.name}</Typography>
            <Typography variant="caption" noWrap sx={{ color: '#666' }}>{user?.role}</Typography>
          </Box>
        )}
        <Tooltip title="Logout">
          <IconButton size="small" onClick={handleLogout} sx={{ color: '#555', '&:hover': { color: '#E05C5C' } }}>
            <Logout fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0D0D0D' }}>
      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} PaperProps={{ sx: { width: DRAWER_W, bgcolor: 'transparent' } }}>
          {DrawerContent}
        </Drawer>
      ) : (
        <Box sx={{ width: drawerW, flexShrink: 0, transition: 'width 0.2s' }}>
          <Box sx={{ position: 'fixed', height: '100vh', width: drawerW, transition: 'width 0.2s', overflow: 'hidden' }}>
            {DrawerContent}
          </Box>
        </Box>
      )}

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Mobile Topbar */}
        {isMobile && (
          <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(255,255,255,0.06)', bgcolor: '#111' }}>
            <IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#C8A96E' }}><MenuIcon /></IconButton>
            <Typography variant="h6" sx={{ fontFamily: '"Playfair Display",serif', color: '#C8A96E' }}>La Cucina</Typography>
          </Box>
        )}
        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
