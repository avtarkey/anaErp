


var getData = require('../myModule/dataAccess.js');
var insertData = require('../myModule/insertData.js');
/* (async function() {

  let methodString = `select * from fn_getVw2('Module00173')`;
  //第一步，得到mthodArry
  let vwArry = new Array();
  vwArry = await getData(methodString); //得到数据
  //console.dir('Module00134得到的数据：'+vwArry);


  //得到数据
  //第二部，得到product
  //mthodArry->product
  var ana = require('../Logic/parser.js');
  let product = new Array();

  for (let key in vwArry) {

    let tmppar=new Array(); 

    let rsArray=new Array(); //视图——依赖表

    let qs=`exec cyerp..sp_helptext ${vwArry[key].Table_Name}`
    
    let a=new Array();
    a=await getData(qs);
    let viewD='';
    for(let i in a)
    {
      viewD+=a[i].Text;
    }
    tmppar=ana(viewD); //每个视图依赖的表

    for(let i in tmppar)
    {
      let temp = new Object();
      temp.FormID=vwArry[key].FormID;
      temp.TableName =tmppar[i];
      temp.Origin = '';
      rsArray.push(temp);
    }
    product=product.concat(rsArray);
  }

  //处理后，将返回数据库插入
  //第三部，插入product
  //product插入
  console.dir(product);
  await insertData(product); //插入数据

})(); //视图
 */

(async function () {

  let methodString = `select * from fn_getEsql('Module00173')`;
  //第一步，得到mthodArry
  let vwArry = new Array();
  vwArry = await getData(methodString); //得到数据
  //console.dir('Module00134得到的数据：'+vwArry);


  //得到数据
  //第二部，得到product
  //mthodArry->product
  var ana = require('../Logic/parser.js');
  let product = new Array();

  for (let key in vwArry) {

    let tmppar = new Array();

    let rsArray = new Array(); //视图——依赖表


    tmppar = ana(vwArry[key].Table_Name); //每个视图依赖的表

    for (let i in tmppar) {
      let temp = new Object();
      temp.FormID = vwArry[key].FormID;
      temp.TableName = tmppar[i];
      temp.Origin = '';

      if (temp.TableName.substr(0, 1) != '#' && temp.TableName.substr(0, 1) != '[') {
        rsArray.push(temp);
      }
    }
    product = product.concat(rsArray);


  }

  //处理后，将返回数据库插入
  //第三部，插入product
  //product插入
  console.dir(product);
  await insertData(product); //附加插入数据

})(); //方法


/* 
(async function () {

  let methodString = `select * from fn_getTbl3('Module00173')`;
  //第一步，得到mthodArry
  let vwArry = new Array();
  vwArry = await getData(methodString); //得到数据
  //console.dir('Module00134得到的数据：'+vwArry);


  //得到数据
  //第二部，得到product
  //mthodArry->product
  var ana = require('../Logic/parser.js');
  let product = new Array();

  for (let key in vwArry) {
    let temp = new Object();
    temp.FormID = vwArry[key].FormID;
    temp.TableName = vwArry[key].Table_Name;
    temp.Origin = '';

     product.push(temp);
  }





  //处理后，将返回数据库插入
  //第三部，插入product
  //product插入
  console.dir(product);
  await insertData(product); //插入数据

})(); //表 */
 