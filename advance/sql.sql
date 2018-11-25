



if  object_id('tempdb..##all') is not null drop table ##all
if  object_id('tempdb..##allRank') is not null drop table ##allRank
if  object_id('tempdb..##tableAdd') is not null drop table ##tableAdd
if  object_id('tempdb..##tableDelete') is not null drop table ##tableDelete
if  object_id('tempdb..##tableUpdate') is not null drop table ##tableUpdate
if  object_id('tempdb..##tableSelect') is not null drop table ##tableSelect

create table ##all(
Form_ID nvarchar(100),
Table_Name nvarchar(3990),
[type] nvarchar(100)
)

create table ##allRank(
Form_ID nvarchar(150),
Table_Name nvarchar(4000),
[type] nvarchar(3998),
[No] bigint
)


create table ##tableAdd(
formID nvarchar(200),
tableName nvarchar(200)
)
create table ##tableDelete(
formID nvarchar(200), 
tableName nvarchar(200)
)
create table ##tableUpdate(
formID nvarchar(200),
tableName nvarchar(200)
)
create table ##tableSelect(
formID nvarchar(200),
tableName nvarchar(200)
)



delete tableAdd
delete tableDelete
delete tableSelect
delete tableUpdate


create table tableTmp(
tarFormName nvarchar(200),
souFormName nvarchar(200),

tarIsBusiness nvarchar(200),
souIsBusiness nvarchar(200),

tarIsDisabled nvarchar(200),
souIsDisabled nvarchar(200),

tarFormID nvarchar(200),
souFormID nvarchar(200),

tarModuleName nvarchar(200),
tarModuleID nvarchar(200),

souModuleName nvarchar(200),
souModuleID nvarchar(200)

)


--产生result表

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
                              select * from acticle..tableSys
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
                            

select * 
 into acticle..tableResult
from result
