const { poolPromise } = require('./src/db.js');

async function rename() {
  try {
    const pool = await poolPromise;
    // Check if banner exists before renaming
    const check = await pool.request().query("SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('News') AND name = 'banner'");
    if (check.recordset.length > 0) {
      await pool.request().query("EXEC sp_rename 'News.banner', 'thumbnail', 'COLUMN';");
      console.log('Renamed banner to thumbnail');
    } else {
      console.log('Column banner not found, skipping rename');
    }
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
rename();
