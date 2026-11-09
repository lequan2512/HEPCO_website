const { poolPromise } = require('./src/db.js');

async function updateDb() {
  try {
    const pool = await poolPromise;
    console.log('Adding banner and type to News table...');
    
    await pool.request().query(`
      IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID('News') AND name = 'banner'
      )
      BEGIN
        ALTER TABLE News ADD banner NVARCHAR(500);
      END
    `);
    
    await pool.request().query(`
      IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID('News') AND name = 'type'
      )
      BEGIN
        ALTER TABLE News ADD type VARCHAR(50) DEFAULT 'news';
        EXEC('UPDATE News SET type = ''news'' WHERE type IS NULL');
      END
    `);
    
    console.log('Cập nhật Database thành công!');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi cập nhật DB:', err);
    process.exit(1);
  }
}

updateDb();
