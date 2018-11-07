
var sql = require("mssql");
let a = 1;

let req
let config = {
    /*  user: 'cqread',
        password: 'read123',
        server: '10.34.1.70',
        database: 'cyerp',
        port: 1433, */

    user: 'cqread',
    password: 'read123',
    server: '10.34.1.70',
    database: 'cyerp',
    port: 1433,

    options: {
        encrypt: false // Use this if you're on Windows Azure
    },
    pool: {
        min: 5,
        max: 8,
        idleTimeoutMillis: 3000
    }
};


async function bulkCURD(formID, relation) {

 

    /*  let conn = new sql.Connect(opts);
    await conn.connect(); */
    //t sql.close();//关闭前面开启的链接

    if (a == 1) {
        await sql.connect(config);
        req = new sql.Request();
    }
    a = 5

    // 表添加
    let tableAdd = new sql.Table('##tableAdd');
    tableAdd.create = true;
    tableAdd.columns.add('formID', sql.NVarChar(100), { nullable: true });    //表单ID
    tableAdd.columns.add('tableName', sql.NVarChar(100), { nullable: true }); //表名    

    if (relation.add.length > 0) {
        for (let item of relation.add) {
            tableAdd.rows.add(formID, item)
        }
    }

    //表删除
    let tableDelete = new sql.Table('##tableDelete');
    tableDelete.create = true;
    tableDelete.columns.add('formID', sql.NVarChar(100), { nullable: true });    //表单ID
    tableDelete.columns.add('tableName', sql.NVarChar(100), { nullable: true }); //表名   

    if (relation.delete.length > 0) {
        for (let item of relation.delete) {
            tableDelete.rows.add(formID, item)
        }
    }

    //表更新
    let tableUpdate = new sql.Table('##tableUpdate');
    tableUpdate.create = true;
    tableUpdate.columns.add('formID', sql.NVarChar(100), { nullable: true });    //表单ID
    tableUpdate.columns.add('tableName', sql.NVarChar(100), { nullable: true }); //表名   

    if (relation.update.length > 0) {
        for (let item of relation.update) {
            tableUpdate.rows.add(formID, item)
        }
    }

    //表查询
    let tableSelect = new sql.Table('##tableSelect');
    tableSelect.create = true;
    tableSelect.columns.add('formID', sql.NVarChar(100), { nullable: true });    //表单ID
    tableSelect.columns.add('tableName', sql.NVarChar(100), { nullable: true }); //表名   

    if (relation.select.length > 0) {
        for (let item of relation.select) {
            tableSelect.rows.add(formID, item)
        }
    }

    // create a new request object with the isolated pool


    // bulk insert into the temp table
    await req.bulk(tableAdd);
    await req.bulk(tableDelete);
    await req.bulk(tableUpdate);
    await req.bulk(tableSelect);
}


module.exports = bulkCURD;