const fs = require('fs');
const { poolPromise } = require('./src/db.js');

async function runSetup() {
  try {
    const pool = await poolPromise;
    const sqlScript = fs.readFileSync('setup_db.sql', 'utf8');
    
    const batches = sqlScript.split(/\bGO\b/i);
    
    for (let batch of batches) {
      const cleanBatch = batch.trim();
      if (cleanBatch) {
        console.log('Running batch:');
        console.log(cleanBatch.substring(0, 50) + '...');
        await pool.request().query(cleanBatch);
      }
    }
    
    console.log('Chạy setup_db.sql thành công! Đã tạo xong Database và các bảng.');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi chạy script:', err);
    process.exit(1);
  }
}

runSetup();
