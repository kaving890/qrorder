# 🍽️ QR-Based Food Ordering System

A full-stack, production-ready contactless food ordering platform for restaurants. Customers scan a QR code at their table, browse the menu, and place orders — admins manage everything in real-time.

---

## ✨ Features

### Customer Experience
- 📱 **QR Scan → Auto Table Detection** — URL carries table number automatically
- 🍽️ **Beautiful Menu UI** — Category filters, search, dietary badges (veg, spicy, chef's special)
- 🛒 **Smooth Cart** — Add/remove items, quantity control, special instructions
- 💳 **One-tap Ordering** — Instant order submission with confirmation
- 📊 **Live Order Tracking** — Real-time status with auto-refresh every 15 seconds

### Admin Dashboard
- 📈 **Live Dashboard** — Today's orders, revenue, active tables, top sellers
- 📋 **Kanban Order Board** — Orders grouped by status (Pending → Confirmed → Preparing → Ready → Served)
- 🔔 **One-click Status Updates** — Advance order through workflow instantly
- 🍕 **Menu Manager** — Add/edit/delete items, toggle availability, seed sample data
- 🪑 **Table & QR Manager** — Create tables, generate QR codes, bulk creation, download QR PNGs
- 📉 **Revenue Charts** — 7/30/90-day bar charts and category pie charts

---

## 🛠 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, MUI v5, Framer Motion     |
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB (Mongoose ODM)              |
| Auth      | JWT (jsonwebtoken) + bcryptjs       |
| QR Codes  | `qrcode` npm package                |
| Charts    | Recharts                            |
| Toast     | react-hot-toast                     |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- npm

### 1. Clone & Install

```bash
git clone <repo-url>
cd qr-food-ordering

# Install all dependencies
npm run install-all
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

**.env:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/qr_food_ordering
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Seed the Database

```bash
node server/seed.js
```

This creates:
- Admin user: `admin@lacucina.com` / `admin123`
- 10 tables with QR codes generated

### 4. Start Development Servers

```bash
# Runs both Express (port 5000) and React (port 3000)
npm run dev-all
```

Or separately:
```bash
# Terminal 1 — Backend
npm run dev

# Terminal 2 — Frontend
npm run client
```

---

## 📱 Usage

### Customer Flow
1. Scan QR code at table → Opens `http://localhost:3000/menu?table=<N>`
2. Browse menu, filter by category, search items
3. Add items to cart, adjust quantities, add notes
4. Place order → Confirmation page → Live status tracking

### Admin Flow
1. Go to `http://localhost:3000/admin/login`
2. Login with seeded credentials
3. Use **Dashboard** for overview
4. Use **Live Orders** (Kanban) to manage order workflow
5. Use **Menu Manager** to add/edit dishes (click "Seed Sample Menu" for demo data)
6. Use **Tables & QR** to create tables and download QR codes

---

## 📡 API Reference

### Auth
| Method | Endpoint            | Description         |
|--------|---------------------|---------------------|
| POST   | `/api/auth/login`   | Admin login         |
| POST   | `/api/auth/register`| Register staff      |
| GET    | `/api/auth/me`      | Get current user    |

### Menu (Public)
| Method | Endpoint             | Description           |
|--------|----------------------|-----------------------|
| GET    | `/api/menu`          | Get all menu items    |
| GET    | `/api/menu/:id`      | Get single item       |
| POST   | `/api/menu`          | Add item (admin)      |
| PUT    | `/api/menu/:id`      | Edit item (admin)     |
| DELETE | `/api/menu/:id`      | Delete item (admin)   |
| PATCH  | `/api/menu/:id/toggle` | Toggle availability |
| POST   | `/api/menu/seed`     | Seed sample menu      |

### Orders
| Method | Endpoint                     | Description            |
|--------|------------------------------|------------------------|
| POST   | `/api/orders`                | Place order (public)   |
| GET    | `/api/orders`                | List orders (staff)    |
| GET    | `/api/orders/:id`            | Get order details      |
| PATCH  | `/api/orders/:id/status`     | Update status          |
| PATCH  | `/api/orders/:id/payment`    | Update payment         |
| GET    | `/api/orders/table/:num`     | Orders by table        |

### Tables
| Method | Endpoint                | Description           |
|--------|-------------------------|-----------------------|
| GET    | `/api/tables`           | List all tables       |
| POST   | `/api/tables`           | Create table + QR     |
| POST   | `/api/tables/bulk`      | Bulk create tables    |
| PATCH  | `/api/tables/:id/status`| Update table status   |

### Admin
| Method | Endpoint                | Description           |
|--------|-------------------------|-----------------------|
| GET    | `/api/admin/dashboard`  | Dashboard stats       |
| GET    | `/api/admin/analytics`  | Revenue analytics     |

---

## 🗂 Project Structure

```
qr-food-ordering/
├── server/
│   ├── index.js           # Express entry point
│   ├── seed.js            # Database seeder
│   ├── models/
│   │   ├── User.js        # Admin/staff auth
│   │   ├── MenuItem.js    # Menu item schema
│   │   ├── Order.js       # Order + items schema
│   │   └── Table.js       # Table + QR generation
│   ├── routes/
│   │   ├── auth.js
│   │   ├── menu.js
│   │   ├── orders.js
│   │   ├── tables.js
│   │   └── admin.js
│   └── middleware/
│       └── auth.js        # JWT protect + adminOnly
└── client/
    └── src/
        ├── App.js
        ├── context/
        │   ├── AuthContext.js
        │   └── CartContext.js
        ├── utils/api.js
        ├── pages/
        │   ├── MenuPage.js
        │   ├── OrderConfirmationPage.js
        │   ├── OrderStatusPage.js
        │   └── admin/
        │       ├── AdminLogin.js
        │       ├── AdminDashboard.js
        │       ├── AdminOrders.js
        │       ├── AdminMenu.js
        │       └── AdminTables.js
        └── components/
            └── admin/AdminLayout.js
```

---

## 🔮 Production Deployment

### Build Frontend
```bash
cd client && npm run build
```

Set `NODE_ENV=production` in `.env` — Express will serve the React build automatically.

### Deploy Options
- **Railway / Render** — Connect GitHub, set env vars, deploy
- **AWS / DigitalOcean** — PM2 for process management
- **MongoDB Atlas** — Cloud-hosted MongoDB (replace `MONGODB_URI`)

---

## 🛡 Security Notes
- JWT tokens expire in 7 days
- Passwords hashed with bcrypt (salt rounds: 12)
- Admin-only routes protected by middleware
- CORS configured to allow only `CLIENT_URL`

---

## 📄 License
MIT — free to use and modify.
