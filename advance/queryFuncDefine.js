


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


var pool

let a = 1
//isOmitRows等于0 表示不忽略返回结果集
let queryFunc = async (queryString,isOmitRows=0) => {
  console.dir(queryString)
  
  console.dir('queryFuncDefine.js正在查询数据库.......')
 
  if (a == 1) {  //如果是第一次调用这个函数就新建连接池
    //create the pool
    pool = new ConnectionPool(poolConfig, connectionConfig);

    pool.on('error', function (err) {

      //console.error(err);
    });

  }
  a = 5

  let flag = 0;
  let resultArray = new Array();

  //acquire a connection
  pool.acquire(function (err, connection) {


    if (err) {

      console.dir('queryFuncDefine.js')
      //console.error(err);
      return;
    }

    //use the connection as normal
    var request = new Request(queryString, function (err, rowCount) {
         if (err) {
           console.dir('1111111request111111111')
           console.error(err);
           return; 
         } 



      //release the connection back to the pool when finished
      flag = 1
      connection.release();
    });
    request.on('doneInProc', function (rowCount, more, rows) {
      // console.dir('55'+rowCount)

      flag = 1

      if (isOmitRows==0 && (rowCount != 0 || rowCount == undefined) && resultArray.length == 0) {
        let tmp = {};

        resultArray = [];

        for (let row of rows) {
          tmp = {};
          for (let column of row) {
            tmp[column.metadata.colName] = column.value;

          }

          resultArray.push(tmp);
        }
      } else {
        // if()
        // resultArray = [];
      }


      //  console.dir('iiiiiiiiiiiiiii:')
      //  console.dir(resultArray)

    });

    request.on('error', function (err) {
      // console.dir('yyyyyyyyyyyyyyyyy')
      console.dir(err)
    });

    connection.execSql(request);
  });


  while (flag === 0) { //一直循环等待，知道flg不等于0
    require('deasync').runLoopOnce();
  }
  // console.dir('resultArray:')
  // console.dir(resultArray)
  // console.dir(`ttttttttttttt `)
  return resultArray;
}
module.exports = queryFunc /**kkk */


/* let abc = async function () {
  var b = await queryFunc(`exec sp_helptext stqa_rejectmodify_Search`);
  //console.dir(b)
}
abc(); */



//  node tranFile/queryFuncDefine.js


