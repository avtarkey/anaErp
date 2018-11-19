


/**
 * 这个是数据库访问模块，只有一个函数，根据查询语句返回结果数组
 */


//异步返回


var queryFunc = require('./queryFuncDefine.js');  //这个是查询
var builtInCURD = require('./filter.js')  //这个是sql依赖解析
var bulkInsert = require('./bulkInsert.js');  //这个是插入



/* let Ut = require("./common");
let t1=0; */

//对##allRank表中每行记录的处理
let rowItem = async function (rows) {
    let item = rows[0]
    let output = { add: [], delete: [], update: [], select: [] }
    //如果是表
    if (item.type == 'tbl') {
        console.dir('tbl')
        output.select.push(item.Table_Name);

    }
    //如果是视图
    else if (item.type == 'vw') {
        //视图的定义语句是一行一行的
        let viewDefineStrLine = await queryFunc('exec sp_helptext ' + item.Table_Name)
        let viewDefineStr = '';
        for (let i of viewDefineStrLine) {
            viewDefineStr += i.Text;
        }

        tmp = await builtInCURD(viewDefineStr);

        output.select = output.select.concat(tmp.r)
    }
    //如果是方法
    else if (item.type == 'esql') {
        tmp = await builtInCURD(item.Table_Name)
        output.add = output.add.concat(tmp.c);
        output.update = output.update.concat(tmp.u);
        output.select = output.select.concat(tmp.r);
        output.delete = output.delete.concat(tmp.d);

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
    let aa = await queryFunc(str);
    // console.dir('333333')
    let total = aa[0].total

    console.dir(aa[0].total)

    let a = { add: [], delete: [], update: [], select: [] }
    let fID = ''
    let flag = 0 //是否执行插入的标记

    //根据总行数,一行一行的循环调用rowItem
    for (let i = 1; i <= total; i++) {

        //取数据
        str = `select * from ##allRank a where a.[No]='${i}'`
        let row = await queryFunc(str);

        //判断是否执行插入
        if (fID != '' && fID != row[0].Form_ID) {
            flag = 1
        }

        //执行插入
        if (flag == 1) {

            a.add = Array.from(new Set(a.add))
            a.delete = Array.from(new Set(a.delete))
            a.update = Array.from(new Set(a.update))
            a.select = Array.from(new Set(a.select))
/* console.dir('*************')
            console.dir(a.add ) */

            if (a.add.length != 0) {
                bulkInsert(fID, a.add, '[dbo].[addTable]')
            }
            if (a.delete.length != 0) {
                bulkInsert(fID, a.delete, '[dbo].[deleteTable]')
            }
            if (a.update.length != 0) {
                bulkInsert(fID, a.update, '[dbo].[modifyTable]')
            }
            if (a.select.length != 0) {
                bulkInsert(fID, a.select, '[dbo].[queryTable]')
            }

            a = { add: [], delete: [], update: [], select: [] }
            
            flag=0
        }

        //不执行插入
        let b = await rowItem(row);
        a.add = a.add.concat(b.add)
        a.delete = a.delete.concat(b.delete)
        a.update = a.update.concat(b.update)
        a.select = a.select.concat(b.select)

        fID = row[0].Form_ID
        if (i == 30) {
            return;
        }
    }

    //这里的不插入的作用是 当循环完了后,最后一个并没有插入,所以在这里进行插入
    if (a.add.length != 0 || a.delete.length != 0 || a.update.length != 0 || a.select.length != 0) {

        a.add = Array.from(new Set(a.add))
        a.delete = Array.from(new Set(a.delete))
        a.update = Array.from(new Set(a.update))
        a.select = Array.from(new Set(a.select))


        if (a.add.length != 0) {
            bulkInsert(fID, a.add, '[dbo].[addTable]')
        }
        if (a.delete.length != 0) {
            bulkInsert(fID, a.delete, '[dbo].[deleteTable]')
        }
        if (a.update.length != 0) {
            bulkInsert(fID, a.update, '[dbo].[modifyTable]')
        }
        if (a.select.length != 0) {
            bulkInsert(fID, a.select, '[dbo].[queryTable]')
        }

        a = { add: [], delete: [], update: [], select: [] }
        flag=0
    }


}

//module.exports = centerControl;



/*  let am = 
  [ { Form_ID: '20080306110505',
    Table_Name: 'vwBase_Staff',
    type: 'vw',
    No: '79' } ] */


let abc = async function () {
    let ss = await centerControl()
    // let ss=await rowItem(am)

    console.dir('end')

}
abc();


//  node advance/centerControl.js




