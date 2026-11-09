const { poolPromise } = require('./src/db.js');

async function fixDb() {
  try {
    const pool = await poolPromise;
    console.log('Fixing IpWhitelist and dropping category...');
    
    // Create IpWhitelist just in case it didn't create correctly
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'IpWhitelist')
      BEGIN
          CREATE TABLE IpWhitelist (
              id INT IDENTITY(1,1) PRIMARY KEY,
              ip VARCHAR(50) NOT NULL UNIQUE
          );
          INSERT INTO IpWhitelist (ip) VALUES ('127.0.0.1');
          INSERT INTO IpWhitelist (ip) VALUES ('::1');
      END
    `);

    // Drop category from News
    await pool.request().query(`
      IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('News') AND name = 'category')
      BEGIN
        ALTER TABLE News DROP COLUMN category;
      END
    `);
    
    console.log('Cập nhật Database thành công!');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi cập nhật DB:', err);
    process.exit(1);
  }
}

fixDb();
