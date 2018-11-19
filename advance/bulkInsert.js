
var ConnectionPool = require('tedious-connection-pool');
var TYPES = require('tedious').TYPES;


//批量插入函数



//连接池配置
var poolConfig = {
    min: 6,
    max: 8,
    log: false
};

//数据连接配置
var connectionConfig = {
    userName: 'zxb',
    password: 'zxb123',
    server: '10.34.1.77',
    options: {
        port: 1433,
        database: 'acticle',
        rowCollectionOnDone: true,
        encrypt: false
    }
};

//建立连接池实例
var pool = new ConnectionPool(poolConfig, connectionConfig);


//连接池开启
pool.on('error', function (err) {
    console.dir("连接池开启错误!")
    console.error(err);
});


let ins = async function (formID,arr,table) {
    console.dir('%%%%%%%%%%%%%%%%%')
    console.dir(formID)
    let flag = 0;


    pool.acquire(function (err, connection) {
        if (err) {
            console.dir('从连接池中获取连接错误!')
            //console.error(err);
            return;
        }

        function loadBulkData() {

           // const table = '[dbo].[absd]';

            //批量插入配置
            var option = { keepNulls: true }; // option to honor null

            //新建批量插入实例
            var bulkLoad = connection.newBulkLoad(table, function (err, rowCont) {
                if (err) {
                    console.dir("批量插入实例新建错误!")
                    throw err;
                }
                console.log('rows inserted :', rowCont);
                connection.release();
                flag = 1
            });

            // setup columns
            bulkLoad.addColumn('formID', TYPES.NVarChar, { length: 50, nullable: true });
            bulkLoad.addColumn('tableName', TYPES.NVarChar, { length: 50, nullable: true });

            // add rows
            for (let item of arr) {
                //  { tableName: 'bulkLoad', formID: 'hello' }
                bulkLoad.addRow([formID,item]);
            }


            // perform bulk insert
            connection.execBulkLoad(bulkLoad);
        }

        loadBulkData();
    })


    while (flag === 0) { //一直循环等待，知道flg不等于0
        require('deasync').runLoopOnce();
    }
}
//从连接池中获得一个连接

 module.exports = ins



// { tableName: 'bulkLoad', formID: 'hello' }

// node advance/bulkInsert.js
/* let a=[
    { tableName: 'bulkLoad', formID: 'hello' },
    { tableName: 'a', formID: 'b' }
]

ins(a) */