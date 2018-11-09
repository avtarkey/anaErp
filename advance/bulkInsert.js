
var ConnectionPool = require('tedious-connection-pool');
var Request = require('tedious').Request;

var poolConfig = {
    min: 6,
    max: 8,
    log: false
};

var connectionConfig = {
    userName: 'cqread',
    password: 'read123',
    server: '10.34.1.70',

    options: {
        port: 1433,
        database: 'cyerp',
        rowCollectionOnDone: true

    }

};

var pool = new ConnectionPool(poolConfig, connectionConfig);

pool.on('error', function (err) {

    //console.error(err);
});



pool.acquire(function (err, connection) {


    if (err) {

        console.dir('111111111connection1111111')
        //console.error(err);
        return;
    }

    const table = '[dbo].[test_bulk]';

    function loadBulkData() {
        var option = { keepNulls: true }; // option to honor null
        var bulkLoad = connection.newBulkLoad(table, option, function (err, rowCont) {
            if (err) {
                throw err;
            }
            console.log('rows inserted :', rowCont);
            connection.release();
        });
        // setup columns
        bulkLoad.addColumn('c1', TYPES.Int, { nullable: true });
        bulkLoad.addColumn('c2', TYPES.NVarChar, { length: 50, nullable: true });

        // add rows
        bulkLoad.addRow({ c2: 'hello' });
        bulkLoad.addRow({ c2: 'bulkLoad' });

        // perform bulk insert
        connection.execBulkLoad(bulkLoad);
    }

    loadBulkData();





})