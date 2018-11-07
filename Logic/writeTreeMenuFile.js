/*
 * 这个模块的两个函数通过接受数据库的模块数组，将其转化为树状关系的json，并将其写入文件
 */

/*
*将数据库的数组转化为json
*/
let getMenuJson = (coArray, callback) => {
    console.dir('在getMenuJson中')

    var myMenuArray = coArray;
    var mySet = new Set();
    var myOarray = new Array();
    myOarray = [{
        "id": 0,
        "text": "My Documents"
    }];
    /*
    *把菜单数组里的每个项添加到集合
    */
    for (let fruit of myMenuArray) {
        mySet.add(fruit);
    }

    /*
    *遍历数组里的每个项
    */
    for (let setItem of mySet) {
        let mm = recursion(setItem, myOarray);

        if (mm.b = true) {
            mySet.delete(setItem);

        }
    }

    /*
    *递归
    */
    function recursion(setItem, childrenArray) {

        for (let node of childrenArray) {

            if (node.id == setItem.preSystemName) {

                let treeNode = new Object();
                treeNode.id = setItem.systemName;
                treeNode.text = setItem.chineseName;
                treeNode.state='close';

                if (node.children == undefined) {
                    node.children = new Array();
                }
                node.children.push(treeNode);

                let rResult = new Object();
                rResult.a = node;
                rResult.b = true;
                return rResult;
            }
            else if (node.children !== undefined) {
                let mm = recursion(setItem, node.children);
                if (mm.b == true) {
                    node = mm.a; //更新node

                    let rResult = new Object()
                    rResult.a = node;
                    rResult.b = true;
                    return rResult;
                }
                else {
                    continue;
                }
            }
            else {
                continue;
            }
        }

        let rResult = new Object()
        rResult.a = childrenArray;
        rResult.b = false;
        return rResult;
    }
    console.dir(myOarray);
    callback(myOarray);
}
/*
*开始调用数据库写入json到文件
*/
let queryString = 'select * from acticle.dbo.Recursion';
var getData = require('../myModule/dataAccess.js');
getData(queryString, (coArray) => {
    getMenuJson(coArray, (jjson) => {

        let fs = require('fs');

        let data = jjson;
        console.dir(jjson);

        let baseDir =  __dirname + '/../public/jsonFile/';
        let opts = {
            cwd: baseDir,
            encoding: 'utf8',
            stdio: [process.stdin, process.stdout, process.stderr]
        }
        let fileName = baseDir + 'tree_data.json';
        console.dir(fileName);
        

        fs.writeFileSync(fileName, ` ${JSON.stringify(data, null, 2)}`, opts);


    });
});



