


/**
 * 这个是数据库访问模块，只有一个函数，根据查询语句返回结果数组
 */


//异步返回
const queryFunc = require('./queryFuncDefine.js');  //这个是查询
const builtInCURD = require('./filter.js')  //这个是sql依赖解析
const bulkInsert = require('./bulkInsert.js');  //这个是插入



/* let Ut = require("./common");
let t1=0; */

//对##allRank表中每行记录的处理
let rowItem = async function (rows) {

    let item = rows[0]                                              //递归项
    let output = { add: [], delete: [], update: [], select: [] }    //最后的返回结果

    //如果是表
    if (item.type == 'tbl') {        
        output.select.push(item.Table_Name)
    }

    //如果是视图
    else if (item.type == 'vw') {
        //视图的定义语句是一行一行的
        let viewDefineStrLine = await queryFunc('exec sp_helptext ' + item.Table_Name)
        let viewDefineStr = '';
        for (let i of viewDefineStrLine) {
            viewDefineStr += i.Text;
        }
        tmp = await builtInCURD(viewDefineStr)
        output.select = output.select.concat(tmp.r)
    }

    //如果是方法
    else if (item.type == 'esql') {
        tmp = await builtInCURD(item.Table_Name)
       
        output.add = output.add.concat(tmp.c)
        output.update = output.update.concat(tmp.u)
        output.select = output.select.concat(tmp.r)
        output.delete = output.delete.concat(tmp.d)
    }

    //表单自身的表
    else if (item.type == 'self') {
        output.add.push(item.Table_Name);
    }

    //什么都不是
    else {
    }

    return output
}

//这里是总的处理
let centerControl = async function () {

    //查询总行数
    str = `select count(1) as total from ##allRank`
    let aa = await queryFunc(str)   
    let total = aa[0].total
    
    console.log('centerControl.js ##allRank的总行数:',aa[0].total)    

    let a = { add: [], delete: [], update: [], select: [] }  //暂存将要插入数据库的数据
    let fID = ''                                             //暂存将要插入数据库的表单号
    let flag = 0 //是否执行插入的标记 0表不插入
    let firstFlag=1 //1表示初始

    //根据总行数,一行一行的循环调用rowItem
    for (let i = 1; i <= total; i++) {

       


        firstFlag=0
        console.log('centerControl.js ##allRank的总行数:',aa[0].total)  
        console.log('centerControl.js 当前正在处理##allRank表的行数:',i)

        //取数据
        str = `select * from ##allRank a where a.[No]='${i}'`
        let row = await queryFunc(str)  

        //判断是否执行插入
        if (firstFlag==0  && fID != row[0].Form_ID) {
            flag = 1
        }       
       
        //执行插入
        if (flag == 1) {

            //将字符串转化为小写,方便后面的集合去重
            a.add = a.add.map(v => v.toLowerCase())
            a.delete = a.delete.map(v => v.toLowerCase())
            a.update = a.update.map(v => v.toLowerCase())
            a.select = a.select.map(v => v.toLowerCase())

            //通过集合为数组去重
            a.add = Array.from(new Set(a.add))
            a.delete = Array.from(new Set(a.delete))
            a.update = Array.from(new Set(a.update))
            a.select = Array.from(new Set(a.select))
            
            //将暂存的数据插入到数据库中
            if (a.add.length != 0) {
                bulkInsert(fID, a.add, '[dbo].[tableAdd]')
                console.log('centerControl.js 操作:add 对应表单号:',fID)         
            }
            if (a.delete.length != 0) {
                bulkInsert(fID, a.delete, '[dbo].[tableDelete]')
                console.log('centerControl.js 操作:delete 对应表单号:',fID)            
            }
            if (a.update.length != 0) {
                bulkInsert(fID, a.update, '[dbo].[tableUpdate]')
                console.log('centerControl.js 操作: update 对应表单号:',fID)                
            }
            if (a.select.length != 0) {
                bulkInsert(fID, a.select, '[dbo].[tableSelect]')
                console.log('centerControl.js 操作: select 对应表单号:',fID)                
            }

            a = { add: [], delete: [], update: [], select: [] }
            flag = 0
        }

        //不执行插入       
        let b = await rowItem(row)
      
        a.add = a.add.concat(b.add)
        a.delete = a.delete.concat(b.delete)
        a.update = a.update.concat(b.update)
        a.select = a.select.concat(b.select)

        fID = row[0].Form_ID

     

       

      /*   if (i == 600) {
            return;
        } */
    }
    //这里的不插入的作用是 当循环完了后,最后一个并没有插入,所以在这里进行插入
    if (a.add.length != 0 || a.delete.length != 0 || a.update.length != 0 || a.select.length != 0) {

        a.add = a.add.map(v => v.toLowerCase())
        a.delete = a.delete.map(v => v.toLowerCase())
        a.update = a.update.map(v => v.toLowerCase())
        a.select = a.select.map(v => v.toLowerCase())

        a.add = Array.from(new Set(a.add))
        a.delete = Array.from(new Set(a.delete))
        a.update = Array.from(new Set(a.update))
        a.select = Array.from(new Set(a.select))

        if (a.add.length != 0) {
            bulkInsert(fID, a.add, '[dbo].[tableAdd]')
            console.log('centerControl.js 操作:add 对应表单号:',fID)         
        }
        if (a.delete.length != 0) {
            bulkInsert(fID, a.delete, '[dbo].[tableDelete]')
            console.log('centerControl.js 操作:delete 对应表单号:',fID)            
        }
        if (a.update.length != 0) {
            bulkInsert(fID, a.update, '[dbo].[tableUpdate]')
            console.log('centerControl.js 操作: update 对应表单号:',fID)                
        }
        if (a.select.length != 0) {
            bulkInsert(fID, a.select, '[dbo].[tableSelect]')
            console.log('centerControl.js 操作: select 对应表单号:',fID)                
        } 

        a = { add: [], delete: [], update: [], select: [] }
        flag = 0

        console.log('Yes successful!')
    }

     
}

module.exports = centerControl



/*   let am = 
[ { Form_ID: '20080306120034',
    Table_Name: 'ExecuteSQL(Rst,exec CYERP.dbo.stHr_ResumeCheck [Form$.MainForm.TextBox8],[Form$.MainForm.TextBox10],[Form$.MainForm.TextBox18],[Form$.MainForm.LargeTextBox79],[Form$.MainForm.TextBox15])',
    type: 'esql',
    No: '121' } ]  */

/* 
let abc = async function () {
    let ss = await centerControl()
   //  let ss=await rowItem(am)
    console.dir('end')
}
*/
//centerControl(); 


//  node advance/centerControl.js




