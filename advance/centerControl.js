


/**
 * 这个是数据库访问模块，只有一个函数，根据查询语句返回结果数组
 */


//异步返回


var queryFunc = require('./queryFuncDefine.js');
var aaa = require('./filter.js')
var bulkCURD = require('./insert.js');



/* let Ut = require("./common");
let t1=0; */






let rowItem = async function (rows) {
    let item=rows[0]

    let tmpre = { add: [], delete: [], update: [], select: [] }
    console.dir('item:')
    console.dir(item)

    console.dir(item.type)
    console.dir(item.type == 'esql')
   
    /*   console.dir('*****************循环开始*****************************')
      console.dir(item.Form_Taiwan_Name); */
     


    if (item.type == 'tbl') { //如果是表
        console.dir('tbl')
        tmpre.select.push(item.Table_Name);
        // console.dir(item.Table_Name);
        //console.dir(tmpArray);


    } else if (item.type == 'vw') { //如果是视图
        console.dir('vw')
        // console.dir(item.Table_Name)

        let viewDefineStrLine = await queryFunc('exec sp_helptext ' + item.Table_Name);//视图的定义语句是一行一行的

        let viewDefineStr = '';
        for (let i of viewDefineStrLine) {
            viewDefineStr += i.Text;
        }
        // console.dir(viewDefineStr)
        // console.dir('view:::'+viewDefineStr)
        tmpre = await aaa(viewDefineStr);


    } else if (item.type == 'esql') { //如果是方法
        console.dir('esql +++++++++++++++++++++++++++++++++++++++++++++')
        // console.dir(item.Table_Name)
        tmpre = await aaa(item.Table_Name)
        console.dir('esql denpendency: ')
        console.dir(tmpre);
        
        console.dir('______________________________________________________')

    } else if (item.type == 'self') {  //表单自身的表
        console.dir('self')
        tmpre.add.push(item.Table_Name);
    }
    else {
    }
    console.dir('tmpre:')
    console.dir(tmpre)

    await bulkCURD(item.form_ID, tmpre)

    // console.dir('*************************循环结束*********************************')

}

async function centerControl() {

    str = `select count(1) as total from ##allRank`
    let aa = await queryFunc(str);
    console.dir('333333')
    let total = aa[0].total

    console.dir(aa[0].total)

    for (let i = 1; i <= total; i++) {
        str = `select * from ##allRank a where a.[No]='${i}'`
        let row = await queryFunc(str);
        console.dir(i)
        console.dir(row) 
        rowItem(row);

        if (i == 3) {
            return;
        }
    }
}

//module.exports = centerControl;

 let am= [ { Form_ID: '20080305115642',
Table_Name: 'ExecuteSQL(,cyerp.dbo.stHr_deptRelation)',
type: 'esql',
No: '2' } ]

  let abc = async function () {
    let ss = await rowItem (am )
    //console.dir(ss);
    console.dir('end')
}
abc();  


//  node advance/centerControl.js




