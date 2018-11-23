
const queryFunc = require('./queryFuncDefine.js');  //这个是执行查询的函数
const centerControl = require('./centerControl.js'); //这个是中间处理的



//根据模块ID数组,求出所有的依赖,并插入##all数据表,将排序放入##allrank表
let moduleDependence = async function (mdArray) {
    
    //1 创建保存数据的全局临时表
    let createContainerStr=`
                            delete ##all
                            delete ##allrank


                            delete ##tableAdd

                            delete ##tableDelete
                            delete ##tableUpdate

                            delete ##tableSelect    
    
    `
    await queryFunc(createContainerStr,1) 

   let i=1

    //2 循环每个模块ID,把每个模块的以来插入##all表
    for (let module of mdArray) {
        i=i+1
        console.log('当前进行的循环查询次数:',i)
        let para = module.id;
        let queryStr = ` 
                        declare @moduID nvarchar(100)          
                        set @moduID='${para}';

                        with moduleOf          
                        as(          
                            SELECT           
                                
                        c.Form_ID,   --表單ID   
                        c.Form_Taiwan_Name,
                        c.IsBusiness,
                        c.IsDisabled,
                        d.Table_Type,  --表類型         
                        d.Table_Name,  --表名       
                        d.Relation_Target_Table     -- 相關的表名 
                                        
                        FROM         
                                
                        (select * from  BsMaster.dbo.TBSF_Function where Module_ID= @moduID) b    --模塊下有哪些功能   
                        LEFT JOIN  BsMaster.dbo.TBSF_Form c ON c.Form_ID= b.Function_Detail      --功能對應哪些表單      
                    LEFT JOIN  BsMaster.dbo.TBSF_Form_TableInfo d ON d.Form_ID= c.Form_ID    --表單對應哪些數據表   
                        where
                        c.Form_ID is not null               
                        ), 
                        
                        /*篩選出模塊依賴的非本表單的視圖或表*/         
                        thirdType           
                        as(          
                        select Form_ID,Table_Name from moduleOf a where a.Table_Type=3          
                        ),   

                        oneOrTwoType           
                        as(          
                        select Form_ID,Table_Name from moduleOf a where a.Table_Type=1 or   a.Table_Type=2        
                        ),  
                        
                        
                        /*以下三個是用於輸出的,第一是表單依賴的其他視圖,依賴的其他表,依賴的方法*/
                        
                            /*從非本表單中的表或視圖中,篩選出視圖*/       
                        vw2        
                        as (        
                        select Form_ID,Table_Name ,'vw' as typ  from thirdType where LEFT(Table_Name,1)='V' or LEFT(Table_Name,1)='v'        
                        ),        
                        tbl3        
                        as(        
                        select Form_ID,Table_Name,'tbl' as typ from thirdType where LEFT(Table_Name,1)<>'V' and LEFT(Table_Name,1)<>'v'  
                        ),

                        selfTbl       
                        as(        
                        select Form_ID,Table_Name,'self' as typ from  oneOrTwoType 
                        ), 
                        
                        
                            /*每個表單所擁有方法的詳細定義*/      
                        esql        
                        as(          
                        select           
                        c.Form_ID as FormID ,        
                        k.OperationStep_Content AS Table_Name,
                        'esql' as typ     
                                
                        from moduleOf  c          
                        LEFT JOIN  BsMaster..TBSF_Form_Operation e ON c.Form_ID=e.Form_ID      --表單與方法的對應表      
                        left join   BsMaster..TBSF_Form_OperationStep  k on e.ID=k.Operation_ID   --每個方法的詳細定義         
                        where k.OperationStep_Content<>''           
                        and k.OperationStep_Content is not null           
                        and   LEFT(k.OperationStep_Content,10)='ExecuteSQL'            
                        )  ,

                        my
                        as(              


                        select * from vw2

                        union
                        select * from tbl3

                        union
                        select * from   selfTbl  

                        union
                        select * from esql
                        
                        )                
              

                        insert into ##all
                        select a.* from  my  a  
    `
        await queryFunc(queryStr,1);
    }

     
    //3 对##all表编号,插入##allRank
    str = ` insert into ##allRank 
            select 
            a.Form_ID as Form_ID,
            a.Table_Name AS Table_Name,
            a.[type]  AS [type],
            row_number()over(order by (select 0)) as [No] 
            from ##all a`
    await queryFunc(str,1) 
}

//总调用执行
let abc = async function (moduleArray,slfMdID) {


   /*  let kk=`
        select 
        Module_ID as id,
        Module_Taiwan_Name as text
        from bsmaster..TBSF_Module
    `
   let absd= await queryFunc(kk)  */
    //console.log(absd)

    console.log('Dependence.js第一步')
    await moduleDependence(moduleArray) //Depandence的输出是##allrank表

    
    console.log('Dependence.js第二步')
    await centerControl()               //centerControl 的输入是##allRank表
    
   


    console.log('Dependence.js第三步')
    let para=slfMdID
    let returnProcessStr=`
                                with selfben   --屬於自身的表
                            as(
                                select * from ##tableAdd
                            ),
                            dependency    --屬於依賴的表
                            as(
                                select * from ##tableDelete
                                union all
                                select * from ##tableUpdate
                                union all
                                select * from ##tableSelect
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
                            select * from result  where tarModuleID='${para}'	 or souModuleID='${para}'	
                            --select * from erp where Form_ID='20101014100404'	
    
    `
    let re= await queryFunc(returnProcessStr)
   

    return re

  /*   //console.dir(a);
    var c = await insertData(a);
    console.dir('tttttttttttttttttttttttt')
    //console.dir(c.recordsets[0]);
    return c.recordsets[0];
 */
}
module.exports = abc
/* 
 let kk = [
    { id: 'Module00001', text: '人事基础资料' },
    { id: 'Module00002', text: '工程基础资料' }
]
abc('','Module00001');  //这里不可以简化为匿名函数,不然报错,不知道是为什么
 */

//   node advance/Dependence.js