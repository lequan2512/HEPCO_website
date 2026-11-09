const { poolPromise } = require('./src/db.js');

async function updateDb() {
  try {
    const pool = await poolPromise;
    console.log('Thêm cột description vào bảng IpWhitelist...');
    await pool.request().query("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('IpWhitelist') AND name = 'description') ALTER TABLE IpWhitelist ADD description NVARCHAR(255);");
    console.log('Cập nhật Database thành công!');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi cập nhật DB:', err);
    process.exit(1);
  }
}

updateDb();
