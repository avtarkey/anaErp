


const sql = require('mssql')
const config = {
    
    user: 'cqread',
    password: 'read123',
    server: '10.34.1.70',
    database: 'cyerp',
    port: 1433,
    connectionTimeout:3000,
    requestTimeout:300,




    options: {
        encrypt: false // Use this if you're on Windows Azure
    },
    pool: {
        min: 10,
        max: 10,
        idleTimeoutMillis: 300000
    }
}

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL')
    return pool
  })
  .catch(err => console.log('Database Connection Failed! Bad Config: ', err))

module.exports = {
  sql, poolPromise
}