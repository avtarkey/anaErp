
const queryFunc = require('./queryFuncDefine.js');  //这个是执行查询的函数
const centerControl = require('./centerControl.js'); //这个是中间处理的





//总调用执行
let abc = async function (moduleArray,later,former=1) {

    let add=[]
    moduleArray.forEach(element => {
        add.push(`'`+element.id+`'`)
    })  
    let para=`(`+add.join(',')+`)`

    console.log('######3',para)
  
    let souInsert1=`delete acticle..tableTmp    
       
    insert into acticle..tableTmp  
     select * from acticle..tableResult  where  souModuleID in ${para} and tarModuleID   in ${para}
    
    delete acticle..tableTmp3

    insert into acticle..tableTmp3
    select souFormID from acticle..tableResult  where  souModuleID in ${para} and tarModuleID   in ${para} `

    let souInsert2=    // 输出
    `insert into acticle..tableTmp
    select *         from acticle..tableResult  where  tarFormID in (select * from acticle..tableTmp3) 
   
    delete acticle..tableTmpFormID
    
    insert into acticle..tableTmpFormID
    select souFormID from acticle..tableResult  where  tarFormID in (select * from acticle..tableTmp3) 
    
    delete acticle..tableTmp3
    
    insert into acticle..tableTmp3
    select formID from acticle..tableTmpFormID  `


    
    async function a(){
        await queryFunc(souInsert1)      

        for(let i=1;i<=later;i++){
            await queryFunc(souInsert2)
        }    
    }
    a()
    let re= await queryFunc(`select * from acticle..tableTmp`) 
    console.log('run end!')

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
    { id: 'Module00001', text: '人事基础资料' }  
]   
abc(kk,1);  //这里不可以简化为匿名函数,不然报错,不知道是为什么

 */
//   node advance/Dependence.js