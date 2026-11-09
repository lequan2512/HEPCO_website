require('dotenv').config();
const express = require('express');
const cors = require('cors');
// db import moved below

// Import routes
const healthRoutes = require('./routes/health.routes');
const uploadRoutes = require('./routes/upload.routes');
const path = require('path');
const newsRoutes = require('./routes/news.routes');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const ipRoutes = require('./routes/ip.routes');
const bannerRoutes = require('./routes/banner.routes');
const deviceRoutes = require('./routes/device.routes');
const departmentRoutes = require('./routes/department.routes');
const employeeRoutes = require('./routes/employee.routes');
const supplierRoutes = require('./routes/supplier.routes');
const assignmentRoutes = require('./routes/assignment.routes');
const baseOfficeRoutes = require('./routes/baseOffice.routes');
const posRoutes = require('./routes/pos.routes');
const posPaperRoutes = require('./routes/posPaper.routes');


const app = express();
const PORT = process.env.PORT || 3000;

// Trust only explicitly configured proxy addresses or Express proxy ranges.
app.set('trust proxy', process.env.TRUST_PROXY ? process.env.TRUST_PROXY.split(',').map((value) => value.trim()).filter(Boolean) : false);
app.use(cors());
app.use(express.json({ limit: '1mb' }));
if (process.env.UPLOAD_STORAGE === 'local' && !process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  app.use('/api/media', express.static(require('./constants/upload').LOCAL_MEDIA_DIRECTORY, { setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff') }));
}

app.get('/', (req, res) => {
  res.send('HEPCO API is running and connected to MySQL!');
});

const { prisma } = require('./db');

// Serve static files
app.use(express.static(path.join(__dirname, '../../public')));

// Middleware xác thực JWT
const authMiddleware = require('./middlewares/auth.middleware');

// Public routes (Không yêu cầu Token)
app.use('/api', authRoutes); // POST /api/login
app.use('/api/health', healthRoutes);
app.use('/api/showcase', require('./routes/showcase.routes'));
app.use('/api/news', newsRoutes); // GET public, POST/PUT/DELETE yêu cầu token
app.use('/api/banner', bannerRoutes); // GET public, POST/DELETE yêu cầu token

// Protected routes (Bắt buộc xác thực Bearer Token)
app.use('/api/users', authMiddleware.verifyToken, userRoutes);
app.use('/api/ip', authMiddleware.verifyToken, ipRoutes);
app.use('/api/upload', authMiddleware.verifyToken, uploadRoutes);
app.use('/api/devices', authMiddleware.verifyToken, deviceRoutes);
app.use('/api/departments', authMiddleware.verifyToken, departmentRoutes);
app.use('/api/employees', authMiddleware.verifyToken, employeeRoutes);
app.use('/api/suppliers', authMiddleware.verifyToken, supplierRoutes);
app.use('/api/assignments', authMiddleware.verifyToken, assignmentRoutes);
app.use('/api/base-office', authMiddleware.verifyToken, baseOfficeRoutes);
app.use('/api/pos', authMiddleware.verifyToken, posRoutes);
app.use('/api/pos-paper', authMiddleware.verifyToken, posPaperRoutes);



const errorHandler = require('./middlewares/errorHandler');

prisma.$connect().then(() => {
  console.log('Kết nối database MySQL thành công với Prisma!');
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  }
}).catch(err => {
  console.error('Không thể khởi chạy Server do lỗi kết nối Database:', err.message);
});

// Error handling middleware MUST be the last middleware
app.use(errorHandler);

module.exports = app;

