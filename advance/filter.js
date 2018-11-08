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

    /**第一步 */

    let tmpDependencyObj = arr //输入对象,里面存在非表,非视图,存储过程的对象


    if (tmpDependencyObj.length == 0) {  //为空就退出
        return tableArray
    }

    /**第二步,过滤非对象*/

    let dependencyObj = new Array();  //接受经过过滤的对象,第一阶段输出数组,过滤非数据库对象

    for (let element of tmpDependencyObj) { //这里将把select误添加的字段,进行过滤
        let para1 = `'` + element + `'`;
        let para2 = `'` + element + `'`;

        let str1 = `use CyErp   SELECT Count(1) as total FROM sys.sysobjects WHERE name=${para1}`


        let tmpResultCyerp = await queryFunc(str1);


        let str2 = `use bsmaster  SELECT Count(1) as total FROM sys.sysobjects WHERE name=${para2}`

        let tmpResultBsMaster = await queryFunc(str2);
        
      /*   console.dir(str1)
        console.dir(tmpResultCyerp)
        console.dir(str2)
        console.dir(tmpResultBsMaster)
        return;   */

        if (tmpResultCyerp.length == 0 && tmpResultBsMaster.length == 0) {  //如果渠道
            //@Result=@Result+department_name+\,那么会出错,返回[],这时不是[{total:0}]
            //的形式,就以这种形式判断
            continue;
        }
        if (tmpResultCyerp[0].total != '0' || tmpResultBsMaster[0].total != '0') {
            dependencyObj.push(element);

        }
    }



    /**第三步,分类表和非表对象 */

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

let proc = function (a) { //这个函数是去掉 空格,[和]
        a = a.map(
            v => v.split((/[\s]/)).filter(
                v => (v == '') ? false : true).map(
                    v => v.replace(/[\[\]]/g, '')
                )
        )

        a = Array.prototype.concat.apply([], a)
        return a
}

let read=function(str){
      // from/join
    let Rreg = /(?<=(from|join)\s+\[?)([^,\s\(\)\[\]]+)(?=\]?[\s\(])/ig //查
    //查R
    let r = (str.match(Rreg)==null)?[]:str.match(Rreg)
    r=proc(r) 

    r=r.map(v=>v.split('.').pop()) 
    return r
}

let modify=function(str){
    
    //update
    let Ureg = /(from|update)\s+\[?([^,\s\(\)\[\]]+)\]?(?=[\s])/ig   // 改
    
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
    u=u.map(v=>v.split('.').pop())
    return u
}

let dele=function(str){
           //delete
    let Dreg = /(from|delete)\s+\[?([^,\s\(\)\[\]]+)\]?(?=[\s])/ig   //删
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
    d=d.map(v=>v.split('.').pop())
    return d
}

let add=function(str){
    //insert into
    let Creg = /(from|into)\s+\[?([^,\s\(\)\[\]]+)\]?(?=[\s\(])/ig   // 增 
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
    c=c.map(v=>v.split('.').pop())
       
    
    return c

}

let saveProc=function(str){
    
    //存储过程
    let Ereg = /(?<=exec)\s+\[?([^,\s\(\)\[\]]+)\]?(?=[\s])/ig   // 存储过程
        //E
    let e = (str.match(Ereg)==null)?[]:str.match(Ereg)   
    e=proc(e)
    e=e.map(v=>v.split('.').pop())
    return e
}





let builtInCURD = async function (str) {
    let Creg = /^InsertData\([^,]*,\[?([^,\(\)\[\]]+)\]?,/                 //增
    let Rreg = /^GetTableData\([^,]*,\[?([^,\(\)\[\]]+)\]?,/             //查
    let Dreg = /^DeleteData\([^,]*,\[?([^,\(\)\[\]]+)\]?,/          //删

    let Ureg = /^UpdateDataM\(\[?([^,\(\)\[\]]+)\]?,/       //改

    let Ereg = /^ExecuteSQL/        // executeSql 方法

    let reg = /^ExecuteSQL\([^,]*,(exec)?\[?([^,\(\)\[\]]+)\]?[\s\()]/      //executeSql 里的直接执行视图或存储过程

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

  

    let returnResult = { c: [], u: [], r: [], d: [] }
    nonTable = []

  
  
    let u=modify(str)
    if(u.length!=0){
         returnResult.u = returnResult.u.concat(u) 
    }  

    let d=dele(str)
    if(d.length!=0){
        returnResult.d = returnResult.d.concat(d) 
    }

    let c=add(str)
    if(c.length!=0){
        returnResult.c = returnResult.c.concat(c)  
    }

    
    
    

    let r=read(str)
   
    
    let union = new Set([...c, ...u, ...d]);
    let difference = new Set( [...r].filter(x => !union.has(x)));    //在r中减去cud
    r = Array.from(difference);
     
    

    let k =await diff(r)   //只有在查询中存在非对象和非表对象,所以需要执行diff函数进行筛选和分类
  
  
    returnResult.r = returnResult.r.concat(k.table)    
    nonTable = nonTable.concat(k.nonTable) 



    

    let e=saveProc(str)
    if(e.length!=0){
         nonTable = nonTable.concat(e)
    }
   




/*  
    console.dir('ss111111111111111')
    console.dir(returnResult)
    console.dir(nonTable) 
     */



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
         // console.dir('递归对象:'+obj);
           //  console.dir('递归结果:'+dependency) 

            returnResult.c = returnResult.c.concat(re.c);
            returnResult.u = returnResult.u.concat(re.u);
            returnResult.r = returnResult.r.concat(re.r);
            returnResult.d = returnResult.d.concat(re.d);
            // console.dir('coutJ:'+tableArray)
        }

    }  

  //  console.dir('ss')





     return returnResult 

}






str = `ExecuteSQL(,update  b set  b.AccountStock=b.AccountStock-a.ActualNum  
from  tblWarehouse_Material_Amount_Draw_item  a 
 inner join  tblWarehouse_Stock_Materiel  b  on  a.MaterialNO=b.MaterialNo 
  where  a.id=[VAR$.GetDetail.SubID])
`
let abc=async function(){
    let s = await generalSql(str);
    console.dir(s)
}

//[ 'tblHR_DimissionReason', 'tblHR_MonthAttendance' ]
abc()
//   node advance/filter.js

//console.dir(read(str))






