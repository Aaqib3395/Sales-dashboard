# FlowTech – Employee Sales Performance Dashboard

A full-stack MERN application for tracking employee sales performance, monitoring pipelines, and analyzing weekly/monthly progress. Inspired by the FlowTech CRM design system.

---

## 📸 Features

- **Dashboard** – KPI cards (Total Sales, Deals Closed, Active Leads, Conversion Rate), Sales Trend chart, Pipeline Donut chart, Employee Performance Table, Leaderboard
- **Employees** – Full table with sortable columns, performance indicators, add employee modal, drill-down to employee detail
- **Pipeline** – Kanban board with 4 stages (Hot Leads → Follow-ups → Negotiation → Contracts Signed), drag-to-update status, add deals
- **Reports** – Revenue bar chart, Radar comparison, top performers, full table, CSV export
- **Employee Detail** – Individual revenue history, pipeline breakdown, activity log
- **Filters** – Global time (Weekly / Monthly), Team, and Employee filters
- **Dark Mode** toggle

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS        |
| Charts     | Recharts                            |
| Routing    | React Router DOM v6                 |
| HTTP       | Axios                               |
| Icons      | Lucide React                        |
| Backend    | Node.js, Express 4                  |
| Database   | MongoDB (Mongoose)                  |
| Fonts      | DM Sans, Sora (Google Fonts)        |

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Clone & install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

```bash
# In /backend, copy the example env
cp .env.example .env
```

Edit `.env`:
```
MONGODB_URI=mongodb://localhost:27017/sales_dashboard
PORT=5000
```

### 3. Seed the database

```bash
cd backend
npm run seed
```

This creates **12 employees** and **800 realistic sales records** spanning the last 12 months.

### 4. Start the servers

```bash
# Terminal 1 – Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 – Frontend (http://localhost:5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📁 Project Structure

```
sales-dashboard/
├── backend/
│   ├── models/
│   │   ├── Employee.js        # Employee schema
│   │   └── SalesRecord.js     # Sales record schema
│   ├── routes/
│   │   ├── dashboard.js       # KPIs, trend, pipeline, leaderboard
│   │   ├── employees.js       # CRUD + performance aggregation
│   │   └── sales.js           # Sales records + kanban + export
│   ├── server.js              # Express app entry
│   ├── seed.js                # Database seeder
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/axios.js        # API client with all endpoints
    │   ├── context/
    │   │   └── FilterContext.jsx  # Global filter state
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── TopBar.jsx
    │   │   ├── KPICard.jsx
    │   │   ├── SalesTrendChart.jsx
    │   │   ├── PipelineDonutChart.jsx
    │   │   ├── EmployeeTable.jsx
    │   │   ├── PipelineKanban.jsx
    │   │   └── Filters.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Employees.jsx
    │   │   ├── Pipeline.jsx
    │   │   ├── Reports.jsx
    │   │   ├── EmployeeDetail.jsx
    │   │   └── Settings.jsx
    │   ├── App.jsx             # Router + layout
    │   ├── main.jsx
    │   └── index.css           # Tailwind + custom styles
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🗄️ Data Models

### Employee
```js
{
  name, email, role, team, target,
  phone, hireDate, isActive
}
```

### SalesRecord
```js
{
  employeeId, date, amount,
  status: 'lead' | 'follow-up' | 'negotiation' | 'closed',
  clientName, product, notes, probability
}
```

---

## 🔌 API Endpoints

### Dashboard
| Method | Endpoint                    | Description                  |
|--------|-----------------------------|------------------------------|
| GET    | `/api/dashboard/kpis`       | Total sales, deals, leads, conversion rate |
| GET    | `/api/dashboard/trend`      | Revenue & deals over time    |
| GET    | `/api/dashboard/pipeline`   | Pipeline stage distribution  |
| GET    | `/api/dashboard/leaderboard`| Top employees by revenue     |

### Employees
| Method | Endpoint                       | Description                  |
|--------|--------------------------------|------------------------------|
| GET    | `/api/employees`               | List all employees           |
| GET    | `/api/employees/performance`   | Performance metrics          |
| GET    | `/api/employees/:id`           | Single employee              |
| GET    | `/api/employees/:id/stats`     | Employee stats + history     |
| POST   | `/api/employees`               | Create employee              |
| PUT    | `/api/employees/:id`           | Update employee              |
| DELETE | `/api/employees/:id`           | Soft-delete employee         |

### Sales
| Method | Endpoint               | Description                  |
|--------|------------------------|------------------------------|
| GET    | `/api/sales`           | List all sales records       |
| GET    | `/api/sales/kanban`    | Records grouped by stage     |
| GET    | `/api/sales/export`    | Export records for CSV       |
| POST   | `/api/sales`           | Create sales record          |
| PUT    | `/api/sales/:id`       | Update sales record          |
| PATCH  | `/api/sales/:id/status`| Update stage only            |
| DELETE | `/api/sales/:id`       | Delete sales record          |

---

## 🎨 Design System

| Token         | Value         |
|---------------|---------------|
| Primary       | `#6366f1` (Indigo) |
| Success       | `#22c55e` (Green) |
| Warning       | `#f97316` (Orange) |
| Danger        | `#ef4444` (Red)    |
| Background    | `#f4f6fb`     |
| Card          | `#ffffff`     |
| Font display  | Sora          |
| Font body     | DM Sans       |
| Border radius | 12–16px (xl/2xl) |

---

## 🔧 Deployment Notes

### Backend (Render / Railway / Heroku)
1. Set `MONGODB_URI` to your Atlas connection string
2. Set `NODE_ENV=production`
3. `npm start`

### Frontend (Vercel / Netlify)
1. Set `VITE_API_URL` if deploying separately
2. Update `vite.config.js` proxy → absolute backend URL in `api/axios.js`
3. `npm run build` → deploy `dist/`

---

## 🌐 MongoDB Atlas (Cloud)

Replace `MONGODB_URI` in `.env`:
```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/sales_dashboard?retryWrites=true&w=majority
```

---

Built with ❤️ · FlowTech CRM Dashboard
