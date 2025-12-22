 🚀 Mini-ERP Management System

A full-stack MERN application for managing employees and inventory with a modern, professional UI featuring real-time search, pagination, and analytics.

🛠️ Tech Stack

Frontend: React 19 + Vite + React Router + TanStack Query  
Backend: Node.js + Express + MongoDB + Mongoose  
Styling: Custom CSS with glassmorphism & animations

✨ Key Features

- Employee Management: CRUD operations, department filtering, real-time search, sortable tables
- Article/Inventory Management: Product tracking, price analytics, profit calculations, bulk operations
- Advanced UI: Dark theme, responsive design, smooth animations, form validation
- Performance: Optimized pagination, server-side search, efficient queries (handles 50,000+ records)

📁 Project Structure


mern/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Employee & Article components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   └── package.json
│
├── server/                 # Express backend
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API endpoints
│   ├── config.env          # Environment variables
│   ├── server.js           # Server entry point
│   ├── generateEmployees.js  # Generate test employees
│   └── generateArticles.js   # Generate test articles
└── README.md


🚀 Quick Start

Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)

Installation

1. Clone the repository
bash
git clone <your-repo-url>
cd mern


2. Setup Backend
bash
cd server
npm install


3. Configure Environment
   - Update `server/config.env` with your MongoDB connection string:
```env
ATLAS_URI=your_mongodb_connection_string_here
PORT=5000
```

4. Setup Frontend
```bash
cd ../client
npm install
```

Running the Application

1. Start Backend (in `server/` directory):
```bash
npm start
```
Server runs on `http://localhost:5000`

2. **Start Frontend** (in `client/` directory):
```bash
npm run dev
```
Client runs on `http://localhost:5173`

### Generate Test Data (Optional)

```bash
cd server

# Generate 500 employees
node generateEmployees.js

# Generate 1,000 articles (quick)
node quickGenerate.js

# Generate 50,000 articles (full dataset)
node generateArticles.js
```

## 📡 API Endpoints

### Employees
- `GET /api/employees` - List employees (with pagination, search, sort)
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/stats` - Get statistics

### Articles
- `GET /api/articles` - List articles (with pagination, search, sort)
- `GET /api/articles/:id` - Get single article
- `POST /api/articles` - Create article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `GET /api/articles/stats` - Get statistics

🎨 Features Showcase

Search & Filter: Real-time search across all fields with debouncing  
Pagination: Configurable items per page (10-250) with smart navigation  
Sorting: Click column headers to sort ascending/descending  
Analytics: Live statistics dashboard with profit margins, inventory value  
Validation: Real-time form validation with helpful error messages  
Responsive: Works seamlessly on desktop, tablet, and mobile

🔧 Configuration

Frontend (`client/vite.config.js`):
- API base URL: `http://localhost:5000`
- Modify for production deployment

Backend (`server/config.env`):
- `ATLAS_URI`: MongoDB connection string
- `PORT`: Server port (default: 5000)

📝 Notes

- The UI features a cyberpunk-inspired design with dark theme and neon accents
- All forms include real-time validation
- Tables support sorting, searching, and pagination
- Optimized for handling large datasets (50,000+ records)
- Backend includes comprehensive error handling and validation

👨‍💻 Author

Built by Ahmad - Full Stack Developer



Need help? Check the code comments or raise an issue!
