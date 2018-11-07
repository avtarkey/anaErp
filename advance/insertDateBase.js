
var sql = require("mssql");


async function bulkTest(myArr) {

    // create a unique connection pool for this op
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
            min: 1,
            max: 1,
            idleTimeoutMillis: 200
        }
    };


   /*  let conn = new sql.Connect(opts);
    await conn.connect(); */
    //t sql.close();//关闭前面开启的链接

    await sql.connect(config);  

    

    let req;
   
        // create the temp table
        let table = new sql.Table('#absd');
        table.create = true;
        table.columns.add('tableName', sql.NVarChar(100), { nullable: true }); //表名
        table.columns.add('formID', sql.NVarChar(100), { nullable: true });    //表单ID
        table.columns.add('origin', sql.NVarChar(100), { nullable: true });
        table.columns.add('txt', sql.NVarChar(100), { nullable: true });

        // push some data into the buffer
        for (let key in myArr) {
            //console.log('正在循环:' + key + '' + myArr.length);
            table.rows.add(myArr[key].TableName, myArr[key].FormID, myArr[key].Origin, myArr[key].txt); //将数据插入到创建的表中
        }

        // create a new request object with the isolated pool
        req = new sql.Request();

        // bulk insert into the temp table
        await req.bulk(table);

        // execute the store procedure
       // await req.execute('sp_merge_bulk_data');

        // delete the temp table
        let myStr=
        `
        WITH formIDTable  
        AS (SELECT Isnull(
        (SELECT TOP 1 a.Table_Taiwan_Name  
                           FROM   BsMaster..TBSF_Table_Directory a  
                           WHERE  a.Table_Name = b.tableName COLLATE Chinese_Taiwan_Stroke_CI_AS),
                           (select mm.Table_Taiwan_Name from bsMaster..TBSF_Table_Directory mm where mm.Table_Name=b.tableName COLLATE Chinese_Taiwan_Stroke_CI_AS)
                            ) AS sourceFormName,  
                   b.formID                                                                                     AS targetFormID  
            FROM   #absd b),  
              
              
        formIDModuleName /*表單號與模塊的對應關係*/  
        AS (SELECT a.Module_ID,  
                   a.Module_Chinese_Name,  
                   c.Form_Taiwan_Name  
            FROM   BsMaster..TBSF_Module a  
                   INNER JOIN BsMaster..TBSF_Function b  
                     ON a.Module_ID = b.Module_ID  
                   INNER JOIN BsMaster..TBSF_Form c  
                     ON b.Function_Detail = c.Form_ID),  
                       
                       
        formNameTable  
        AS (SELECT sourceFormName                                                          AS sourceForm,  
                   (SELECT TOP 1 a.Form_chinese_Name  
                    FROM   bsmaster..TBSF_Form a  
                    WHERE  a.Form_ID = b.targetFormID COLLATE Chinese_Taiwan_Stroke_CI_AS and a.isDisabled ='1' COLLATE Chinese_Taiwan_Stroke_CI_AS) AS targetForm,  
                    --a.isDisabled='1' 本模塊必須是啟用的  
                   Isnull((SELECT TOP 1 a.Module_Chinese_Name  
                           FROM   formIDModuleName a  
                           WHERE  a.Form_Taiwan_Name = b.sourceFormName), '無表單表')              AS mName,  
                   Isnull((SELECT TOP 1 a.Module_ID  
                           FROM   formIDModuleName a  
                           WHERE  a.Form_Taiwan_Name = b.sourceFormName), 'module11111')              AS mID  
            FROM   formIDTable b)  
              
              
   --select distinct * from formNameTable where sourceForm is not null                      
 
   SELECT DISTINCT a.sourceForm AS sourceFormName,  
                   a.targetForm AS targetFormName,  
                   a.mName      AS sourceModuleName,  
                   a.mID        AS sourceModuleID  
   FROM   formNameTable a  
   WHERE  a.sourceForm IS NOT NULL  
          AND a.sourceForm <> a.targetForm  
          --AND a.mName <> ''  
          --and a.mName<>'已禁用功能'  
                     `
        
       let  result=await req.query(myStr);

       sql.close();
        console.dir('eeeeeeeeeeeeee')
       return result;
    }




    



module.exports = bulkTest;