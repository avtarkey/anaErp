/**
 * 这个是数据操作模块，这个只有一个函数,接受一个数组和一个是否是附加插入的选项,将数组数据插入到数据表中
 */

var sql = require("mssql");

/*
*定义配置文件
*/
const config = {

/*     
    user: 'cqread',
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

let insertData = async (myArr, isAppend) => {
    console.log('insertData正在调用....');


    await sql.connect(config);

    var table = new sql.Table('absd');

    table.create = true;
    table.columns.add('tableName', sql.NVarChar(100), { nullable: true }); //表名
    table.columns.add('formID', sql.NVarChar(100), { nullable: true });    //表单ID
    table.columns.add('origin', sql.NVarChar(100), { nullable: true });
    table.columns.add('txt', sql.NVarChar(4000), { nullable: true });
    console.log('vegefefdfdfddewkjk')

    for (let key in myArr) {
        //console.log('正在循环:' + key + '' + myArr.length);
        table.rows.add(myArr[key].TableName, myArr[key].FormID, myArr[key].Origin,myArr[key].txt); //将数据插入到创建的表中
    }

    const request = new sql.Request()

    console.log('insert开始查')

    isAppend = isAppend || 0   //在插入的时候是在尾部附加插入,还是删除原有的数据插入
    if (isAppend === 0) {
        await request.query('delete from acticle..absd');
    }


    await request.bulk(table); //执行
    sql.close();
    console.log('insertData结束.');
    return 1;
}

module.exports = insertData;
