let  queryFunc = require('./queryFuncDefine.js');
let centerControl=require('./centerControl.js');
let insertData=require('./insertDateBase.js')

/**
 * 根据模块的ID,查询该模块下所有表单对应的视图

*/
//stHr_GetDeptRowData


let moduleDependence = async function (mdID) {
    let para = mdID;


    //由于非业务表的数据浏览中数据源视图,不会记录在table_dictioory中,所以这里也无法取道非业务表单依赖的视图
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
                        
                (select * from  BsMaster.dbo.TBSF_Function where Module_ID= 'module00057') b    --模塊下有哪些功能   
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
                select * from esql
                
                )                
                
                select b.Form_Taiwan_Name,a.* from  my  a
                left join bsmaster..TBSF_Form b on b.Form_ID=a.Form_ID            

                `
                console.dir('fe');
    var b = await queryFunc(queryStr);
    console.dir('fefe');
    return b;
    
}

let abc =async function(mdID){
     var b = await moduleDependence (mdID);
     console.dir('第二部')
     var a= await centerControl(b);
     //console.dir(a);
     var c=await insertData(a);
     console.dir('tttttttttttttttttttttttt')
    //console.dir(c.recordsets[0]);
    return c.recordsets[0];

}


module.exports =abc;
//abc('module00020');  //这里不可以简化为匿名函数,不然报错,不知道是为什么




//   node tranFile/Dependence.js