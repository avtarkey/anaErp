
var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');  //调用模板
//創建編碼解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const abc=require('../advance/Dependence.js')





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
  res.sendFile("advance.html", options);
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
  var fs= require('fs')  
  //console.dir(req.body)

    //req.bod的形式
  /*   [ { id: 'Module00001', text: '人事基础资料' },
        { id: 'Module00002', text: '工程基础资料' },
        { id: 'Module00003', text: '品质基础资料' } ] */

  //如果没有在本地文件中找到对应模块的图，则执行的no函数,从数据库中查询
  let no=async function () {
    // 输出 JSON 格式   
    //let para = req.body[0].id;  //这个取得客户端返回的模块编号

    let comps = await abc(req.body)  
    let returnJson = new Array(); //最后的返回数据对象   

    for (let row of comps) {
      let tempObject = Object();//注意首字母大写
      tempObject.target = comps[key].targetFormName;                //目标表单名
      tempObject.source = comps[key].sourceFormName;                //源表单名
      tempObject.type = "resolved";
      tempObject.rela = "主营产品";
      tempObject.belongModule = comps[key].sourceModuleName;        //源模块名
      tempObject.belongModuleID = comps[key].sourceModuleID;        //源模块ID

      returnJson.push(tempObject);
    }
    //console.dir(returnJson)
    return returnJson   
  }

  //图形在本地的存储位置
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
