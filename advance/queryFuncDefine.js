


var ConnectionPool = require('tedious-connection-pool');
var Request = require('tedious').Request;

//连接池配置
var poolConfig = {
  min: 10,
  max: 12,
  log: false
};

//连接配置
var connectionConfig = {
  userName: 'cqread',
  password: 'read123',
  server: '10.34.1.70',

  options: {
    port: 1433,
    database: 'cyerp',
    rowCollectionOnDone: true

  }

};

// 建立连接池
var pool = new ConnectionPool(poolConfig, connectionConfig);
pool.on('error', function (err) {
  console.dir('连接池建立错误')
  console.error(err);
})

//isOmitRows等于0 表示不忽略返回结果集
let queryFunc =  (queryString,isOmitRows=0) => {
  return new Promise((resolve, reject) => {  
    
    let resultArray = new Array();
    //acquire a connection
    pool.acquire(function (err, connection) {
        if (err) {
          console.dir('queryFuncDefine.js连接获取错误')      
          return;
        }

        //use the connection as normal
        var request = new Request(queryString, function (err, rowCount) {

          console.log('queryFuncDefine.js正在查询数据库.......')
          if (err) {
            console.dir('查询建立出错')
            //console.error(err);
            console.log('该错误的查询语句:',queryString)
            //return
          } 
          //release the connection back to the pool when finished       
          connection.release()
          resolve(resultArray)
        })

        request.on('doneInProc', function (rowCount, more, rows) { 
          if (isOmitRows==0 && (rowCount != 0 || rowCount == undefined) && resultArray.length == 0) {
            let tmp = {}
            resultArray = []
            for (let row of rows) {
              tmp = {}
              for (let column of row) {
                tmp[column.metadata.colName] = column.value
              }
              resultArray.push(tmp)
            }
          } else {       
            resultArray = []
          }          
        })

        request.on('error', function (err) {  
          console.dir('查询错误')  
          console.error(err)
        })
        connection.execSql(request)
        
    })
  })
}
module.exports = queryFunc /**kkk */


/* let abc = async function () {
  var b = await queryFunc(`exec sp_helptext stqa_rejectmodify_Search`);
  //console.dir(b)
}
abc(); */



//  node tranFile/queryFuncDefine.js


