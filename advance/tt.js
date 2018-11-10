
let str='ExecuteSQL(,cyerp.dbo.stHr_deptRelation)'
let reg = /^ExecuteSQL\([^,]*,(exec)?\[?([^,\(\)\[\]]+)\]?[\s\(,\)]/  

let a=str.match(reg)
            console.dir(a)

            