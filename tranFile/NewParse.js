

/**
 * 这个模块就一个函数，它接受一个字符串，返回一个数组，数组的元素是依赖的表名，格式：[ 'readidcard' ]
 */

/*  let sqlStr=` ExecuteSQL(
    data,  select  a.NAME 姓名,a.SEX 性別,a.BRITHDAY 出生日期,a.IDCARD 身份證號碼,a.NATION 民族,a.BEGINTIME 身份證開始日期,a.ENDTIME 身份證結束日期,a.ADRESS 地址,  a.Link_Pro,a.soureType  ,a.Enter_time,a.Link_Phone 
    from CyErp..readidcard a
     where  a.IDCARD like '%{[Form$.MainForm.TextBox6]}%' 
     and a.NAME like '%{[Form$.MainForm.TextBox8]}%'  
     and  (1=case when  [Form$.MainForm.ComboBox7]='所有' 
     or [Form$.MainForm.ComboBox7]=''   
     then 1 when a.SEX=[Form$.MainForm.ComboBox7] 
     from abc(  'dfdfd'   )
     then 1 else 0 end) and isnull(a.isdelete,0)=0      order by a.Enter_time desc) `  */

let ana = function (sqlStr) {

    //转化为数组
    //插入空格

    /** 在括号()和[]两边添加空格,同时把回车换行删除*/
    let inNon = sqlStr.replace(/\(/g, " ( ").replace(/\)/g, " ) ").replace(/\]/g, " ] ").replace(/\[/g, " [ ").replace(/\r\n/g, '').replace(/\n/g, '');//替换回车换行

    let splt = inNon.split(/[,\s]/);//使用.和空格分割
    let trm = splt.map((str) => { return str.replace(/(^\s*)|(\s*$)/g, "") }) //去掉每个项的前后空格

    let flt = trm.filter((x) => { return x != '' }) //过滤空




    //对内部进行过滤
    let inextr = function (arr) {
        //如果传入参数arr不是字符串会保replace不是函数的错误
        let stack = new Array();
        stack.push('a','a');//这里子所以要push这两个无用的的'a',主要是为了兼容(stack[stack.length - 2].toLowerCase() == 'from'这个代码否则或报错
        let resultSet = new Array();

        for (let key in arr) {
            //这里主要是跳过arr[0],因为arr[0],不是字符串，不能进行.toLowerCase()

            if (stack.length == 0)  //这里的含义是存储当前处理项的前面的字符
            {
                stack.push(arr[key]);
                continue;
            }

            //转化为小写比较 如果前一个是from或join或exec且当前项不是'('
            if (
                (
                    stack[stack.length - 1].toLowerCase() == 'from'
                    || stack[stack.length - 1].toLowerCase() == 'select' //这里主要是针对函数,因为函数可以是这样 select myfunc(a,b,c),如果这里误将字段当成函数取出,在centerControl.js的recurce方法他会进行过滤,这个不用担心
                
                    || stack[stack.length - 1].toLowerCase() == 'delete'                  
                    
                    || stack[stack.length - 1].toLowerCase() == 'join'
                    || stack[stack.length - 1].toLowerCase() == 'exec'
                    || stack[stack.length - 1].toLowerCase() == 'update'
                    || (stack[stack.length - 2].toLowerCase() == 'from' &&  stack[stack.length - 1].toLowerCase() == '[')
                    || arr[key].search("cyerp") != -1
                    || arr[key].search("tbl") != -1

                )
                && arr[key] != '('
                && arr[key] != '['
            ) {
                //把符合条件的插入结果集
                resultSet.push(arr[key].split('.').pop())  //这里的 arr[key].split('.').pop()主要是针对'CyErp..readidcard'这种情况,通过.分割,尾部弹出pop()

            }


            stack.push(arr[key]);
        }

        return resultSet;

    }

    return inextr(flt);

}


module.exports = ana;

      //console.log(ana(sqlStr));

      //ana(sqlStr);
      //node tranFile/NewParse.js



