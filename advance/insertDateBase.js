

var Connection = require('tedious').Connection,
    TYPES = require('tedious').TYPES;








var connection = new Connection({
    server: '10.34.1.77',
    userName: 'zxb',
    password: 'zxb123',
    options: {
        port: 1433,
        database: 'acticle',
        rowCollectionOnDone: true,
        encrypt:false
    }
});

const table = '[dbo].[absd]';

function loadBulkData() {
    var option = { keepNulls: true }; // option to honor null
    var bulkLoad = connection.newBulkLoad(table, option, function (err, rowCont) {
        if (err) {
            throw err;
        }
        console.log('rows inserted :', rowCont);
        connection.close();
    });
    // setup columns
    bulkLoad.addColumn('formID',TYPES.NVarChar, { length: 50, nullable: true });
    bulkLoad.addColumn('tableName', TYPES.NVarChar, { length: 50, nullable: true });

    // add rows
    bulkLoad.addRow({ tableName: 'bulkLoad',formID: 'hello' });


    // perform bulk insert
    connection.execBulkLoad(bulkLoad);
}

connection.on('connect', function (err) {
    if (err) {
        console.log('Connection Failed');
        throw err;
    }
    loadBulkData();
});

module.exports = queryFunc

// node advance/insertDateBase.js