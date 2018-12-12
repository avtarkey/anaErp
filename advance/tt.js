/**
 * 这个是生成tableSys系统表的语句
 */



const queryFunc = require('./queryFuncDefine.js'); 
const ins=require('./ErpSysInsertBulk.js')

let str=`
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
`
let abc=async function () {
    let a= await queryFunc(str)
    ins(a,'tableSys') 
    
}

abc()

// node ./advance/tt.js

            