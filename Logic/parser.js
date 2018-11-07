/**
 * 这个模块就一个函数，它接受一个字符串，返回一个数组，数组的元素是依赖的表名，格式：[ 'readidcard' ]
 */

/* let sqlStr=` ExecuteSQL(
    data,  select  a.NAME 姓名,a.SEX 性別,a.BRITHDAY 出生日期,a.IDCARD 身份證號碼,a.NATION 民族,a.BEGINTIME 身份證開始日期,a.ENDTIME 身份證結束日期,a.ADRESS 地址,  a.Link_Pro,a.soureType  ,a.Enter_time,a.Link_Phone 
    from CyErp..readidcard a
     where  a.IDCARD like '%{[Form$.MainForm.TextBox6]}%' 
     and a.NAME like '%{[Form$.MainForm.TextBox8]}%'  
     and  (1=case when  [Form$.MainForm.ComboBox7]='所有' 
     or [Form$.MainForm.ComboBox7]=''   
     then 1 when a.SEX=[Form$.MainForm.ComboBox7] 
     
     then 1 else 0 end) and isnull(a.isdelete,0)=0      order by a.Enter_time desc) ` */

let ana = function (sqlStr) {

  //转化为数组
  //插入空格
  let inNon=sqlStr.replace(/\(/g, " ( ").replace(/\)/g, " ) ").replace(/\]/g, " ] ").replace(/\[/g, " [ ").replace(/\r\n/g,'').replace(/\n/g,'');//替换回车换行
  
  let splt = inNon.split(/[,\s]/);//使用.和空格分割
  let trm = splt.map((str) => { return str.replace(/(^\s*)|(\s*$)/g, "") }) //去掉前后空格
  
  let flt = trm.filter((x) => { return x != '' }) //过滤




    //对内部进行过滤
    let inextr = function (arr) {

        let stack=new Array();
        let resultSet=new Array();
        for(let key in arr)
        {
            //这里主要是跳过arr[0],因为arr[0],不是字符串，不能进行.toLowerCase()
            if(stack.length==0)
            {
                stack.push(arr[key]); 
                continue;
            }

            //转化为小写比较
            if((stack[stack.length-1].toLowerCase()=='from' || stack[stack.length-1].toLowerCase()=='join') && arr[key]!='(' && stack.length>=2)

            {
                resultSet.push(arr[key].split('.').pop())

            }
            stack.push(arr[key]);     


        }
        return resultSet;
       
              
    }

    return inextr(flt);

}


module.exports =ana;

//console.log(ana(sqlStr));



