


/**
 * 这个是数据库访问模块，只有一个函数，根据查询语句返回结果数组
 */


//异步返回


var queryFunc = require('./queryFuncDefine.js');
var builtInCURD = require('./filter.js')
var bulkCURD = require('./insert.js');



/* let Ut = require("./common");
let t1=0; */


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
        output.add = output.add.concat(re.c);
        output.update = output.update.concat(re.u);
        output.select = output.select.concat(re.r);
        output.delete = output.delete.concat(re.d);

    }
    //表单自身的表
    else if (item.type == 'self') {

        output.add.push(item.Table_Name);
    }
    //什么都不是
    else {
    }   

}

let centerControl = async function () {

    //查询总行数
    str = `select count(1) as total from ##allRank`
    let aa = await queryFunc(str);
    console.dir('333333')
    let total = aa[0].total

    console.dir(aa[0].total)

    //根据总行数,一行一行的循环调用rowItem
    for (let i = 1; i <= total; i++) {
        str = `select * from ##allRank a where a.[No]='${i}'`
        let row = await queryFunc(str);
        console.dir(i)
        console.dir(row)
        rowItem(row);
        return

        if (i == 3) {
            return;
        }
    }
}

//module.exports = centerControl;



let am = [{
    Form_ID: '20080305115642',
    Table_Name: 'ExecuteSQL(,cyerp.dbo.stHr_deptRelation)',
    type: 'esql',
    No: '2'
}]

let abc = async function () {
    let ss = await rowItem(am)
    //console.dir(ss);
    console.dir('end')
}
abc();


//  node advance/centerControl.js




