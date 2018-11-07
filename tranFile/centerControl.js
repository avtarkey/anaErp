


/**
 * 这个是数据库访问模块，只有一个函数，根据查询语句返回结果数组
 */


//异步返回
let Ut = require("./common");

var ana = require('./NewParse.js');
var queryFunc = require('./queryFuncDefine');

let aa=0;

/* let Ut = require("./common");
let t1=0; */


/**
 * 返回定义语句依赖的对象,也就是从定义语句中取出对象
 * @param {传入的是对象的定义语句} defineStr 
 */
let recurce = async function (defineStr) {    
    //aa+=1;

    let tableArray = new Array(); //存储依赖的表
    let nonTableArray = new Array(); //存储依赖的非表对象

    let tmpDependencyObj =  ana(defineStr);//解析传入的定义字符串,取出依赖的对象  
  /*   console.dir('tmpDependencyObj:') 
    console.dir(tmpDependencyObj)   */

    if (tmpDependencyObj.length == 0) {  //为空就退出
        return tableArray
    }

    //
    let dependencyObj = new Array();  //接受经过过滤的对象
    for (let element of tmpDependencyObj) { //这里将把select误添加的字段,进行过滤
        let para1=`WHERE name= '`+element+`'`;
        let para2=`WHERE name= '`+element+`'`;

        let str1=` SELECT Count(1) as total FROM sys.sysobjects  ${para1}`
        //console.dir(str1)

        let tmpResultCyerp = await queryFunc(str1);
       // await Ut.sleep(1000)
       
        let str2=` use bsmaster  SELECT Count(1) as total FROM sys.sysobjects ${para2}`
        //console.dir(str2)
        let tmpResultBsMaster = await queryFunc(str2);
       // await Ut.sleep(1000)
       
         /*     console.dir('element:')
            console.dir(element)

        console.dir('tmpResultCyerp:')
        console.dir(tmpResultCyerp)

        console.dir('tmpResultBsMaster:')
        console.dir(tmpResultBsMaster)  */
 
        
      
        if(tmpResultCyerp.length==0 && tmpResultBsMaster.length==0){  //如果渠道@Result=@Result+department_name+\,那么会出错,返回[],这时不是[{total:0}]
        //的形式,就以这种形式判断
            continue;
        }

        if (tmpResultCyerp[0].total != '0' || tmpResultBsMaster[0].total != '0') {
            dependencyObj.push(element);
          
        }
      //  console.log('33333333333333333333333过滤后的')
      // console.dir(dependencyObj);
     //   console.log('444444444444444444444444444444') 

    }


   // console.dir('dependencyObj:'+dependencyObj)
//console.dir('*******************')
  //  console.dir('recurse inner :  ' + dependencyObj);
   // console.dir('^^^^^^^^^^^^^^^^^^^^')
    


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


        /* 
                if(tmpResult.length==0){ //这里主要是针对select 选择是,可能把函数和字段混在一起,如果是字段,
                    //那么'exec sp_helptext ' + obj执行返回[],这个运行到这个语句是直接跳过,如果是函数返回不是空数组,则继续向下执行
                    continue;
                } */
             //   console.dir(queryStr)
              //  console.dir(tmpResult)
               // console.dir(tmpResult[0].total)

        if (tmpResult[0].total == '0') {//如果结果为零,表示该对象不是表
            nonTableArray.push(obj);
           // console.dir('_____nonTableArray:'+nonTableArray);


        } else {
            tableArray.push(obj);//不为零,表示该对象是表
           // console.dir('_++++++++tableArray:'+tableArray)
        }
       // console.dir('nonTableArray:'+nonTableArray);
       // console.dir('tableArray:'+tableArray)
    }
//console.dir('*************************************************************************')
//console.dir('第几层:'+aa)
/*      console.dir('tableArray:' + tableArray);
     console.dir('nonTableArray:' + nonTableArray) */



    if (nonTableArray.length != 0) {//对nonTableArray中存储的非表对象进行递归解析,直至取出所有的表对象为止
        for (let obj of nonTableArray) {
           // console.dir('------------------')
            

            let tmpLineStr = await queryFunc('exec sp_helptext ' + obj);


            let tmpStr = '';
            for (let i of tmpLineStr) {
                tmpStr += i.Text;
            }
            //console.dir(tmpStr);

           // console.dir('>>>>>>>>>>>>>>>>>>>>>start:'+obj)
            let dependency = await recurce(tmpStr);//递归本身
           // console.dir('<<<<<<<<<<<<<<<<<<<<<<<<<end:'+obj)

          //  console.dir('第几层:'+aa)
           /*  console.dir('递归对象:'+obj);
            console.dir('递归结果:'+dependency) */

            let tmpArray = new Array();
            tmpArray = tableArray.concat(dependency);//将取出的表对象附加到tableArray中
            tableArray = tmpArray;
           // console.dir('coutJ:'+tableArray)
        }
    }

    // console.dir('3:' + tableArray)
    return tableArray;//返回所有的依赖表


}



let centerControl = async function (dependency) {

  

    let resultArray = new Array();
  


    for (const item of dependency) {        

        /*   console.dir('*****************循环开始*****************************')
          console.dir(item.Form_Taiwan_Name); */

        let tmpArray = new Array(); //存储每个表单的依赖表数组

        if (item.typ == 'tbl') { //如果是表
            console.dir('tbl')
            tmpArray.push(item.Table_Name);
           // console.dir(item.Table_Name);
            //console.dir(tmpArray);


        } else if (item.typ == 'vw') { //如果是视图
            console.dir('vw')
           // console.dir(item.Table_Name)

            let viewDefineStrLine = await queryFunc('exec sp_helptext ' + item.Table_Name);//视图的定义语句是一行一行的

            let viewDefineStr = '';
            for (let i of viewDefineStrLine) {
                viewDefineStr += i.Text;
            }
            // console.dir(viewDefineStr)
            // console.dir('view:::'+viewDefineStr)
            tmpArray = await recurce(viewDefineStr);


        } else if (item.typ == 'esql') { //如果是方法
            console.dir('esql +++++++++++++++++++++++++++++++++++++++++++++')
           // console.dir(item.Table_Name)
            tmpArray = await recurce(item.Table_Name)
            console.dir('esql denpendency: ')
            console.dir( tmpArray)
            console.dir('______________________________________________________')

        } else {

        }
        //console.dir(`tmpArray数量` + tmpArray.length)
        //console.dir(tmpArray);
       // console.dir(`tmpArray类型` + typeof (tmpArray));

        for (const element of tmpArray) {
            let tmpObj = {};
            tmpObj.FormID = item.Form_ID;

            tmpObj.TableName = element;
            resultArray.push(tmpObj);
        }
        // console.dir('*************************循环结束*********************************')
    }
    return resultArray;
}




 module.exports = centerControl;

/*  let abc = async function () {
    let ss = await recurce(
    `ExecuteSQL(DetailData,cyerp..stqa_rejectmodify_Search [Form$.MainForm.DateBox32],[Form$.MainForm.ComboBox39],[Form$.MainForm.ComboBox37],[Form$.MainForm.ComboBox36],[Form$.MainForm.ComboBox40],[Form$.MainForm.IntegerBox38],[Form$.MainForm.ComboBox42],[Form$.MainForm.ComboBox41])`
    )
    console.dir(ss);
    console.dir('end')
}
abc();  */  


//  node tranFile/centerControl.js




