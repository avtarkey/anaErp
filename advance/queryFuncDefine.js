


var ConnectionPool = require('tedious-connection-pool');
var Request = require('tedious').Request;

var poolConfig = {
  min: 6,
  max: 8,
  log: false
};

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
let queryFunc = async (queryString) => {
  //console.dir(queryString)
  if (a == 1) {
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

      console.dir('111111111connection1111111')
      //console.error(err);
      return;
    }

    //use the connection as normal
    var request = new Request(queryString, function (err, rowCount) {
      /*    if (err) {
           console.dir('1111111request111111111')
           console.error(err);
           return; 
         } */



      //release the connection back to the pool when finished
      flag = 1
      connection.release();
    });
    request.on('doneInProc', function (rowCount, more, rows) {
      // console.dir('55'+rowCount)

      flag = 1

      if ((rowCount != 0 || rowCount == undefined) && resultArray.length == 0) {
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
      // console.dir(err)
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


