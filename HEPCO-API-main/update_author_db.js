const { poolPromise } = require('./src/db.js');

async function updateDb() {
  try {
    const pool = await poolPromise;
    console.log('Dropping author column...');
    await pool.request().query("IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('News') AND name = 'author') ALTER TABLE News DROP COLUMN author;");
    
    console.log('Adding author_id column...');
    await pool.request().query("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('News') AND name = 'author_id') ALTER TABLE News ADD author_id INT;");
    
    console.log('Cập nhật Database thành công!');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi cập nhật DB:', err);
    process.exit(1);
  }
}

updateDb();
