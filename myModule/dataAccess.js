/**
 * 这个是数据库访问模块，只有一个函数，根据查询语句返回结果数组
 */

var sql = require("mssql");

/*
*定义配置文件
*/
const config = {


/*     user: 'cqread',
    password: 'read123',
    server: '10.34.1.70',
    database: 'cyerp',
    port: 1433, */

    user: 'zxb',
    password: 'zxb123',
    server: '10.34.1.77',
    database: 'acticle',
    port: 1433,




    options: {
        encrypt: false // Use this if you're on Windows Azure
    },
    pool: {
        min: 0,
        max: 10,
        idleTimeoutMillis: 3000
    }
};

//异步返回
let getData = async (queryString) => {

    console.log('getData开始...');
    let flg = 0; //异步等待返回标记

    let columnsArray = new Array();
    await sql.connect(config);
    // ... error checks
    const request = new sql.Request()
    request.stream = true // You can set streaming differently for each request

    




    request.query(queryString) // or request.execute(procedure)    

    request.on('row', function (columns) { //这个是每个行
        columnsArray.push(columns);
    })
    request.on('error', function(err) {  //这个是发生错误的时候
        // May be emitted multiple times
        flg = 1;
    });

    request.on('done', () => {  //当所有都返回的时候
        sql.close()

        //console.dir(columnsArray);
        flg = 1;
    });



    while (flg === 0) { //一直循环等待，知道flg不等于0
        require('deasync').runLoopOnce();
    }
    //console.dir(columnsArray);  
    console.dir('getData结束')
    return columnsArray;

}
module.exports = getData


