(async function () {
    // 输出 JSON 格式
    console.log('555555555555555555555555555555555555555555555555')
    let para = 'Module00173';

    var getData = require('../myModule/dataAccess.js');
    var insertData = require('../myModule/insertData.js');
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
        a = await getData(qs);
        let viewD = '';
        for (let i in a) {
          viewD += a[i].Text;
        }
        tmppar = ana(viewD); //每个视图依赖的表

        for (let i in tmppar) {
          let temp = new Object();
          temp.FormID = vwArry[key].FormID;
          temp.TableName = tmppar[i];
          temp.Origin = '';
          rsArray.push(temp);
        }
        product = product.concat(rsArray);


      }

      //处理后，将返回数据库插入
      //第三部，插入product
      //product插入
      console.dir(product);
      await insertData(product); //插入数据

    })(); //视图


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
      await insertData(product, 1); //附加插入数据

    })(); //方法



  await  (async function () {

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
        temp.Origin = '';

        product.push(temp);
      }
      //处理后，将返回数据库插入
      //第三部，插入product
      //product插入
      console.dir(product);
      await insertData(product, 1); //插入数据

    })(); //方法
   
   
    let comps = new Array();
    let queryString2 = `select * from fn_methodFix()`;

    comps = await getData(queryString2)


    console.log('--------------------------------');


    let returnJson = new Array(); //最后的返回数据对象

    for (let key in comps) {
      let tempObject = Object();//注意首字母大写
      tempObject.target = comps[key].targetFormName;
      tempObject.source = comps[key].sourceFormName;
      tempObject.type = "resolved";
      tempObject.rela = "主营产品";
      returnJson.push(tempObject);
    }
   /*  res.json(returnJson); */
  })()