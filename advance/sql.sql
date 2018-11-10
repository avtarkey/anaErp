



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
