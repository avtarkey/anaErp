var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');  //调用模板
//創建編碼解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })


/* GET users listing. */



var options = {

  root: 'C:\\Users\\lqavtar\\Desktop\\myapp\\myapp\\myHtml',
  dotfiles: 'deny',
  cacheControl: false,
  maxAge: 100,
  immutable: false,

  headers: {
    'x-timestamp': Date.now(),
    'x-sent': true
  }
};

//首页
router.get('/', function (req, res) {
  res.sendFile("ii.html", options);
  console.log(__dirname)

})

//自动ajax加载获得树形节点菜单
router.get('/tree_data', function (req, res) {


  /* res.json(myOarray) */
  /*  res.send(myOarray) */
  res.sendFile("tree_data.json", options);

})

//保存做自己布置的图
router.post('/saveData', function (req, res) {

  /* req.body:{dt:,ModuleID:'001'} */
  let para = req.body.dt;
  let ModuleID=req.body.ModuleID
  //console.dir(req.body);
  //console.log('vegegefdfdfdfd');
  let writeData = (jjson) => {
    let fs = require('fs');
    let data = jjson;
   //console.dir(jjson);

    let baseDir = __dirname + '/../public/jsonFile/';
    let opts = {
      cwd: baseDir,
      encoding: 'utf8',
      stdio: [process.stdin, process.stdout, process.stderr]
    }
    let fileName = baseDir +ModuleID+'.json';
    console.dir(fileName);
    fs.writeFileSync(fileName, ` ${JSON.stringify(data, null, 2)}`, opts);
  }

  writeData(para);
  let b=[];
  res.json(b);
})

//返回图
router.post('/process_get', function (req, res) {
  let ModuleID=req.body[0].id //从请求中获得模块编号
  var fs= require('fs');

  //如果没有在本地文件中找到对应模块的图，则执行的no函数,从数据库中查询
  let no=async function () {
    // 输出 JSON 格式
    console.log('555555555555555555555555555555555555555555555555')
    let para = req.body[0].id;  //这个取得客户端返回的模块编号

    var getData = require('../myModule/dataAccess.js'); //查询函数
    var insertData = require('../myModule/insertData.js'); //插入操作函数

     //取得表单依赖的所有视图
    await (async function () {

      let methodString = `select * from fn_getVw2('${para}')`;
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

        let qs = `exec cyerp..sp_helptext ${vwArry[key].Table_Name}`
        let a = new Array();
        a = await getData(qs); //视图的定义语句是一行一行的
        let viewD = '';
        for (let i in a) {
          viewD += a[i].Text;
        }
        tmppar = ana(viewD); //每个视图依赖的表

        for (let i in tmppar) {
          let temp = new Object();
          temp.FormID = vwArry[key].FormID;
          temp.TableName = tmppar[i];
          /*   temp.Origin = 'vw';
            temp.txt=viewD */
          rsArray.push(temp);
        }
        product = product.concat(rsArray);


      }

      //处理后，将返回数据库插入
      //第三部，插入product
      //product插入
      //console.dir(product);
      await insertData(product); //插入数据

    })();

    //取得表单使用的所有方法
    await (async function () {

      let methodString = `select * from fn_getEsql('${para}')`;
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

        let rsArray = new Array(); //方法的——依赖表


        tmppar = ana(vwArry[key].Table_Name); //每个方法内部包含的表，返回一个数组

        for (let i in tmppar) {
          let temp = new Object();
          temp.FormID = vwArry[key].FormID;
          temp.TableName = tmppar[i];
          /*   temp.Origin = 'mth';
            temp.txt=vwArry[key].Table_Name; */

          if (temp.TableName.substr(0, 1) != '#' && temp.TableName.substr(0, 1) != '[') {
            rsArray.push(temp);
          }
        }
        product = product.concat(rsArray);


      }

      //处理后，将返回数据库插入
      //第三部，插入product
      //product插入
      //console.dir(product);
      await insertData(product, 1); //附加插入数据

    })(); 


     //取得表单使用的所有表
    await (async function () {

      let methodString = `select * from fn_getTbl3('${para}')`;
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
        /*   temp.Origin = 'tbl';
          temp.txt=vwArry[key].Table_Name; */

        product.push(temp);
      }
      //处理后，将返回数据库插入
      //第三部，插入product
      //product插入
      //console.dir(product);
      await insertData(product, 1); //插入数据

    })();


    let comps = new Array();
    let queryString2 = `select * from fn_methodFun()`;

    comps = await getData(queryString2)
    console.log('--------------------------------');
    let returnJson = new Array(); //最后的返回数据对象   

    for (let key in comps) {
      let tempObject = Object();//注意首字母大写
      tempObject.target = comps[key].targetFormName;
      tempObject.source = comps[key].sourceFormName;
      tempObject.type = "resolved";
      tempObject.rela = "主营产品";
      tempObject.belongModule = comps[key].sourceModuleName;
      tempObject.belongModuleID = comps[key].sourceModuleID;

      returnJson.push(tempObject);
    }


    //console.dir(returnJson);

    return returnJson;
    
  }

  let baseDir = __dirname + '/../public/jsonFile/';
  let fileName = baseDir +ModuleID+'.json';
  //console.dir(fileName);

  //判断在文件中是否存在以前自己保存的图json文件
  fs.exists(fileName, function(exists) {
    if(!exists){ //不存在    
      (async function(){

        let myData=new Object();
        myData.body=await no();      
        myData.isExist=0;
        res.json(myData);       
      })();     
    }else{//存在 

      let myData=new Object();
      myData.isExist=1;
      myData.body=JSON.parse(fs.readFileSync(fileName, 'utf8'));
      res.json(myData); 
    }
  }); 
})
module.exports = router;

// set DEBUG=myapp:* & npm start
