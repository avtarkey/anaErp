/* 
ExecuteSQL	执行SQL----本身不能绑定审核流	ExecuteSQL(<返回值变量名>,< SQL语句>)
GetTableData	数据查询	GetTableData(<返回数据集变量名>,<表名称>,<字段列表>,<筛选条件>,<取记录数>)
InsertData	插入数据	InsertData(<新增ID返回值>,<新增数据表名称>,<赋值字段列表>,<启动审核否;申请人;申请部门> )
DeleteData	删除数据	DeleteData(<单据表名称>,<删除条件>) 
UpdateDataM	数据更新	UpdateDataM(<表名称>,<更改信息列表>,<更改条件>,<插入信息列表>,<变量名>)
*/


const queryFunc = require('./queryFuncDefine.js')

//定义工具函数

    //输入为数组,输出为表和非表对象,过滤非对象
    let diff = async function (arr) {
        //输入为数组

        //如果输入不规范,直接返回空
        if (arr == undefined || arr == null || arr.length == 0) {
            return { table: [], nonTable: [] }
        }

        let tableArray = new Array()                //存储依赖的表
        let nonTableArray = new Array()             //存储依赖的非表对象

        /**第一步 */
        let tmpDependencyObj = arr                  //arr赋值输入对象

        /**第二步,过滤非对象*/
        let dependencyObj = new Array();            //暂存经过过滤的对象
        
        for (let element of tmpDependencyObj) {     //这里将把select误添加的字段,进行过滤
            let para1 = `'` + element + `'`
            let para2 = `'` + element + `'`

            //查询是否是Cyerp中的对象
            let str1 = `use CyErp   SELECT Count(1) as total FROM sys.sysobjects WHERE name=${para1}`
            let tmpResultCyerp = await queryFunc(str1)

            //查询是否是Bsmaster中的对象
            let str2 = `use bsmaster  SELECT Count(1) as total FROM sys.sysobjects WHERE name=${para2}`
            let tmpResultBsMaster = await queryFunc(str2)    

            //如果渠道@Result=@Result+department_name+\,那么会出错,返回[],这时不是[{total:0}]的形式,就以这种形式判断
            if (tmpResultCyerp.length == 0 && tmpResultBsMaster.length == 0) {  
                continue
            }

            //如果是cyerp或msmaster中的对象,就把该对象添加进暂存数组中
            if (tmpResultCyerp[0].total != '0' || tmpResultBsMaster[0].total != '0') {
                dependencyObj.push(element)
            }
        }

        //对暂存数组中的对象进行分类,区分出表对象和非表对象
        /**第三步,分类表和非表对象 */
        for (let obj of dependencyObj) {
            let objStr = obj;
            let queryStr =  //这条语句是在所有用户表中查询该对象有几个,如果为零,表示这个对象不是表对象
                            //!!!!!!!!!!!!!!!!!!!这条语句只能判断这个对象是否是cyerp中的表,也就是说_tbsf_staff这个bsmaster中的表不能
                `   USE CyErp;          
                    SELECT  COUNT(1) as total
                    FROM sys.objects  
                    WHERE type_desc LIKE '%USER_TABLE%' 
                    and name='${objStr}'
            `
            let tmpResult = await queryFunc(queryStr)


             let queryStr2 =  //这条语句是在所有用户表中查询该对象有几个,如果为零,表示这个对象不是表对象
                            //!!!!!!!!!!!!!!!!!!!这条语句只能判断这个对象是否是cyerp中的表,也就是说_tbsf_staff这个bsmaster中的表不能
                `   USE BsMaster;          
                    SELECT  COUNT(1) as total
                    FROM sys.objects  
                    WHERE type_desc LIKE '%USER_TABLE%' 
                    and name='${objStr}'
            `
            let tmpResult2 = await queryFunc(queryStr2)

            if (tmpResult[0].total == '0' && tmpResult2[0].total== '0' ) {        //如果结果为零,表示该对象不是表  
                nonTableArray.push(obj)
            } else {
                tableArray.push(obj)                //不为零,表示该对象是表
            }
        }

        return { table: tableArray, nonTable: nonTableArray }
    }

    //名字修整,去掉空格和[]
    let proc = function (arr) { //这个函数是去掉 空格,[和]
        arr = arr.map(v => v.split((/[\s]/))
                .filter(v => (v == '') ? false : true)
                .map(v => v.replace(/[\[\]]/g, ''))
        )

        arr = Array.prototype.concat.apply([], arr)
        arr = arr.map(v => v.split('.').pop())
        return arr
    }

    //正常的查询方法
    let read = function (str) {
        // from/join
        let Rreg = /(?<=(from|join)\s+\[?)([^,\s\(\)\[\]]+)(?=\]?[\s\(])/ig //查
        //查R
        str = str.replace(/(fetch)\s+(next)\s+(from)\s+[^,\s\(\)\[\]]+\s+(into)\s+[^,\s\(\)\[\]]+/g, "")
        let r = (str.match(Rreg) == null) ? [] : str.match(Rreg)
        r = proc(r)

        r = r.map(v => v.split('.').pop())
        return r
    }

    //正常的修改方法
    let modify = function (str) {

        //update
        let Ureg =/(from|update|join)\s+\[?([^,\s\(\)\[\]]+)\]?\s+([^u,\s\(\)\[\]]*)(?=[\s])/ig   // 改 
        //上面的([^u是为了防止 from #dutytable cc
        // update cyerp..tbl_System_Post_Grant set dutyMan=substring 这种情况

        //改U
        str = str.replace(/(fetch)\s+(next)\s+(from)\s+[^,\s\(\)\[\]]+\s+(into)\s+[^,\s\(\)\[\]]+/g, "") //删除游标
        let a = (str.match(Ureg) == null) ? [] : str.match(Ureg)

        a = proc(a)

        try{ 
            let u = []
            a.forEach((element, index, arr) => {
                if (element != 'update') {
                    return;
                }
                let tmp = arr[index + 1]

                if (tmp.length <= 2) {
                    for (let i = index + 2; i <= arr.length - 1; i++) {
                        if (arr[i + 1] == tmp) {
                            u.push(arr[i])
                            break
                        }
                    }
                } else {
                    u.push(arr[index + 1])
                }
            });


            u = u.map(v => v.split('.').pop())

            return u
        }catch(err){

            console.log('正常方法修改错误,这个方法的接受的参数str:',str)
            console.log('中间的数据a:',a)
            throw err
        }
        
    }

    //正常的删除方法
    let dele = function (str) {
        //delete
        let Dreg = /(from|delete\s+from|join)\s+\[?([^,\s\(\)\[\]]+)\]?\s+([^,\s\(\)\[\]]+)(?=[\s])/ig   //删
        //删D
        str = str.replace(/(fetch)\s+(next)\s+(from)\s+[^,\s\(\)\[\]]+\s+(into)\s+[^,\s\(\)\[\]]+/g, "")
        let a = (str.match(Dreg) == null) ? [] : str.match(Dreg)

        a = proc(a)


        let u = []
        a.forEach((element, index, arr) => {
            if (element != 'delete') {
                return;
            }
            if (arr[index + 1] != 'from') {
                return;
            }
            //前面两个delete,from 表示必须delete 后面挨着from 采可以 
            // 因为  ExecuteSQL(,delete from  cyerp..tblbase_hr_holiday  where id=[SYSVAR$.ID]  delete from cyerp..tblbase_hr_holiday_sub where parentid=[SYSVAR$.ID])
            let tmp = arr[index + 2]

            if (tmp.length <= 2) {
                for (let i = index + 3; i <= arr.length - 1; i++) {
                    if (arr[i + 1] == tmp) {
                        u.push(arr[i])
                        break
                    }
                }
            } else {
                u.push(arr[index + 2])
            }
        });
        u = u.map(v => v.split('.').pop())


        return u
    }

    //正常的插入方法
    let add = function (str) {
        //insert into
        let Creg = /(from|into|join)\s+\[?([^,\s\(\)\[\]]+)\]?(\s+([^,\s\(\)\[\]]+))?(?=[\(\s])/ig   // 增 
        //增C
        str = str.replace(/(fetch)\s+(next)\s+(from)\s+[^,\s\(\)\[\]]+\s+(into)\s+[^,\s\(\)\[\]]+/g, "")

        let a = (str.match(Creg) == null) ? [] : str.match(Creg)


        a = proc(a)


        let u = []
        /*   console.dir("******************************")
        console.dir(a) */
        a.forEach((element, index, arr) => {
            if (element != 'into' || index == arr.length - 1) {
                return;
            }
            let tmp = arr[index + 1]
            /*    console.dir(element)
            console.dir(index) */

            if (tmp.length <= 2) {
                for (let i = index + 2; i <= arr.length - 1; i++) {
                    if (arr[i + 1] == tmp) {
                        u.push(arr[i])
                        break
                    }
                }
            } else {
                u.push(arr[index + 1])
            }
        });
        u = u.map(v => v.split('.').pop())
        u = u.filter(v => (v == 'into') ? false : true) //这里是过滤into,因为游标中的into,会导致into的误添加

        return u
    }

    //正常的执行存储过程
    let saveProc = function (str) {

        //存储过程
        let Ereg = /(?<=exec)\s+\[?([^,\s\(\)\[\]]+)\]?(?=[\s])/ig   // 存储过程
        //E
        let e = (str.match(Ereg) == null) ? [] : str.match(Ereg)
        e = proc(e)
        e = e.map(v => v.split('.').pop())
        return e
    }


//正常方法处理的入口
    let generalSql = async function (str,layer=2) {
        let delCommentReg=/--[^\r\n]*$/igm        
         let delCommentReg2=/(?<=\/\*)[\s\S]*?(?=\*\/)/ig
         str=str.replace(delCommentReg2,'')
         str=str.replace(delCommentReg,'')


       
        layer=layer-1 //layer是递归层数的定义,必须控制递归的深度,有的可能形成相互依赖,产生死锁,不能自己结束

        let returnResult = { c: [], u: [], r: [], d: [] }
        nonTable = []

        //1 修改
        let u = modify(str)
        if (u.length != 0) {
            returnResult.u = returnResult.u.concat(u)
        }

        //2 删除
        let d = dele(str)
        if (d.length != 0) {
            returnResult.d = returnResult.d.concat(d)
        }

        //3 添加
        let c = add(str)
        if (c.length != 0) {
            returnResult.c = returnResult.c.concat(c)
        }

        //4 查询
        let r = read(str)
   
       

        let union = new Set([...c, ...u, ...d]);
        let difference = new Set([...r].filter(x => !union.has(x)));   //在r中减去cud,对集合取差集
        r = Array.from(difference)


        //如果过滤之后还有剩  这里有一个需要注意的地方如果是非CyErp中的表,那么会被识别为非对象,进而不会保留!
        if (r.length != 0) {
            //因为只有查询才会有非表对象,或者非对象,所以进行过滤,并求递归依赖
            let k = await diff(r)   //只有在查询中存在非对象和非表对象,所以需要执行diff函数进行筛选和分类
            
            if (k.table.length != 0 || k.nonTable.length != 0) {
                returnResult.r = returnResult.r.concat(k.table)
                nonTable = nonTable.concat(k.nonTable)
            }
        }

        //5 存储过程
        let e = saveProc(str)
        if (e.length != 0) {

            nonTable = nonTable.concat(e)
        } 
        
                      /* console.log('current layer:',layer)
                    console.log('returnResult :',returnResult)
                    console.log('nonTable:',nonTable)  

                    return */
           
        

        //6 处理前面产生的非表对象,layer是递归层数
        if (nonTable.length != 0 && layer>0) {

            for (let obj of nonTable) {
                let tmpLineStr = await queryFunc('exec sp_helptext ' + obj);
                let tmpStr = '';
                for (let i of tmpLineStr) {
                    tmpStr += i.Text
                }

                let re = await generalSql(tmpStr,layer)  //递归本身  

                returnResult.c = returnResult.c.concat(re.c)
                returnResult.u = returnResult.u.concat(re.u)
                returnResult.r = returnResult.r.concat(re.r)
                returnResult.d = returnResult.d.concat(re.d)            
            }
        } 

        return returnResult
    }

    //解析函数
    let parse = async function (str) {

        //定义正则表达式

            //返回结果
            let returnResult = { c: [], u: [], r: [], d: [] }

            //增
            let Creg = /^InsertData\([^,]*,\[?([^,\(\)\[\]]+)\]?,/
            //查               
            let Rreg = /^GetTableData\([^,]*,\[?([^,\(\)\[\]]+)\]?,/
            //删           
            let Dreg = /^DeleteData\(\[?([^,\(\)\[\]]+)\]?,/
            //改
            let Ureg = /^UpdateDataM\(\[?([^,\(\)\[\]]+)\]?,/

            // executeSql 方法
            let Ereg = /^ExecuteSQL/

            //前面一个的子集,executeSql 里的直接执行视图或存储过程
            let reg = /^ExecuteSQL\([^,]*,(exec)?\s*\[?([^,\(\)\[\]]+CYERP[^,\(\)\[\]]+)\]?[\s\(,\)]/i
            //用是否函数cyerp来区别是一般的ececutesql还是特殊的executesql

        //使用正则表达式进行处理
            //增
            if (Creg.test(str)) {
                returnResult.c.push(str.match(Creg)[1])

                return returnResult
            }

            //查
            if (Rreg.test(str)) {
                returnResult.r.push(str.match(Rreg)[1])

                return returnResult
            }

            //删
            if (Dreg.test(str)) {
                returnResult.d.push(str.match(Dreg)[1])

                return returnResult
            }

            //改
            if (Ureg.test(str)) {
                returnResult.u.push(str.match(Ureg)[1])

                return returnResult
            }

            //属于存储executesql
            if (reg.test(str)) {
                //执行到这里说明是特殊的executesql        
            
                let tmp = { c: [], u: [], r: [], d: [] }    //存储返回值

                let m = str.match(reg)
                m = [m.pop()] //m[2]产生的是一个字符串,但是proc是处理数组所以这里加[] 
                m = proc(m)

                //console.log('this is m:',m)
            
                if (m != undefined || m != null || m.length != 0) {
                    m = await diff(m) //过滤非对象
                    m = m.nonTable //这里出来的结果只能是视图或者存储过程
                    if (m != []) {
                        for (let obj of m) {

                           // console.log('111111111111111111111obj:',obj)

                            let tmpLineStr = await queryFunc('exec sp_helptext ' + obj)
                            let tmpStr = ''
                            for (let i of tmpLineStr) {
                                tmpStr += i.Text
                            }                     
                            
                          //  console.log('3333333333333',tmpLineStr)
                           // console.log('1111111111111111111111tmpStr:',tmpStr

                            let r = await generalSql(tmpStr)        //递归本身
                            tmp = r  
                         
                        }
                    }
                }

                let c = tmp.c.length + tmp.u.length + tmp.r.length + tmp.d.length
                if (c != 0) {
                    returnResult.c = returnResult.c.concat(tmp.c)
                    returnResult.u = returnResult.u.concat(tmp.u)
                    returnResult.r = returnResult.r.concat(tmp.r)
                    returnResult.d = returnResult.d.concat(tmp.d)
                    return returnResult
                }
            }

            //属于一般executesql
            if (Ereg.test(str)) {
                let tmp = { c: [], u: [], r: [], d: [] }    //存储返回值

                //首先做一般的executesql处理
                let k = await generalSql(str)
                let m = k.c.length + k.u.length + k.r.length + k.d.length
                if (m != 0) {
                    tmp = k   

                    returnResult.c = returnResult.c.concat(tmp.c)
                    returnResult.u = returnResult.u.concat(tmp.u)
                    returnResult.r = returnResult.r.concat(tmp.r)
                    returnResult.d = returnResult.d.concat(tmp.d)
                    return returnResult
                }
            }

            //如果进行到了这一步,说明是不是表单中的方法,是视图定义
            let t = await generalSql(str)

            returnResult.c = returnResult.c.concat(t.c)
            returnResult.u = returnResult.u.concat(t.u)
            returnResult.r = returnResult.r.concat(t.r)
            returnResult.d = returnResult.d.concat(t.d)

            return returnResult
    }


let builtInCURD = async function (str) {
    let returnResult = await parse(str)


    //过滤#号临时表
    returnResult.c = returnResult.c.filter(v => /\#/.test(v) ? false : true)
    returnResult.u = returnResult.u.filter(v => /\#/.test(v) ? false : true)
    returnResult.r = returnResult.r.filter(v => /\#/.test(v) ? false : true)
    returnResult.d = returnResult.d.filter(v => /\#/.test(v) ? false : true)

    //将字符串全部转换为小写
    returnResult.c = returnResult.c.map(v => v.toLowerCase())
    returnResult.u = returnResult.u.map(v => v.toLowerCase())
    returnResult.r = returnResult.r.map(v => v.toLowerCase())
    returnResult.d = returnResult.d.map(v => v.toLowerCase())

    //数组去重
    returnResult.c = Array.from(new Set(returnResult.c))
    returnResult.u = Array.from(new Set(returnResult.u))
    returnResult.r = Array.from(new Set(returnResult.r))
    returnResult.d = Array.from(new Set(returnResult.d))

    return returnResult
}

/* 
入口parse的
            属于存储executesql(generalSql)-->generalSql(generalSql)
            属于一般executesql(generalSql)-->generalSql(generalSql)

 */


 module.exports = builtInCURD

/* let str =`ExecuteSQL(VarList,execute CYERP.dbo.stWarehouse_Materiel_Consume_memo [Form$.MainForm.TextBox2],
[Form$.MainForm.TextBox3],[Form$.MainForm.TextBox5],[Form$.MainForm.ComboBox4],
[Form$.MainForm.ComboBox6],[Form$.MainForm.TextBox7],[Form$.MainForm.ComboBox8],
[Form$.MainForm.TextBox9],[Form$.MainForm.TextBox10],[Form$.MainForm.ComboBox11],
[Form$.MainForm.ComboBox12],[Form$.MainForm.DateBox31],[Form$.MainForm.ComboBox14],
[Form$.MainForm.ComboBox15],[Form$.MainForm.TextBox16],[Form$.MainForm.DateTimeBox17],
[Form$.MainForm.DateTimeBox18],[Form$.MainForm.CheckBox20],[VAR$.TempLotName],[Form$.MainForm.ComboBox19],
[Form$.MainForm.ComboBox55],[Form$.MainForm.CheckBox55],[Form$.MainForm.ComboBox15],[SYSVAR$.Staff_ID])` */

/* let aaa=async function(){
    let a=await builtInCURD(str)
console.log('result:',a)
}
aaa() */ 

//   node ./advance/filter.js



