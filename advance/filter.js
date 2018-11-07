/* 

ExecuteSQL	执行SQL----本身不能绑定审核流	ExecuteSQL(<返回值变量名>,< SQL语句>)

GetTableData	数据查询	GetTableData(<返回数据集变量名>,<表名称>,<字段列表>,<筛选条件>,<取记录数>)
InsertData	插入数据	InsertData(<新增ID返回值>,<新增数据表名称>,<赋值字段列表>,<启动审核否;申请人;申请部门> )
DeleteData	删除数据	DeleteData(<单据表名称>,<删除条件>) 

UpdateDataM	数据更新	UpdateDataM(<表名称>,<更改信息列表>,<更改条件>,<插入信息列表>,<变量名>)


*/

let queryFunc = require('./queryFuncDefine.js');

let diff = async function (arr) {
    let tableArray = new Array(); //存储依赖的表
    let nonTableArray = new Array(); //存储依赖的非表对象

    let tmpDependencyObj = arr


    if (tmpDependencyObj.length == 0) {  //为空就退出
        return tableArray
    }


    let dependencyObj = new Array();  //接受经过过滤的对象
    for (let element of tmpDependencyObj) { //这里将把select误添加的字段,进行过滤
        let para1 = `WHERE name= '` + element + `'`;
        let para2 = `WHERE name= '` + element + `'`;

        let str1 = ` SELECT Count(1) as total FROM sys.sysobjects  ${para1}`


        let tmpResultCyerp = await queryFunc(str1);


        let str2 = ` use bsmaster  SELECT Count(1) as total FROM sys.sysobjects ${para2}`

        let tmpResultBsMaster = await queryFunc(str2);
        if (tmpResultCyerp.length == 0 && tmpResultBsMaster.length == 0) {  //如果渠道
            //@Result=@Result+department_name+\,那么会出错,返回[],这时不是[{total:0}]
            //的形式,就以这种形式判断
            continue;
        }
        if (tmpResultCyerp[0].total != '0' || tmpResultBsMaster[0].total != '0') {
            dependencyObj.push(element);

        }
    }

    for (let obj of dependencyObj) {
        let objStr = obj;
        let queryStr =  //这条语句是在所有用户表中查询该对象有几个,如果为零,表示这个对象不是表对象
            //!!!!!!!!!!!!!!!!!!!这条语句只能判断这个对象是否是cyerp中的表,也就是说_tbsf_staff这个bsmaster中的表不能
            ` USE CyErp;  
         
        SELECT  COUNT(1) as total

        FROM sys.objects  
        WHERE type_desc LIKE '%USER_TABLE%' 
        and name='${objStr}'
         `
        let tmpResult = await queryFunc(queryStr);
        if (tmpResult[0].total == '0') {//如果结果为零,表示该对象不是表
            nonTableArray.push(obj);
        } else {
            tableArray.push(obj);//不为零,表示该对象是表
        }
    }
    return { table: tableArray, nonTable: nonTableArray }
}


let builtInCURD = async function (str) {
    let Creg = /^InsertData\([^,]*,\[?([^,\(\)\[\]]+)\]?,/
    let Rreg = /^GetTableData\([^,]*,\[?([^,\(\)\[\]]+)\]?,/
    let Dreg = /^DeleteData\([^,]*,\[?([^,\(\)\[\]]+)\]?,/

    let Ureg = /^UpdateDataM\(\[?([^,\(\)\[\]]+)\]?,/

    let Ereg = /^ExecuteSQL/

    let reg = /^ExecuteSQL\([^,]*,(exec)?\[?([^,\(\)\[\]]+)\]?[\s\()]/

    let returnResult = { c: [], u: [], r: [], d: [] }

    //增
    if (Creg.test(str)) {
        returnResult.c.push(str.match(Creg)[1])
    }

    //查
    if (Rreg.test(str)) {
        returnResult.r.push(str.match(Rreg)[1])
    }

    //删
    if (Dreg.test(str)) {
        returnResult.d.push(str.match(Dreg)[1])
    }

    //改
    if (Ureg.test(str)) {
        returnResult.u.push(str.match(Ureg)[1])
    }




    //exceute
    if (Ereg.test(str)) {
        let k = generalSql(str);
        let m = k.c.length + k.u.length + k.r.length + k.d.length
        if (m != 0) {
            returnResult = k;
        } else {
            let ss = diff(str.match(reg)[1])

            for (let obj of ss) {
                let tmpLineStr = await queryFunc('exec sp_helptext ' + obj);
                let tmpStr = '';
                for (let i of tmpLineStr) {
                    tmpStr += i.Text;
                }
                // console.dir('>>>>>>>>>>>>>>>>>>>>>start:'+obj)
                let re = await generalSql(tmpStr);//递归本身
                // console.dir('<<<<<<<<<<<<<<<<<<<<<<<<<end:'+obj)

                //  console.dir('第几层:'+aa)
                /*  console.dir('递归对象:'+obj);
                 console.dir('递归结果:'+dependency) */

                returnResult.c = returnResult.c.concat(re.c);
                returnResult.u = returnResult.u.concat(re.u);
                returnResult.r = returnResult.r.concat(re.r);
                returnResult.d = returnResult.d.concat(re.d);
                // console.dir('coutJ:'+tableArray)
            }
        }
    }

    return returnResult;

}


let generalSql = async function (str) {
    console.dir('55555555555555555')
    let returnResult = { c: [], u: [], r: [], d: [] }
    nonTable = []

    // from/join
    let Rreg = /(?<=(from|join)\s+\[?)([^,\s\(\)\[\]]+)(?=\]?[\s\(])/ig

    //update
    let Ureg = /(from|update)\s+\[?([^,\s\(\)\[\]]+)\]?(?=[\s])/ig

    //delete
    let Dreg = /(from|delete)\s+\[?([^,\s\(\)\[\]]+)\]?(?=[\s])/ig

    //insert into
    let Creg = /(from|into)\s+\[?([^,\s\(\)\[\]]+)\]?(?=[\s])/ig

    //存储过程
    let Ereg = /(?<=exec)\s+\[?([^,\s\(\)\[\]]+)\]?(?=[\s])/ig

    let proc = function (a) {
        a = a.map(
            v => v.split((/[\s]/)).filter(
                v => (v == '') ? false : true).map(
                    v => v.replace(/[\[\]]/g, '')
                )
        )

        a = Array.prototype.concat.apply([], a)
        return a
    }


    //改U
    let a = (str.match(Ureg)==null)?[]:str.match(Ureg)
    a = proc(a)
    let u = []
    a.forEach((element, index, arr) => {
        if (element != 'update') {
            return;
        }
        if (arr[index + 1].length <= 2) {
            u.push(arr[index + 3])
        } else {
            u.push(arr[index + 1])
        }
    });
    u.map(v=>v.split('.').pop())

    //删D
    let m = (str.match(Dreg)==null)?[]:str.match(Dreg)
    m = proc(m)
    let d = []
    m.forEach((element, index, arr) => {
        if (element != 'delete') {
            return;
        }
        if (arr[index + 1].length <= 2) {
            d.push(arr[index + 3])
        } else {
            d.push(arr[index + 1])
        }
    });
    d.map(v=>v.split('.').pop())

    //增C
    let y = (str.match(Creg)==null)?[]:str.match(Creg)
    y = proc(y)
    let c = []
    y.forEach((element, index, arr) => {
        if (element != 'into') {
            return;
        }
        if (arr[index + 1].length <= 2) {
            c.push(arr[index + 3])
        } else {
            c.push(arr[index + 1])
        }
    });
    c.map(v=>v.split('.').pop())
    


    //R
    let r = (str.match(Rreg)==null)?[]:str.match(Rreg)
    r.map(v=>v.split('.').pop())
    


    let union = new Set([...c, ...u, ...d]);


    let difference = new Set(
        [...r].filter(x => !union.has(x))); r
    r = Array.from(difference);

    let k = diff(r)
    r = r.concat(k.table)
    
    nonTable = nonTable.concat(k.nonTable)

    //E
    let e = (str.match(Ereg)==null)?[]:str.match(Ereg)   
    e.map(v=>v.split('.').pop())
    nonTable = nonTable.concat(e)
console.dir('ss')
    console.dir([c,u,r,d,e])
    console.dir(nonTable)

    
    



    if (nonTable.length != 0) {
        for (let obj of nonTable) {
            let tmpLineStr = await queryFunc('exec sp_helptext ' + obj);
            let tmpStr = '';
            for (let i of tmpLineStr) {
                tmpStr += i.Text;
            }
            // console.dir('>>>>>>>>>>>>>>>>>>>>>start:'+obj)
            let re = await generalSql(tmpStr);//递归本身
            // console.dir('<<<<<<<<<<<<<<<<<<<<<<<<<end:'+obj)

            //  console.dir('第几层:'+aa)
            /*  console.dir('递归对象:'+obj);
             console.dir('递归结果:'+dependency) */

            returnResult.c = returnResult.c.concat(re.c);
            returnResult.u = returnResult.u.concat(re.u);
            returnResult.r = returnResult.r.concat(re.r);
            returnResult.d = returnResult.d.concat(re.d);
            // console.dir('coutJ:'+tableArray)
        }

    }

    console.dir('ss')
    console.dir([c,u,r,d,e])


    returnResult.c = returnResult.c.concat(c);
    returnResult.u = returnResult.u.concat(u);
    returnResult.r = returnResult.r.concat(r);
    returnResult.d = returnResult.d.concat(d);

    return returnResult

}

str = `ExecuteSQL(dtInfo,SELECT comp_NO,Comp_Name FROM cyerp.dbo.tblBase_SysComp
     where sh_status=1 and iscomp=1)
`
let abc=async function(){
    let s = await generalSql(str);
    console.dir(s)
}
abc()











//   node advance/filter.js
