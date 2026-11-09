const sql = require('mssql/msnodesqlv8');

const config = {
  connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=HEPCO_DB;Trusted_Connection=yes;'
};

console.log('Testing connection with connectionString:', config.connectionString);

sql.connect(config).then(pool => {
  console.log('Success!');
  return pool.request().query('SELECT @@version as version');
}).then(result => {
  console.log('Query result:', result.recordset);
  process.exit(0);
}).catch(err => {
  console.error('Error connecting:', err);
  process.exit(1);
});
