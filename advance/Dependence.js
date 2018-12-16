
const queryFunc = require('./queryFuncDefine.js');  //这个是执行查询的函数
const centerControl = require('./centerControl.js'); //这个是中间处理的





//总调用执行
let abc = async function (moduleArray, former = 1,later=1 ) {

    let add = []
    moduleArray.forEach(element => {
        add.push(`'` + element.id + `'`)
    })
    let para = add.join(',')

   // console.log('parameter:', para)

    let souInsert1 =
        `
        delete acticle..tableTmp    
        
        insert into acticle..tableTmp  
        select * from acticle..tableResult 
        where  1=1
        and tarModuleID in (${para},'Module00236')   and souModuleID  in (${para},'Module00236')  

        and not (tarModuleID  in ('Module00236') and  souModuleID  in ('Module00236') )
        
        delete acticle..tableTmp3

        insert into acticle..tableTmp3
        select souFormID from acticle..tableResult  
        where  1=1
        and tarModuleID in (${para},'Module00236')   and souModuleID  in (${para},'Module00236')  
        
        and not (tarModuleID  in ('Module00236') and  souModuleID  in ('Module00236') )
    `

    let souInsert2 =    // 输出
        `insert into acticle..tableTmp
        select *         from acticle..tableResult  where  tarFormID in (select * from acticle..tableTmp3) 
    
        delete acticle..tableTmpFormID
        
        insert into acticle..tableTmpFormID
        select souFormID from acticle..tableResult  where  tarFormID in (select * from acticle..tableTmp3) 
        
        delete acticle..tableTmp3
        
        insert into acticle..tableTmp3
        select formID from acticle..tableTmpFormID  `
    
    
        let souInsert3 =
        `
        delete acticle..tableTmp3

        insert into acticle..tableTmp3
        select tarFormID from acticle..tableResult  
        where  1=1
        and tarModuleID in (${para},'Module00236')   and souModuleID  in (${para},'Module00236')  
        
        and not (tarModuleID  in ('Module00236') and  souModuleID  in ('Module00236') )
    `

    let souInsert4 =    // 输出
        `insert into acticle..tableTmp
        select *         from acticle..tableResult  where  souFormID in (select * from acticle..tableTmp3) 
    
        delete acticle..tableTmpFormID
        
        insert into acticle..tableTmpFormID
        select tarFormID from acticle..tableResult  where  souFormID in (select * from acticle..tableTmp3) 
        
        delete acticle..tableTmp3
        
        insert into acticle..tableTmp3
        select formID from acticle..tableTmpFormID  `



    async function a() {
        //console.log('souInsert1:', souInsert1)
        await queryFunc(souInsert1)

        for (let i = 1; i <= later; i++) {
            await queryFunc(souInsert2)
           // console.log('souInsert2:', souInsert2)
        }
        await queryFunc(souInsert3)

        for (let i = 1; i <= former; i++) {
            await queryFunc(souInsert4)
           // console.log('souInsert2:', souInsert2)
        }
    }

    await a()

    let qStr = `;with my as(
        SELECT distinct
         [tarFormName]
              ,[souFormName]
              ,[tarIsBusiness]
              ,[souIsBusiness]
              ,[tarIsDisabled]
              ,[souIsDisabled]
              ,[tarFormID]
              ,[souFormID]
              ,[tarModuleName]
              ,[tarModuleID]
              ,[souModuleName]
              ,[souModuleID]
              ,[tag]
          FROM [acticle].[dbo].[tableTmp]
          ),
          you as(
          select 
           [tarFormName]
              ,[souFormName]
              ,[tarIsBusiness]
              ,[souIsBusiness]
              ,[tarIsDisabled]
              ,[souIsDisabled]
              ,[tarFormID]
              ,[souFormID]
              ,[tarModuleName]
              ,[tarModuleID]
              ,[souModuleName]
              ,[souModuleID]
              ,case when SUM(convert(int,[tag]))=2 then 'D'
                    when SUM(convert(int,[tag]))=4 then 'U'
                    when SUM(convert(int,[tag]))=8 then 'S'
                    when SUM(convert(int,[tag]))=10 then 'SD'
                    when SUM(convert(int,[tag]))=12 then 'SU'
                    when SUM(convert(int,[tag]))=14 then 'SUD'
                    when SUM(convert(int,[tag]))=6 then 'UD'
                    else ''
                end tag
          from my
          group by  [tarFormName]
              ,[souFormName]
              ,[tarIsBusiness]
              ,[souIsBusiness]
              ,[tarIsDisabled]
              ,[souIsDisabled]
              ,[tarFormID]
              ,[souFormID]
              ,[tarModuleName]
              ,[tarModuleID]
              ,[souModuleName]
              ,[souModuleID]
          )
          select * from you 
    `
    let re = await queryFunc(qStr)
    console.log('run end!')
    //console.log('re:',re)

    return re

    /*   //console.dir(a);
      var c = await insertData(a);
      console.dir('tttttttttttttttttttttttt')
      //console.dir(c.recordsets[0]);
      return c.recordsets[0];
   */
}
 module.exports = abc
/* async function ccc(){
    let kk = await abc( [ { id: 'Module00035', text: '制程管理' } ], '1', '1');  //这里不可以简化为匿名函数,不然报错,不知道是为什么
    console.log('kk:',kk)
}
ccc()
 */

//   node advance/Dependence.js