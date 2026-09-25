const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'complaints.db');
const db = new Database(dbPath);

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║     Wi-Fi Complaints Database Viewer          ║');
console.log('╚════════════════════════════════════════════════╝\n');

// Get all complaints
try {
  const complaints = db.prepare('SELECT * FROM complaints ORDER BY timestamp DESC').all();
  
  console.log(`Total Complaints: ${complaints.length}\n`);
  
  if (complaints.length === 0) {
    console.log('No complaints in database yet.\n');
  } else {
    complaints.forEach((complaint, index) => {
      console.log(`\n─────────────────────────────────────────────────`);
      console.log(`Complaint #${index + 1} (ID: ${complaint.id})`);
      console.log(`─────────────────────────────────────────────────`);
      console.log(`Name:          ${complaint.firstName} ${complaint.lastName}`);
      console.log(`Primary Phone: ${complaint.primaryPhone}`);
      console.log(`Secondary:     ${complaint.secondaryPhone || 'N/A'}`);
      console.log(`Contract #:    ${complaint.contractNumber}`);
      console.log(`Landline:      ${complaint.landlinePhone}`);
      console.log(`Address:       ${complaint.address || 'N/A'}`);
      console.log(`Location:      (${complaint.latitude || 'N/A'}, ${complaint.longitude || 'N/A'})`);
      console.log(`Video File:    ${complaint.videoFile || 'None'}`);
      console.log(`Timestamp:     ${complaint.timestamp}`);
      console.log(`Created At:    ${complaint.createdAt}`);
    });
  }
  
  console.log('\n╚════════════════════════════════════════════════╝\n');
  
} catch (error) {
  console.error('Error reading database:', error.message);
}

db.close();
