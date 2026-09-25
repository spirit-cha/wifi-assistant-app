const mysql = require('mysql2/promise');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let connection;

async function initDB() {
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wifi_complaints'
    });
    console.log('✓ Connected to MySQL database');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
}

function showMenu() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║     Database Management Menu                  ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('1. View all complaints');
  console.log('2. View complaint by ID');
  console.log('3. Delete complaint by ID');
  console.log('4. Delete all complaints');
  console.log('5. Get database statistics');
  console.log('6. Export data to JSON');
  console.log('0. Exit\n');
}

async function viewAll() {
  try {
    const [rows] = await connection.execute('SELECT * FROM complaints ORDER BY timestamp DESC');
    console.log(`\n✓ Total Complaints: ${rows.length}`);
    
    if (rows.length > 0) {
      console.log('\n' + JSON.stringify(rows, null, 2));
    }
  } catch (error) {
    console.error('Error fetching complaints:', error.message);
  }
  promptMenu();
}

async function viewById() {
  rl.question('Enter Complaint ID: ', async (id) => {
    try {
      const [rows] = await connection.execute('SELECT * FROM complaints WHERE id = ?', [id]);
      if (rows.length > 0) {
        console.log('\n✓ Found complaint:');
        console.log(JSON.stringify(rows[0], null, 2));
      } else {
        console.log('\n❌ Complaint not found');
      }
    } catch (error) {
      console.error('Error fetching complaint:', error.message);
    }
    promptMenu();
  });
}

async function deleteById() {
  rl.question('Enter Complaint ID to delete: ', (id) => {
    rl.question('Are you sure? (yes/no): ', async (confirm) => {
      if (confirm.toLowerCase() === 'yes') {
        try {
          const [result] = await connection.execute('DELETE FROM complaints WHERE id = ?', [id]);
          if (result.affectedRows > 0) {
            console.log(`\n✓ Complaint ${id} deleted`);
          } else {
            console.log('\n❌ Complaint not found');
          }
        } catch (error) {
          console.error('Error deleting complaint:', error.message);
        }
      } else {
        console.log('\nCancelled');
      }
      promptMenu();
    });
  });
}

async function deleteAll() {
  rl.question('Delete ALL complaints? This cannot be undone! (yes/no): ', async (confirm) => {
    if (confirm.toLowerCase() === 'yes') {
      try {
        const [result] = await connection.execute('DELETE FROM complaints');
        console.log(`\n✓ Deleted ${result.affectedRows} complaints`);
      } catch (error) {
        console.error('Error deleting complaints:', error.message);
      }
    } else {
      console.log('\nCancelled');
    }
    promptMenu();
  });
}

async function statistics() {
  try {
    const [countRows] = await connection.execute('SELECT COUNT(*) as count FROM complaints');
    const [infoRows] = await connection.execute('DESCRIBE complaints');
    
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║     Database Statistics                       ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log(`Total Records:  ${countRows[0].count}`);
    console.log(`Database:       ${process.env.DB_NAME || 'wifi_complaints'}`);
    console.log(`\nTable Columns:`);
    infoRows.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    console.log('');
  } catch (error) {
    console.error('Error getting statistics:', error.message);
  }
  promptMenu();
}

async function exportData() {
  try {
    const [rows] = await connection.execute('SELECT * FROM complaints');
    const jsonPath = path.join(__dirname, 'complaints-export.json');
    fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2));
    console.log(`\n✓ Data exported to: ${jsonPath}`);
  } catch (error) {
    console.error('Error exporting data:', error.message);
  }
  promptMenu();
}

function promptMenu() {
  rl.question('Choose an option (0-6): ', (choice) => {
    switch(choice) {
      case '1':
        viewAll();
        break;
      case '2':
        viewById();
        break;
      case '3':
        deleteById();
        break;
      case '4':
        deleteAll();
        break;
      case '5':
        statistics();
        break;
      case '6':
        exportData();
        break;
      case '0':
        console.log('\nGoodbye!');
        connection.end();
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('\n❌ Invalid option');
        promptMenu();
    }
  });
}

(async () => {
  await initDB();
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   Wi-Fi Complaints Database Manager           ║');
  console.log('╚════════════════════════════════════════════════╝');
  showMenu();
  promptMenu();
})();
