
const queryFunc = require('./queryFuncDefine.js');  //这个是执行查询的函数
const centerControl = require('./centerControl.js'); //这个是中间处理的





//总调用执行
let abc = async function (moduleArray,former,later) {

    let add=[]
    moduleArray.forEach(element => {
        add.push(`'`+element.id+`'`)
    })  
    let para=`(`+add.join(',')+`)`

   
    let returnProcessStr=`
                                with selfben   --屬於自身的表
                            as(
                                select * from tableAdd
                            ),
                            dependency    --屬於依賴的表
                            as(
                                select * from tableDelete
                                union all
                                select * from tableUpdate
                                union all
                                select * from tableSelect
                            ),
                            dependencyLink  --根據自身表和依賴表形成依賴鏈
                            as(
                                select distinct
                                    a.formID as tarFormID,  --目標
                                    b.formID as souFormID   --源
                                    --a.tableName as tarTableName
                                    --b.tableName as souTableName    
                                from dependency a
                                left join selfben b on a.tableName=b.tableName
                                where a.formID <>b.formID 
                                --and a.formID='20080306120034'
                            ),
                            erp				--erp系統數據
                            as(
                                select 
                                    d.System_ID,
                                    d.System_Taiwan_Name,
                                    
                                    
                                    a.Module_ID,a.Module_Taiwan_Name,
                                    b.Function_ID,
                                    --b.Module_ID,
                                    b.Function_Taiwan_Name,
                                    --b.Function_Detail,
                                    c.Form_ID,c.Form_Taiwan_Name,
                                    isBusiness,isDisabled          --isBusiness 1是基礎數據,2是業務表單,3是無界面
                                    --ROW_NUMBER()over(order by a.System_ID,a.Module_ID,Function_ID,Form_ID) as ra
                                    from bsmaster..TBSF_Module a
                                    left join bsmaster..TBSF_Function  b on b.Module_ID=a.Module_ID
                                    left join bsmaster..TBSF_Form c on b.Function_Detail=c.Form_ID
                                    left join BsMaster..TBSF_System d on d.System_ID=a.System_ID
                                    
                                    where c.Form_ID is not null
                                    --order by a.System_ID,a.Module_ID,Function_ID,Form_ID
                            ),
                            result			--根據依賴鏈和erp系統表形成結果
                            as(
                                select 
                                
                                c.Form_Taiwan_Name as tarFormName,
                                b.Form_Taiwan_Name as souFormName,
                                
                                c.isBusiness as tarIsBusiness,
                                b.isBusiness as souIsBusiness,
                                
                                
                                c.isDisabled as tarIsDisabled,	
                                b.isDisabled as souIsDisabled,
                                
                                a.tarFormID as tarFormID,
                                a.souFormID as souFormID,	
                                
                                --a.tarTableName,
                                --a.souTableName,	

                                c.Module_Taiwan_Name as tarModuleName,	 --目標
                                c.Module_ID as tarModuleID,
                                
                                b.Module_Taiwan_Name as souModuleName,   --源
                                b.Module_ID as souModuleID
                                

                                from dependencyLink a	
                                left join erp c on a.tarFormID=c.Form_ID  --目標
                                left join erp b on a.souFormID=b.Form_ID  --源

                            )
                            --select * from dependencyLink 	 --where tarFormID='20101014100404'
                            --select * from result  where  souModuleID in '${para}'	
                            --select * from erp where Form_ID='20101014100404'	
    
    `
    let souInsert1=returnProcessStr+  //模块ID 
    `insert into acticle..tableTmp  
     select * from result  where  souModuleID in '${para}' `

    let souInsert2=returnProcessStr+  
    `insert into acticle..tableTmpFormID
            select souFormID from result  where  souModuleID in '${para}' `

    let souInsert3=       // 
    `insert into acticle..tableTmp
    select *         from result  where  tarFormID in (select * from acticle..tableTmpFormID) `

    let souInsert3=
    `insert into acticle..tableTmpFormID
    select souFormID from result  where  tarFormID in (select * from acticle..tableTmpFormID) `

    let deltmpFormID=`delecte acticle..tableTmpFormID`
    let deltmp=`delecte acticle..tableTmp`

    await queryFunc(deltmp)
    function a(){
        await queryFunc(souInsert1)

        await queryFunc(deltmpFormIDp)
        await queryFunc(souInsert2)

        for(let i=1;)


        
        await queryFunc(deltmp)
        await queryFunc(deltmp)
        await queryFunc(deltmp)
        await queryFunc(deltmp)
        await queryFunc(deltmp)
        await queryFunc(deltmp)
        await queryFunc(deltmp)

    }



    let re= await queryFunc(returnProcessStr)
  

    return re

  /*   //console.dir(a);
    var c = await insertData(a);
    console.dir('tttttttttttttttttttttttt')
    //console.dir(c.recordsets[0]);
    return c.recordsets[0];
 */
}
// module.exports = abc
 
 let kk = [
    { id: 'Module00001', text: '人事基础资料' },
    { id: 'Module00002', text: '工程基础资料' },
    { id: 'Module00002', text: '工程基础资料' },
    { id: 'Module00002', text: '工程基础资料' }
]   
abc(kk);  //这里不可以简化为匿名函数,不然报错,不知道是为什么


//   node advance/Dependence.js