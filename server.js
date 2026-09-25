const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '100mb', extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

let pool;

async function initializeDatabase() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wifi_complaints',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const connection = await pool.getConnection();
    console.log('✓ MySQL (XAMPP) database connected');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS complaints (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        primaryPhone VARCHAR(20) NOT NULL,
        secondaryPhone VARCHAR(20),
        contractNumber VARCHAR(100) NOT NULL,
        landlinePhone VARCHAR(20) NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        address VARCHAR(255),
        videoFile VARCHAR(255),
        timestamp DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_timestamp (timestamp),
        INDEX idx_contractNumber (contractNumber)
      )
    `);
    console.log('✓ Database table created/verified');

    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
}

(async () => {
  try {
    await initializeDatabase();

    // Submit complaint
    app.post('/api/complaints/submit', upload.single('videoFile'), async (req, res) => {
      let connection;
      try {
        connection = await pool.getConnection();
        
        const complaint = {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          primaryPhone: req.body.primaryPhone,
          secondaryPhone: req.body.secondaryPhone || null,
          contractNumber: req.body.contractNumber,
          landlinePhone: req.body.landlinePhone,
          latitude: parseFloat(req.body.latitude) || null,
          longitude: parseFloat(req.body.longitude) || null,
          address: req.body.address || null,
          videoFile: req.file ? req.file.filename : null,
          timestamp: new Date(req.body.timestamp)
        };

        const [result] = await connection.execute(
          `INSERT INTO complaints (firstName, lastName, primaryPhone, secondaryPhone, contractNumber, landlinePhone, latitude, longitude, address, videoFile, timestamp) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [complaint.firstName, complaint.lastName, complaint.primaryPhone, complaint.secondaryPhone, complaint.contractNumber, complaint.landlinePhone, complaint.latitude, complaint.longitude, complaint.address, complaint.videoFile, complaint.timestamp]
        );

        res.json({
          success: true,
          message: 'Complaint submitted successfully',
          complaintId: result.insertId
        });
      } catch (error) {
        console.error('Error submitting complaint:', error);
        res.status(500).json({
          success: false,
          message: 'Error submitting complaint',
          error: error.message
        });
      } finally {
        if (connection) connection.release();
      }
    });

    // Get all complaints
    app.get('/api/complaints/all', async (req, res) => {
      let connection;
      try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT * FROM complaints ORDER BY timestamp DESC');
        res.json({
          success: true,
          complaints: rows
        });
      } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({
          success: false,
          message: 'Error fetching complaints',
          error: error.message
        });
      } finally {
        if (connection) connection.release();
      }
    });

    // Get complaint by ID
    app.get('/api/complaints/:id', async (req, res) => {
      let connection;
      try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT * FROM complaints WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Complaint not found'
          });
        }
        res.json({
          success: true,
          complaint: rows[0]
        });
      } catch (error) {
        console.error('Error fetching complaint:', error);
        res.status(500).json({
          success: false,
          message: 'Error fetching complaint',
          error: error.message
        });
      } finally {
        if (connection) connection.release();
      }
    });

    // Get complaints count
    app.get('/api/complaints/count', async (req, res) => {
      let connection;
      try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM complaints');
        res.json({
          success: true,
          count: rows[0].count
        });
      } catch (error) {
        console.error('Error fetching complaints count:', error);
        res.status(500).json({
          success: false,
          message: 'Error fetching complaints count',
          error: error.message
        });
      } finally {
        if (connection) connection.release();
      }
    });

    // Delete complaint by ID
    app.delete('/api/complaints/:id', async (req, res) => {
      let connection;
      try {
        connection = await pool.getConnection();
        const [result] = await connection.execute('DELETE FROM complaints WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Complaint not found'
          });
        }
        res.json({
          success: true,
          message: 'Complaint deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting complaint:', error);
        res.status(500).json({
          success: false,
          message: 'Error deleting complaint',
          error: error.message
        });
      } finally {
        if (connection) connection.release();
      }
    });

    // Download video file
    app.get('/api/uploads/:filename', (req, res) => {
      const filePath = path.join(__dirname, 'uploads', req.params.filename);
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
      } else {
        res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
    });

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({
        success: true,
        message: 'Server is running',
        database: 'MySQL (XAMPP) enabled',
        timestamp: new Date()
      });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════════════╗');
      console.log('║     Wi-Fi Complaint Server Started             ║');
      console.log('╚════════════════════════════════════════════════╝');
      console.log('');
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Database: MySQL (XAMPP)`);
      console.log(`✓ Database Name: ${process.env.DB_NAME || 'wifi_complaints'}`);
      console.log(`✓ Upload folder: ${path.join(__dirname, 'uploads')}`);
      console.log('');
      console.log('API Endpoints:');
      console.log(`  POST   /api/complaints/submit     - Submit complaint`);
      console.log(`  GET    /api/complaints/all        - Get all complaints`);
      console.log(`  GET    /api/complaints/:id        - Get complaint by ID`);
      console.log(`  GET    /api/complaints/count      - Get complaints count`);
      console.log(`  DELETE /api/complaints/:id        - Delete complaint`);
      console.log(`  GET    /api/uploads/:filename     - Download video`);
      console.log(`  GET    /api/health                - Health check`);
      console.log('');
    });
  } catch (error) {
    console.error('Unexpected error during initialization:', error);
    process.exit(1);
  }
})();
