import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import { Refresh, CheckCircle, Cancel, Visibility } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../utils/api";

const STATUS_CONFIG = {
  pending: {
    color: "#F5A623",
    bg: "rgba(245,166,35,0.12)",
    label: "Pending",
    next: "confirmed",
  },
  confirmed: {
    color: "#5B9CF6",
    bg: "rgba(91,156,246,0.12)",
    label: "Confirmed",
    next: "preparing",
  },
  preparing: {
    color: "#A78BFA",
    bg: "rgba(167,139,250,0.12)",
    label: "Preparing",
    next: "ready",
  },
  ready: {
    color: "#4CAF82",
    bg: "rgba(76,175,130,0.12)",
    label: "Ready",
    next: "served",
  },
  served: {
    color: "#9E9E9E",
    bg: "rgba(158,158,158,0.12)",
    label: "Served",
    next: null,
  },
  cancelled: {
    color: "#E05C5C",
    bg: "rgba(224,92,92,0.12)",
    label: "Cancelled",
    next: null,
  },
};

const NEXT_LABEL = {
  confirmed: "Confirm",
  preparing: "Start Preparing",
  ready: "Mark Ready",
  served: "Mark Served",
};

function OrderCard({ order, onStatusUpdate }) {
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  const handleAdvance = async () => {
    if (!cfg.next) return;
    setLoading(true);
    try {
      await onStatusUpdate(order._id, cfg.next);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await onStatusUpdate(order._id, "cancelled");
    } finally {
      setLoading(false);
    }
  };

  const elapsed = Math.round((Date.now() - new Date(order.createdAt)) / 60000);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card
        sx={{
          bgcolor: "#161616",
          border: `1px solid ${cfg.color}30`,
          borderRadius: 3,
          mb: 2,
        }}
      >
        <CardContent sx={{ p: 2 }}>
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1.5}
          >
            <Box>
              <Typography
                variant="body1"
                fontWeight={700}
                sx={{ color: "#F5F0E8" }}
              >
                {order.orderNumber}
              </Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>
                Table {order.tableNumber} · {order.customerName} · {elapsed}m
                ago
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={cfg.label}
                size="small"
                sx={{
                  bgcolor: cfg.bg,
                  color: cfg.color,
                  fontWeight: 600,
                  fontSize: 11,
                }}
              />
              <IconButton
                size="small"
                onClick={() => setDetailOpen(true)}
                sx={{ color: "#555", "&:hover": { color: "#C8A96E" } }}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Items Summary */}
          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.03)",
              borderRadius: 1.5,
              p: 1.5,
              mb: 1.5,
            }}
          >
            {order.items.slice(0, 3).map((item, i) => (
              <Typography
                key={i}
                variant="caption"
                sx={{ color: "#9E9E9E", display: "block" }}
              >
                {item.quantity}× {item.name}
              </Typography>
            ))}
            {order.items.length > 3 && (
              <Typography variant="caption" sx={{ color: "#666" }}>
                +{order.items.length - 3} more
              </Typography>
            )}
          </Box>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="body1"
              fontWeight={700}
              sx={{ color: "#C8A96E" }}
            >
              £{order.total.toFixed(2)}
            </Typography>
            {order.status !== "served" && order.status !== "cancelled" && (
              <Box display="flex" gap={1}>
                {order.status !== "cancelled" && order.status !== "served" && (
                  <Tooltip title="Cancel order">
                    <IconButton
                      size="small"
                      onClick={handleCancel}
                      disabled={loading}
                      sx={{ color: "#555", "&:hover": { color: "#E05C5C" } }}
                    >
                      <Cancel fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {cfg.next && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleAdvance}
                    disabled={loading}
                    startIcon={
                      loading ? (
                        <CircularProgress size={12} sx={{ color: "#0D0D0D" }} />
                      ) : (
                        <CheckCircle fontSize="small" />
                      )
                    }
                    sx={{
                      bgcolor: cfg.color,
                      color: "#0D0D0D",
                      fontWeight: 700,
                      borderRadius: 2,
                      fontSize: 11,
                      py: 0.5,
                      "&:hover": { filter: "brightness(0.9)" },
                    }}
                  >
                    {NEXT_LABEL[cfg.next] || cfg.next}
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#161616",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{ color: "#F5F0E8", fontFamily: '"Playfair Display",serif' }}
        >
          {order.orderNumber} — Table {order.tableNumber}
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="caption"
            sx={{ color: "#666", display: "block", mb: 2 }}
          >
            {order.customerName} · {new Date(order.createdAt).toLocaleString()}
          </Typography>
          {order.items.map((item, i) => (
            <Box key={i} mb={1.5}>
              <Box display="flex" justifyContent="space-between">
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: "#F5F0E8" }}
                >
                  {item.quantity}× {item.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "#C8A96E" }}>
                  £{item.subtotal.toFixed(2)}
                </Typography>
              </Box>
              {item.specialInstructions && (
                <Typography variant="caption" sx={{ color: "#666" }}>
                  Note: {item.specialInstructions}
                </Typography>
              )}
            </Box>
          ))}
          <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.06)" }} />
          {[
            ["Subtotal", `£${order.subtotal.toFixed(2)}`],
            ["Tax", `£${order.tax.toFixed(2)}`],
            ["Total", `£${order.total.toFixed(2)}`],
          ].map(([k, v]) => (
            <Box key={k} display="flex" justifyContent="space-between" mb={0.5}>
              <Typography
                variant="body2"
                sx={{
                  color: k === "Total" ? "#F5F0E8" : "#666",
                  fontWeight: k === "Total" ? 700 : 400,
                }}
              >
                {k}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: k === "Total" ? "#C8A96E" : "#666",
                  fontWeight: k === "Total" ? 700 : 400,
                }}
              >
                {v}
              </Typography>
            </Box>
          ))}
          {order.specialInstructions && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                bgcolor: "rgba(245,166,35,0.08)",
                borderRadius: 2,
                border: "1px solid rgba(245,166,35,0.2)",
              }}
            >
              <Typography variant="caption" sx={{ color: "#F5A623" }}>
                Special Instructions: {order.specialInstructions}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDetailOpen(false)}
            sx={{ color: "#9E9E9E" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [autoRefresh] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const params = filterStatus ? `?status=${filterStatus}` : "";
      const { data } = await API.get(`/orders${params}`);
      setOrders(data.orders || []);
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchOrders();
    if (!autoRefresh) return;
    const interval = setInterval(fetchOrders, 20000);
    return () => clearInterval(interval);
  }, [fetchOrders, autoRefresh]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await API.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update order");
    }
  };

  const grouped = orders.reduce((acc, o) => {
    acc[o.status] = acc[o.status] || [];
    acc[o.status].push(o);
    return acc;
  }, {});

  const activeStatuses = ["pending", "confirmed", "preparing", "ready"];
  const activeOrders = orders.filter((o) => activeStatuses.includes(o.status));

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontFamily: '"Playfair Display",serif', color: "#F5F0E8" }}
          >
            Live Orders
          </Typography>
          <Typography variant="body2" sx={{ color: "#666" }}>
            {activeOrders.length} active · auto-refresh{" "}
            {autoRefresh ? "on" : "off"}
          </Typography>
        </Box>
        <Box display="flex" gap={1.5} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel sx={{ color: "#666" }}>Filter Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Filter Status"
              sx={{
                color: "#F5F0E8",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <MenuItem value="">All</MenuItem>
              {Object.keys(STATUS_CONFIG).map((s) => (
                <MenuItem key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton
            onClick={fetchOrders}
            sx={{
              bgcolor: "rgba(200,169,110,0.1)",
              color: "#C8A96E",
              border: "1px solid rgba(200,169,110,0.2)",
            }}
          >
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress sx={{ color: "#C8A96E" }} />
        </Box>
      ) : filterStatus ? (
        <Box>
          <AnimatePresence>
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </AnimatePresence>
          {orders.length === 0 && (
            <Typography sx={{ color: "#555", textAlign: "center", py: 6 }}>
              No orders with this status.
            </Typography>
          )}
        </Box>
      ) : (
        <Grid container spacing={2}>
          {["pending", "confirmed", "preparing", "ready"].map((status) => {
            const cfg = STATUS_CONFIG[status];
            const statusOrders = grouped[status] || [];
            return (
              <Grid item xs={12} sm={6} lg={3} key={status}>
                <Box
                  sx={{
                    bgcolor: "#0F0F0F",
                    borderRadius: 3,
                    border: `1px solid ${cfg.color}20`,
                    p: 1.5,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1.5}
                    px={0.5}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{
                        color: cfg.color,
                        textTransform: "uppercase",
                        fontSize: 11,
                        letterSpacing: 1,
                      }}
                    >
                      {cfg.label}
                    </Typography>
                    <Chip
                      label={statusOrders.length}
                      size="small"
                      sx={{
                        bgcolor: cfg.bg,
                        color: cfg.color,
                        fontWeight: 700,
                        height: 20,
                        fontSize: 11,
                      }}
                    />
                  </Box>
                  <AnimatePresence>
                    {statusOrders.map((order) => (
                      <OrderCard
                        key={order._id}
                        order={order}
                        onStatusUpdate={handleStatusUpdate}
                      />
                    ))}
                  </AnimatePresence>
                  {statusOrders.length === 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#333",
                        display: "block",
                        textAlign: "center",
                        py: 3,
                      }}
                    >
                      No {status} orders
                    </Typography>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
