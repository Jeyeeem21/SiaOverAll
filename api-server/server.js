const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Read Laravel .env file for database configuration
function readLaravelEnv() {
  const envPath = path.join(__dirname, '../backend/.env');
  const envConfig = { ...process.env };
  
  try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const lines = envFile.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=').trim();
        envConfig[key.trim()] = value;
      }
    });
  } catch (error) {
    console.error('Error reading Laravel .env file:', error);
  }
  
  return envConfig;
}

const laravelEnv = readLaravelEnv();
console.log('Laravel Database Config:');
console.log('DB_CONNECTION:', laravelEnv.DB_CONNECTION);
console.log('DB_DATABASE:', laravelEnv.DB_DATABASE);
console.log('DB_HOST:', laravelEnv.DB_HOST);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection setup
let db;
let dbType;

function connectToDatabase() {
  if (laravelEnv.DB_CONNECTION === 'mysql' && laravelEnv.DB_DATABASE) {
    const runningInDocker = fs.existsSync('/.dockerenv');
    const apiDbHost = runningInDocker
      ? (laravelEnv.DB_HOST || 'mysql-server')
      : (laravelEnv.API_DB_HOST || laravelEnv.DB_HOST || '127.0.0.1');
    console.log(`Attempting to connect to MySQL database at ${apiDbHost}:${laravelEnv.DB_PORT || 3306}...`);
    
    const mysqlDb = mysql.createConnection({
      host: apiDbHost,
      port: parseInt(laravelEnv.DB_PORT) || 3306,
      user: laravelEnv.DB_USERNAME || 'root',
      password: laravelEnv.DB_PASSWORD || '',
      database: laravelEnv.DB_DATABASE || 'businesscenter',
      dateStrings: true,
      acquireTimeout: 10000,
      timeout: 10000
    });

    mysqlDb.connect((err) => {
      if (err) {
        console.error('❌ MySQL connection failed:', err.message);
        console.error('API startup stopped. Check API_DB_HOST, MySQL credentials, and that the MySQL container is running.');
        process.exit(1);
      } else {
        console.log('✅ Connected to MySQL database:', laravelEnv.DB_DATABASE);
        db = mysqlDb;
        dbType = 'mysql';
        
        // Test the connection with a simple query
        db.query('SELECT 1', (err, results) => {
          if (err) {
            console.error('❌ MySQL test query failed:', err.message);
            db.end();
            process.exit(1);
          } else {
            console.log('✅ MySQL connection test successful');
          }
        });
      }
    });
    
  } else {
    console.log('📋 Laravel not configured for MySQL, using SQLite...');
    connectToSQLite();
  }
}

function connectToSQLite() {
  const sqlite3 = require('sqlite3').verbose();
  const DB_PATH = path.join(__dirname, '../backend/database/database.sqlite');
  
  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('❌ Error opening SQLite database:', err);
    } else {
      console.log('✅ Connected to SQLite database');
      console.log('📍 Database path:', DB_PATH);
      dbType = 'sqlite';
    }
  });
}

// Initialize database connection
connectToDatabase();

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Database query helper - works with both MySQL and SQLite
function dbQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    if (dbType === 'mysql') {
      db.query(query, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    } else {
      // SQLite
      if (query.toLowerCase().includes('select')) {
        if (query.toLowerCase().includes('limit 1') || query.includes('WHERE') && !query.toLowerCase().includes('order by')) {
          db.get(query, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        } else {
          db.all(query, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
          });
        }
      } else {
        db.run(query, params, function(err) {
          if (err) return reject(err);
          resolve({ insertId: this.lastID, affectedRows: this.changes });
        });
      }
    }
  });
}

// Auth Routes
app.post('/api/login', async (req, res) => {
  const email = typeof req.body.email === 'string'
    ? req.body.email.trim().toLowerCase()
    : '';
  const { password } = req.body;

  try {
    const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
    const user = await dbQuery(query, [email]);
    
    // Handle both MySQL (array) and SQLite (single object) results
    const userData = Array.isArray(user) ? user[0] : user;

    if (!userData) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, userData.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: userData.id, 
        email: userData.email, 
        role: userData.role === 'Customer' ? 'student' : userData.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: userData.id,
        name: userData.full_name || userData.name, // Handle both column names
        email: userData.email,
        role: userData.role === 'Customer' ? 'student' : userData.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/register', async (req, res) => {
  const { name, email, password, student_number, college, department, phone } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const reference_no = 'REF-' + Date.now();

    // Insert user - use available database fields properly
    const userInsertQuery = dbType === 'mysql' 
      ? 'INSERT INTO users (full_name, email, password, phone, role, status, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, "Customer", "active", 0, NOW(), NOW())'
      : 'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, "student", datetime("now"), datetime("now"))';
    
    const userParams = dbType === 'mysql' 
      ? [name, email, hashedPassword, phone]
      : [name, email, hashedPassword];
      
    const userResult = await dbQuery(userInsertQuery, userParams);
    const userId = dbType === 'mysql' ? userResult.insertId : userResult.insertId;

    // Insert student record - contact_number now stored in users.phone
    const studentInsertQuery = dbType === 'mysql'
      ? 'INSERT INTO students (user_id, reference_no, student_number, college, department, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, "pending", NOW(), NOW())'
      : 'INSERT INTO students (user_id, reference_no, student_number, college, department, contact_number, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, "pending", datetime("now"), datetime("now"))';
    
    const studentParams = dbType === 'mysql'
      ? [userId, reference_no, student_number, college, department]
      : [userId, reference_no, student_number, college, department, phone];
      
    await dbQuery(studentInsertQuery, studentParams);

    const token = jwt.sign(
      { id: userId, email, role: 'student' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`✅ New student registered: ${name} (${email}) - Student#: ${student_number}`);
    
    res.status(201).json({
      token,
      user: {
        id: userId,
        name,
        email,
        role: 'student'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message && error.message.includes('UNIQUE') || error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email or student number already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Student Routes
app.get('/api/student/profile', authenticateToken, async (req, res) => {
  try {
    let query;
    if (dbType === 'mysql') {
      query = `
        SELECT u.id, u.full_name as name, u.email, u.phone, u.avatar,
               u.role, u.status, u.email_verified, u.created_at, u.updated_at,
               s.reference_no, s.student_number, s.college, s.department,
               s.contact_number, s.status as student_status, s.verified_at, s.verified_by,
               s.created_at as student_created_at, s.updated_at as student_updated_at
        FROM users u
        JOIN students s ON u.id = s.user_id
        WHERE u.id = ? LIMIT 1
      `;
    } else {
      // SQLite uses the Laravel schema, which stores verification state in
      // email_verified_at and does not have the MySQL-only status columns.
      query = `
        SELECT u.id, u.name, u.email, u.role,
               'active' as status,
               u.email_verified_at,
               u.email_verified_at IS NOT NULL as email_verified,
               u.created_at, u.updated_at,
               s.reference_no, s.student_number, s.college, s.department,
               s.contact_number, s.status as student_status, s.verified_at,
               s.verified_by, s.created_at as student_created_at,
               s.updated_at as student_updated_at
        FROM users u
        LEFT JOIN students s ON u.id = s.user_id
        WHERE u.id = ? LIMIT 1
      `;
    }

    const result = await dbQuery(query, [req.user.id]);
    const profile = Array.isArray(result) ? result[0] : result;

    if (!profile) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update student profile
app.put('/api/student/profile', authenticateToken, async (req, res) => {
  const { full_name, phone, college, department, contact_number } = req.body;
  
  try {
    // Update users table
    const updateUserQuery = dbType === 'mysql' 
      ? 'UPDATE users SET full_name = ?, phone = ?, updated_at = NOW() WHERE id = ?'
      : 'UPDATE users SET name = ?, updated_at = datetime("now") WHERE id = ?';
      
    const userParams = dbType === 'mysql' 
      ? [full_name, phone, req.user.id]
      : [full_name, req.user.id];
      
    await dbQuery(updateUserQuery, userParams);
    
    // Update students table
    const updateStudentQuery = 'UPDATE students SET college = ?, department = ?, contact_number = ?, updated_at = ? WHERE user_id = ?';
    const studentParams = dbType === 'mysql'
      ? [college, department, contact_number, new Date(), req.user.id]
      : [college, department, contact_number, new Date().toISOString(), req.user.id];
      
    await dbQuery(updateStudentQuery, studentParams);
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Upload / update avatar
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  }
});
const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

app.post('/api/student/avatar', authenticateToken, avatarUpload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  try {
    const avatarPath = req.file.path.replace(/\\/g, '/');

    // Delete old avatar file if exists
    const oldQuery = 'SELECT avatar FROM users WHERE id = ?';
    const oldResult = await dbQuery(oldQuery, [req.user.id]);
    const oldUser = Array.isArray(oldResult) ? oldResult[0] : oldResult;
    if (oldUser?.avatar) {
      const oldPath = path.join(__dirname, oldUser.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await dbQuery('UPDATE users SET avatar = ?, updated_at = NOW() WHERE id = ?', [avatarPath, req.user.id]);

    res.json({
      message: 'Avatar updated successfully',
      avatar_url: `http://localhost:3002/${avatarPath}`
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

// Change password
app.put('/api/student/change-password', authenticateToken, async (req, res) => {
  const { current_password, new_password } = req.body;
  
  try {
    // Get current user data
    const getUserQuery = 'SELECT password FROM users WHERE id = ?';
    const userResult = await dbQuery(getUserQuery, [req.user.id]);
    const userData = Array.isArray(userResult) ? userResult[0] : userResult;
    
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const validPassword = await bcrypt.compare(current_password, userData.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);
    
    // Update password
    const updateQuery = dbType === 'mysql' 
      ? 'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?'
      : 'UPDATE users SET password = ?, updated_at = datetime("now") WHERE id = ?';
      
    await dbQuery(updateQuery, [hashedPassword, req.user.id]);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get login activity
app.get('/api/student/login-activity', authenticateToken, async (req, res) => {
  try {
    // For now, return basic info. You can expand this by creating an audit_logs table
    const query = 'SELECT last_login, created_at, updated_at FROM users WHERE id = ?';
    const result = await dbQuery(query, [req.user.id]);
    const userData = Array.isArray(result) ? result[0] : result;
    
    // Mock activity data based on real timestamps
    const activity = [
      {
        id: 1,
        action: 'Login',
        timestamp: userData?.last_login || new Date(),
        ip_address: '127.0.0.1',
        device: 'Chrome on Windows',
        location: 'Local'
      },
      {
        id: 2,
        action: 'Profile Updated',
        timestamp: userData?.updated_at || new Date(),
        ip_address: '127.0.0.1', 
        device: 'Chrome on Windows',
        location: 'Local'
      },
      {
        id: 3,
        action: 'Account Created',
        timestamp: userData?.created_at || new Date(),
        ip_address: '127.0.0.1',
        device: 'Chrome on Windows', 
        location: 'Local'
      }
    ];
    
    res.json(activity);
  } catch (error) {
    console.error('Login activity error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/student/documents', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT sv.id, sv.student_id, sv.document_type, sv.file_path, 
             sv.original_name, sv.mime, sv.size, sv.status, 
             sv.rejection_reason, sv.reviewer_note, sv.reviewed_by, 
             sv.reviewed_at, sv.created_at, sv.updated_at
      FROM student_verifications sv
      JOIN students s ON sv.student_id = s.id
      WHERE s.user_id = ?
      ORDER BY sv.created_at DESC
    `;

    const documents = await dbQuery(query, [req.user.id]);
    res.json(Array.isArray(documents) ? documents : [documents].filter(Boolean));
  } catch (error) {
    console.error('Documents error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/student/upload-document', authenticateToken, upload.single('document'), async (req, res) => {
  const { document_type } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Get student ID
    const studentQuery = 'SELECT id FROM students WHERE user_id = ? LIMIT 1';
    const studentResult = await dbQuery(studentQuery, [req.user.id]);
    const student = Array.isArray(studentResult) ? studentResult[0] : studentResult;

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Insert document record
    const insertQuery = dbType === 'mysql'
      ? 'INSERT INTO student_verifications (student_id, document_type, file_path, original_name, mime, size, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, "pending", NOW(), NOW())'
      : 'INSERT INTO student_verifications (student_id, document_type, file_path, original_name, mime, size, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, "pending", datetime("now"), datetime("now"))';
    
    const result = await dbQuery(insertQuery, [student.id, document_type, file.path, file.originalname, file.mimetype, file.size]);
    const documentId = dbType === 'mysql' ? result.insertId : result.insertId;

    res.json({
      id: documentId,
      message: 'Document uploaded successfully',
      document: {
        id: documentId,
        student_id: student.id,
        document_type: document_type,
        file_path: file.path,
        original_name: file.originalname,
        mime: file.mimetype,
        size: file.size,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Student orders endpoint (real data)
app.get('/api/student/orders', authenticateToken, async (req, res) => {
  try {
    if (dbType === 'mysql') {
      const query = `
        SELECT 
          so.id,
          so.order_number,
          so.document_type,
          so.document_title as item,
          so.quantity,
          so.unit_price,
          so.total_amount,
          so.status,
          'normal' as priority,
          so.payment_status,
          so.payment_method,
          'pickup' as pickup_method,
          NULL as pickup_date,
          NULL as expected_completion_date,
          CASE WHEN so.status = 'completed' THEN so.updated_at ELSE NULL END as completed_at,
          CASE WHEN so.status = 'cancelled' THEN so.cancelled_reason ELSE NULL END as cancelled_reason,
          so.notes,
          so.created_at,
          so.updated_at
        FROM student_orders so
        JOIN students s ON so.student_id = s.id
        WHERE s.user_id = ?
        ORDER BY so.created_at DESC
      `;
      
      const orders = await dbQuery(query, [req.user.id]);
      const ordersList = Array.isArray(orders) ? orders : [orders].filter(Boolean);
      
      // Format orders for frontend
      const formattedOrders = ordersList.map(order => ({
        id: order.id,
        order_number: order.order_number,
        item: order.item,
        document_type: order.document_type,
        quantity: order.quantity,
        unit_price: parseFloat(order.unit_price),
        amount: parseFloat(order.total_amount),
        status: order.status,
        priority: order.priority,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        pickup_method: order.pickup_method,
        pickup_date: order.pickup_date,
        expected_completion: order.expected_completion_date,
        completed_at: order.completed_at,
        cancelled_reason: order.cancelled_reason,
        notes: order.notes,
        created_at: order.created_at,
        updated_at: order.updated_at
      }));
      
      res.json(formattedOrders);
    } else {
      // SQLite fallback with mock data
      const mockOrders = [
        {
          id: 1,
          order_number: 'ORD-001',
          item: 'Transcript of Records',
          status: 'processing',
          amount: 150.00,
          created_at: '2024-01-15',
          expected_completion: '3-5 business days'
        },
        {
          id: 2,
          order_number: 'ORD-002', 
          item: 'Certificate of Enrollment',
          status: 'completed',
          amount: 100.00,
          created_at: '2024-01-12',
          completed_at: '2024-01-14'
        }
      ];
      res.json(mockOrders);
    }
  } catch (error) {
    console.error('Orders error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Dashboard stats
// Dashboard stats
app.get('/api/student/stats', authenticateToken, async (req, res) => {
  try {
    // Get documents count
    const docQuery = `
      SELECT COUNT(*) as count
      FROM student_verifications sv
      JOIN students s ON sv.student_id = s.id
      WHERE s.user_id = ?
    `;
    const docResult = await dbQuery(docQuery, [req.user.id]);
    const docCount = Array.isArray(docResult) ? docResult[0] : docResult;

    // Get student and user status
    const statusQuery = dbType === 'mysql' 
      ? 'SELECT u.status as user_status, u.email_verified, s.status as student_status, s.verified_at FROM users u JOIN students s ON u.id = s.user_id WHERE u.id = ? LIMIT 1'
      : 'SELECT status, verified_at FROM students WHERE user_id = ? LIMIT 1';
      
    const statusResult = await dbQuery(statusQuery, [req.user.id]);
    const status = Array.isArray(statusResult) ? statusResult[0] : statusResult;

    // Get orders count and total spent (MySQL only for now)
    let ordersCount = 0;
    let totalSpent = 0;
    let pendingPayments = 0;
    
    if (dbType === 'mysql') {
      const ordersQuery = `
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(CASE WHEN so.payment_status = 'paid' THEN so.total_amount ELSE 0 END), 0) as total_spent,
          COALESCE(SUM(CASE WHEN so.payment_status = 'unpaid' THEN so.total_amount ELSE 0 END), 0) as pending_payments
        FROM student_orders so
        JOIN students s ON so.student_id = s.id
        WHERE s.user_id = ?
      `;
      const ordersResult = await dbQuery(ordersQuery, [req.user.id]);
      const orders = Array.isArray(ordersResult) ? ordersResult[0] : ordersResult;
      
      ordersCount = orders?.count || 0;
      totalSpent = parseFloat(orders?.total_spent || 0);
      pendingPayments = parseFloat(orders?.pending_payments || 0);
    }

    // Get notifications count (unread)
    let notificationsCount = 0;
    if (dbType === 'mysql') {
      const notifQuery = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_at IS NULL';
      const notifResult = await dbQuery(notifQuery, [req.user.id]);
      const notif = Array.isArray(notifResult) ? notifResult[0] : notifResult;
      notificationsCount = notif?.count || 0;
    }

    res.json({
      documents_count: docCount.count || 0,
      user_status: status?.user_status || 'active',
      email_verified: status?.email_verified || false,
      student_status: status?.student_status || status?.status || 'pending',
      verified_at: status?.verified_at,
      orders_count: ordersCount,
      total_spent: totalSpent,
      pending_payments: pendingPayments,
      notifications_count: notificationsCount,
      // Additional dashboard metrics
      account_completion: status?.student_status === 'approved' && status?.email_verified ? 100 : 70,
      last_activity: new Date().toISOString()
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Student notifications endpoint
app.get('/api/student/notifications', authenticateToken, async (req, res) => {
  try {
    if (dbType === 'mysql') {
      const query = `
        SELECT 
          n.id,
          n.type,
          n.title,
          n.message,
          n.data,
          n.read_at,
          n.is_important,
          n.expires_at,
          n.created_at,
          n.updated_at
        FROM notifications n
        WHERE n.user_id = ?
        ORDER BY n.is_important DESC, n.created_at DESC
      `;
      
      const notifications = await dbQuery(query, [req.user.id]);
      const notificationsList = Array.isArray(notifications) ? notifications : [notifications].filter(Boolean);
      
      res.json(notificationsList.map(notif => ({
        ...notif,
        data: (() => {
          if (!notif.data) return null;
          try {
            return typeof notif.data === 'string' ? JSON.parse(notif.data) : notif.data;
          } catch (error) {
            console.error(`Invalid notification data for notification ${notif.id}:`, error);
            return null;
          }
        })(),
        is_read: notif.read_at !== null,
        time_ago: getTimeAgo(notif.created_at)
      })));
    } else {
      // SQLite fallback with mock data
      res.json([]);
    }
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Mark notification as read
app.put('/api/student/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    if (dbType === 'mysql') {
      const query = `
        UPDATE notifications 
        SET read_at = NOW(), updated_at = NOW()
        WHERE id = ? AND user_id = ?
      `;
      
      await dbQuery(query, [req.params.id, req.user.id]);
      res.json({ success: true });
    } else {
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Helper function for time ago
function getTimeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const diffInMinutes = Math.floor((now - past) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)} hours ago`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  }
}

app.get('/', (req, res) => {
  res.json({
    name: 'Student Account API',
    status: 'OK',
    health: '/api/health'
  });
});

app.get('/api/health', (req, res) => {
  if (dbType !== 'mysql') {
    return res.status(503).json({
      status: 'NOT_READY',
      message: 'MySQL database connection is not ready',
      database: dbType || null,
      database_name: laravelEnv.DB_DATABASE || null
    });
  }

  res.json({ 
    status: 'OK', 
    message: 'Student Account API is running',
    database: dbType,
    database_name: laravelEnv.DB_DATABASE || 'SQLite'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Products API endpoints
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        p.product_id as id,
        p.product_name as name,
        p.description,
        p.price,
        p.cost,
        p.unit,
        p.status,
        p.barcode,
        p.product_image,
        p.image_url,
        p.expiration_date,
        c.category_name as category_name,
        c.category_id as category_id
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.is_active = 1 AND p.status = 'active'
    `;
    
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.is_active = 1 AND p.status = 'active'
    `;
    
    let params = [];
    let countParams = [];
    
    if (category) {
      query += ' AND p.category_id = ?';
      countQuery += ' AND p.category_id = ?';
      params.push(category);
      countParams.push(category);
    }
    
    if (search) {
      query += ' AND (p.product_name LIKE ? OR p.description LIKE ?)';
      countQuery += ' AND (p.product_name LIKE ? OR p.description LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
      countParams.push(searchParam, searchParam);
    }
    
    query += ' ORDER BY p.product_name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const products = await dbQuery(query, params);
    const totalResult = await dbQuery(countQuery, countParams);
    
    const total = Array.isArray(totalResult) ? totalResult[0].total : totalResult.total;
    
    res.json({
      products: Array.isArray(products) ? products : [products].filter(Boolean),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/products/categories', async (req, res) => {
  try {
    // Get categories with product counts using correct column names
    const query = `
      SELECT 
        c.category_id as id,
        c.category_name as name,
        c.description,
        COUNT(p.product_id) as product_count
      FROM categories c 
      LEFT JOIN products p ON c.category_id = p.category_id AND p.is_active = 1 AND p.status = 'active'
      WHERE c.status = 'active'
      GROUP BY c.category_id, c.category_name, c.description
      ORDER BY c.category_name
    `;
    
    const categories = await dbQuery(query);
    res.json(Array.isArray(categories) ? categories : [categories].filter(Boolean));
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        p.product_id as id,
        p.product_name as name,
        p.description,
        p.price,
        p.cost,
        p.unit,
        p.status,
        p.barcode,
        p.product_image,
        p.image_url,
        p.expiration_date,
        p.is_active,
        c.category_name as category_name,
        c.category_id as category_id,
        p.created_at,
        p.updated_at
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.product_id = ? AND p.is_active = 1
      LIMIT 1
    `;
    
    const result = await dbQuery(query, [id]);
    const product = Array.isArray(result) ? result[0] : result;
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Product detail error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Product Order endpoints - Using existing student_orders system
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    console.log('📦 Order creation request received:', JSON.stringify(req.body, null, 2));
    
    const { items, payment_method, notes } = req.body;
    
    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('❌ Validation failed: items array is required');
      return res.status(400).json({ error: 'At least one order item is required' });
    }

    console.log(`✅ Items array validated: ${items.length} item(s)`);

    // Get student info
    const studentQuery = `SELECT id FROM students WHERE user_id = ?`;
    const studentResult = await dbQuery(studentQuery, [req.user.id]);
    const student = Array.isArray(studentResult) ? studentResult[0] : studentResult;
    
    if (!student) {
      console.log('❌ Student not found for user:', req.user.id);
      return res.status(404).json({ error: 'Student profile not found' });
    }

    console.log(`👤 Student found: ${student.id}`);

    // For now, create separate orders for each product (matching existing student_orders structure)
    const createdOrders = [];
    
    for (const item of items) {
      console.log('Processing item:', item);
      
      if (!item.product_id || !item.quantity || item.quantity < 1) {
        console.log('❌ Invalid item data:', item);
        return res.status(400).json({ error: 'Invalid item data: product_id and quantity are required' });
      }

      // Get product details
      const productQuery = `
        SELECT 
          p.product_id as id,
          p.product_name as name,
          p.description,
          p.price,
          p.cost,
          p.unit,
          p.barcode,
          p.status,
          p.is_active,
          p.expiration_date,
          c.category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        WHERE p.product_id = ? AND p.is_active = 1 AND p.status = 'active'
      `;
      
      const productResult = await dbQuery(productQuery, [item.product_id]);
      const product = Array.isArray(productResult) ? productResult[0] : productResult;
      
      if (!product) {
        console.log('❌ Product not found:', item.product_id);
        return res.status(400).json({ error: `Product ID ${item.product_id} not found or unavailable` });
      }

      console.log(`📦 Product found: ${product.name}`);

      // Check expiration
      if (product.expiration_date && new Date(product.expiration_date) < new Date()) {
        return res.status(400).json({ error: `Product '${product.name}' has expired` });
      }

      const unitPrice = parseFloat(product.price);
      const quantity = parseInt(item.quantity);
      const totalAmount = unitPrice * quantity;
      
      // Generate order number
      const orderNumber = 'ORD' + new Date().toISOString().slice(0,10).replace(/-/g,'') + 
                         Math.random().toString(36).substr(2, 5).toUpperCase();

      console.log(`💰 Order totals: ${quantity} × ₱${unitPrice} = ₱${totalAmount}`);

      // Create order using student_orders table structure
      const orderInsertQuery = `
        INSERT INTO student_orders (
          student_id, order_number, document_type, document_title, 
          quantity, unit_price, total_amount, status, priority, 
          payment_status, payment_method, notes, pickup_method,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const orderParams = [
        student.id,
        orderNumber,
        'other',
        product.name,          // just the product name, no description appended
        quantity,
        unitPrice,
        totalAmount,
        'pending',
        'normal',
        'unpaid',
        payment_method || null,
        notes || null,         // null if no notes provided
        'pickup'
      ];
      
      console.log('💾 Creating order in database...');
      const orderResult = await dbQuery(orderInsertQuery, orderParams);
      const orderId = Array.isArray(orderResult) ? orderResult.insertId : orderResult?.insertId;

      console.log(`✅ Order created with ID: ${orderId}`);

      // Create payment record if payment method is provided
      if (payment_method && orderId) {
        const paymentInsertQuery = `
          INSERT INTO payments (
            order_id, payment_method, amount, payment_date, 
            notes, created_at
          ) VALUES (?, ?, ?, NOW(), ?, NOW())
        `;
        
        await dbQuery(paymentInsertQuery, [
          orderId,
          payment_method,
          totalAmount,
          `Payment for product order: ${product.name}`
        ]);
        
        console.log(`💳 Payment record created for order ${orderId}`);
      }

      createdOrders.push({
        id: orderId,
        order_number: orderNumber,
        product_name: product.name,
        quantity: quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'unpaid'
      });
    }

    console.log(`🎉 Successfully created ${createdOrders.length} order(s)`);

    res.status(201).json({
      message: 'Order(s) created successfully',
      orders: createdOrders,
      total_orders: createdOrders.length
    });

  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order', message: error.message });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    // Get student info
    const studentQuery = `SELECT id FROM students WHERE user_id = ?`;
    const studentResult = await dbQuery(studentQuery, [req.user.id]);
    const student = Array.isArray(studentResult) ? studentResult[0] : studentResult;
    
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Get orders from student_orders table
    const query = `
      SELECT 
        so.id,
        so.order_number,
        so.document_type,
        so.document_title as product_name,
        so.quantity,
        so.unit_price,
        so.total_amount,
        so.status,
        so.priority,
        so.payment_status,
        so.payment_method,
        so.payment_reference,
        so.notes,
        so.pickup_method,
        so.pickup_date,
        so.expected_completion_date,
        so.completed_at,
        so.cancelled_reason,
        so.created_at,
        so.updated_at
      FROM student_orders so
      WHERE so.student_id = ?
      ORDER BY so.created_at DESC
    `;
    
    const orders = await dbQuery(query, [student.id]);
    const ordersList = Array.isArray(orders) ? orders : [orders].filter(Boolean);
    
    // Format orders for frontend
    const formattedOrders = ordersList.map(order => ({
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      payment_status: order.payment_status,
      subtotal: parseFloat(order.total_amount), // Use total_amount as subtotal for compatibility
      tax_amount: 0.00,
      discount_amount: 0.00,
      total_amount: parseFloat(order.total_amount),
      payment_method: order.payment_method,
      payment_reference: order.payment_reference,
      notes: order.notes,
      order_date: order.created_at,
      completed_at: order.completed_at,
      cancelled_at: order.status === 'cancelled' ? order.updated_at : null,
      items_count: 1, // Each student_order is one item
      total_quantity: order.quantity,
      // Create items array for compatibility
      items: [{
        id: order.id,
        product_id: null,
        product_name: order.product_name,
        quantity: order.quantity,
        unit_price: parseFloat(order.unit_price),
        total_price: parseFloat(order.total_amount),
        status: order.status,
      }],
      created_at: order.created_at,
      updated_at: order.updated_at,
      // flat fields used by Orders page
      item: order.product_name,
      document_type: order.document_type,
      priority: order.priority,
      pickup_method: order.pickup_method,
      pickup_date: order.pickup_date,
      unit_price: parseFloat(order.unit_price),
      expected_completion: order.expected_completion_date,
      cancelled_reason: order.cancelled_reason,
    }));
    
    res.json(formattedOrders);
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get student info
    const studentQuery = `SELECT id FROM students WHERE user_id = ?`;
    const studentResult = await dbQuery(studentQuery, [req.user.id]);
    const student = Array.isArray(studentResult) ? studentResult[0] : studentResult;
    
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Get specific order from student_orders table
    const query = `
      SELECT 
        so.id,
        so.order_number,
        so.document_type,
        so.document_title as product_name,
        so.quantity,
        so.unit_price,
        so.total_amount,
        so.status,
        so.priority,
        so.payment_status,
        so.payment_method,
        so.payment_reference,
        so.notes,
        so.pickup_method,
        so.pickup_date,
        so.expected_completion_date,
        so.completed_at,
        so.cancelled_reason,
        so.created_at,
        so.updated_at
      FROM student_orders so
      WHERE so.id = ? AND so.student_id = ?
    `;
    
    const result = await dbQuery(query, [id, student.id]);
    const order = Array.isArray(result) ? result[0] : result;
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get payment records
    const paymentsQuery = `
      SELECT 
        payment_id as id, payment_method, amount, reference_number,
        payment_date, processed_by, notes, created_at
      FROM payments 
      WHERE order_id = ?
    `;
    
    const payments = await dbQuery(paymentsQuery, [order.id]);
    const paymentsList = Array.isArray(payments) ? payments : [payments].filter(Boolean);
    
    res.json({
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      payment_status: order.payment_status,
      subtotal: parseFloat(order.total_amount),
      tax_amount: 0.00,
      discount_amount: 0.00,
      total_amount: parseFloat(order.total_amount),
      payment_method: order.payment_method,
      payment_reference: order.payment_reference,
      notes: order.notes,
      order_date: order.created_at,
      completed_at: order.completed_at,
      cancelled_at: order.status === 'cancelled' ? order.updated_at : null,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: [{
        id: order.id,
        product_id: null,
        product_name: order.product_name,
        quantity: order.quantity,
        unit_price: parseFloat(order.unit_price),
        total_price: parseFloat(order.total_amount),
        status: order.status
      }],
      payments: paymentsList.map(payment => ({
        id: payment.id,
        payment_method: payment.payment_method,
        amount: parseFloat(payment.amount),
        reference: payment.reference_number,
        payment_date: payment.payment_date,
        processed_by: payment.processed_by,
        notes: payment.notes,
        created_at: payment.created_at
      })),
      // Legacy fields for backward compatibility
      item: order.product_name,
      document_type: order.document_type,
      priority: order.priority,
      pickup_method: order.pickup_method,
      pickup_date: order.pickup_date,
      expected_completion: order.expected_completion_date,
      cancelled_reason: order.cancelled_reason
    });
  } catch (error) {
    console.error('Order detail error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

app.put('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method, notes, quantity, priority, pickup_method, pickup_date, delivery_address } = req.body;

    // Get student info
    const studentQuery = `SELECT id FROM students WHERE user_id = ?`;
    const studentResult = await dbQuery(studentQuery, [req.user.id]);
    const student = Array.isArray(studentResult) ? studentResult[0] : studentResult;

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Check if order exists and is updatable (pending only)
    const checkQuery = `SELECT id, quantity, unit_price FROM student_orders WHERE id = ? AND student_id = ? AND status = 'pending'`;
    const checkResult = await dbQuery(checkQuery, [id, student.id]);
    const existingOrder = Array.isArray(checkResult) ? checkResult[0] : checkResult;

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found or cannot be updated' });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (quantity !== undefined && quantity > 0) {
      updates.push('quantity = ?');
      params.push(parseInt(quantity));
      // Recalculate total
      updates.push('total_amount = ?');
      params.push(parseFloat(existingOrder.unit_price) * parseInt(quantity));
    }

    if (priority !== undefined) {
      updates.push('priority = ?');
      params.push(priority);
    }

    if (payment_method !== undefined) {
      updates.push('payment_method = ?');
      params.push(payment_method);
    }

    if (pickup_method !== undefined) {
      updates.push('pickup_method = ?');
      params.push(pickup_method);
    }

    if (pickup_date !== undefined) {
      updates.push('pickup_date = ?');
      params.push(pickup_date || null);
    }

    if (delivery_address !== undefined) {
      updates.push('delivery_address = ?');
      params.push(delivery_address);
    }

    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push('updated_at = NOW()');
    params.push(id, student.id);

    const updateQuery = `UPDATE student_orders SET ${updates.join(', ')} WHERE id = ? AND student_id = ?`;
    await dbQuery(updateQuery, params);

    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Order update error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.post('/api/orders/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ error: 'Cancellation reason is required' });
    }
    
    // Get student info
    const studentQuery = `SELECT id FROM students WHERE user_id = ?`;
    const studentResult = await dbQuery(studentQuery, [req.user.id]);
    const student = Array.isArray(studentResult) ? studentResult[0] : studentResult;
    
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Check if order can be cancelled
    const checkQuery = `
      SELECT id FROM student_orders 
      WHERE id = ? AND student_id = ? AND status IN ('pending', 'processing')
    `;
    const checkResult = await dbQuery(checkQuery, [id, student.id]);
    const existingOrder = Array.isArray(checkResult) ? checkResult[0] : checkResult;
    
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found or cannot be cancelled' });
    }

    // Cancel the order
    const updateQuery = `
      UPDATE student_orders 
      SET status = 'cancelled', cancelled_reason = ?, updated_at = NOW()
      WHERE id = ? AND student_id = ?
    `;
    
    await dbQuery(updateQuery, [reason, id, student.id]);
    
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Order cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Student Account API Server running on port ${PORT}`);
  console.log(`� Health check: http://localhost:${PORT}/api/health`);
  
  // Wait a moment for database connection to be established
  setTimeout(() => {
    console.log(`�📊 Database: ${dbType === 'mysql' ? laravelEnv.DB_DATABASE + ' (MySQL)' : 'SQLite'}`);
  }, 1000);
});

// Graceful shutdown
process.on('SIGINT', () => {
  if (db && typeof db.end === 'function') {
    db.end(() => {
      console.log('Database connection closed');
      process.exit(0);
    });
  } else if (db && typeof db.close === 'function') {
    db.close((err) => {
      if (err) {
        console.error(err.message);
      }
      console.log('Database connection closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});