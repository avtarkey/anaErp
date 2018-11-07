

let recurce = async function (defineStr) {    
 

    let tableArray = new Array(); //存储依赖的表
    let nonTableArray = new Array(); //存储依赖的非表对象

    let tmpDependencyObj =  ana(defineStr);//解析传入的定义字符串,取出依赖的对象  


    if (tmpDependencyObj.length == 0) {  //为空就退出
        return tableArray
    }

   
    let dependencyObj = new Array();  //接受经过过滤的对象
    for (let element of tmpDependencyObj) { //这里将把select误添加的字段,进行过滤
        let para1=`WHERE name= '`+element+`'`;
        let para2=`WHERE name= '`+element+`'`;

        let str1=` SELECT Count(1) as total FROM sys.sysobjects  ${para1}`
      

        let tmpResultCyerp = await queryFunc(str1);
     
       
        let str2=` use bsmaster  SELECT Count(1) as total FROM sys.sysobjects ${para2}`
   
        let tmpResultBsMaster = await queryFunc(str2);     
       
 
        
      
        if(tmpResultCyerp.length==0 && tmpResultBsMaster.length==0){  //如果渠道@Result=@Result+department_name+\,那么会出错,返回[],这时不是[{total:0}]
      
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
           // console.dir('_____nonTableArray:'+nonTableArray);


        } else {
            tableArray.push(obj);//不为零,表示该对象是表
        
        }
  
    }




    if (nonTableArray.length != 0) {//对nonTableArray中存储的非表对象进行递归解析,直至取出所有的表对象为止
        for (let obj of nonTableArray) {
         
            

            let tmpLineStr = await queryFunc('exec sp_helptext ' + obj);


            let tmpStr = '';
            for (let i of tmpLineStr) {
                tmpStr += i.Text;
            }
      
            let dependency = await recurce(tmpStr);//递归本身
          

            let tmpArray = new Array();
            tmpArray = tableArray.concat(dependency);//将取出的表对象附加到tableArray中
            tableArray = tmpArray;
          
        }
    }
}