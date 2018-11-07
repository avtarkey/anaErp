

let sqlStr = `select m.ID,m.MaterialNo,m.Materialname,m.MaterialSize,m.UsedType,m.UnitNo,m.IsGreen,m.Area,m.Length,m.Width,p.UnitPrice,p.CurrencyNo,p.QuoteDate from CYERP..tblbase_warehouse_materialbill m left join  ( select a.Materi
    elCode,a.UnitPrice,a.CurrencyNo,b.QuoteDate from CYERP..tblPurchase_SupplierQuote_Item a inner join CYERP..tblPurchase_SupplierQuote b on a.ParentID=b.ID and b.Sh_Status=1 inner join  ( select a.MaterielCode,Max ( b.ID )  as ID from CYERP..tblPurchase_SupplierQuote_Item a inner join CYERP..tblPurchase_SupplierQuote b on a.ParentID=b.ID where b.Sh_Status=1 group by a.MaterielCode )  c on a.MaterielCode=c.MaterielCode and b.ID=c.ID )  p on m.MaterialNo=p.MaterielCode where m.isvalidate=1 and m.ishide=0 and 
    m.istemp=0 `



//转化为数组
let tempStr = sqlStr.split(/[,\s]/)
let a = tempStr.map((str) => { return str.replace(/(^[\s\n\t]+|[\s\n\t]+$)/g, "") })
//console.log(a)
let tempStrArr = tempStr.filter((x) => { return x != '' })
//console.dir(tempStrArr)

//截取首尾
let b = function (arr) {

    let flag = 0;

    let stack = new Array();

    let reValue = new Array();

    for (let i = 0; i <= arr.length; i++) {


        if (arr[i] == 'select' && stack.length == 0) {
            stack.push(arr[i]);
        }
        if (arr[i] == 'from' && stack.length == 1 && stack[0] == 'select') {
            stack.push(arr[i]);
            flag = 1;
        }
        if (arr[i] == '(') {
            stack.push(arr[i]);
        }
        if (arr[i] == ')') {
            stack.push(arr[i]);
        }
        if (stack[stack.length - 1] == '(' && arr[i] == ')') {
            stack.pop();
        }
        if (stack.length == 2 && stack[stack.length - 1] == 'from' && arr[i] == 'where') {
            flag = 0;
        }
        if (flag == 1) {
            reValue.push(arr[i]);
        }
    }

    return reValue.filter((x) => { return (x != 'and') });
}


//对内部进行过滤
let km = function (arr) {
    let stack = new Array();
    let reValue = new Array();
    let flag = 1;

    for (let i = 0; i <= arr.length; i++) {
        //加入栈
        if (arr[i] == 'select' || arr[i] == 'from' || arr[i] == 'join' || arr[i] == 'on' || arr[i] == 'where' || arr[i] == 'group'|| arr[i] == 'by') {
            stack.push(arr[i]);
        }

        //关闭
        if (stack[stack.length - 1] == 'select' || stack[stack.length - 1] == 'where' || stack[stack.length - 1] == 'group') {
            flag = 0;
        }

        //开启
        if (stack[stack.length - 1] == 'from' || stack[stack.length - 1] == 'on' || stack[stack.length - 1] == 'join') {
            flag = 1;
        }

        //处理‘）’
        if ((stack[stack.length - 1] == 'on' || stack[stack.length - 1] == 'where' || stack[stack.length - 1] == 'by' || stack[stack.length - 1] == 'group') && arr[i] == ')') {
            flag = 1;
        }

        //过滤字段
        if (arr[i] == 'and' || arr[i] == 'left' || arr[i] == 'inner' || arr[i] == 'by') {
            flag = 0;
        }
        if (flag == 1) {
            reValue.push(arr[i]);
        }
    }
    return reValue;
}

//let ab = km(b(tempStrArr));

let cc=b(tempStrArr)
let ab = km(cc);
//let ab = tempStrArr

//console.dir(ab)
let abc = new Array();
//console.log(typeof(abc))
ab.push(')');
abc = ab;
//console.log(typeof(abc))

//console.dir(abc);
//console.log('abc:' + abc)






//处理表别名
/* [cyerp..tblname,a]=>{ob:tblname,key:'a'}
[cyer..tblname]=>{ob:'tblname',key:'ng'} */
function proc(arr) {
    let obKey = {};
    //let taKEY={};
    switch (arr.length) {
        case 1: obKey.ob = arr[0].split('.').pop(); obKey.key = 'ng'; break;
        case 2: obKey.ob = arr[0].split('.').pop(); obKey.key = arr[1]; break;
        case 3: obKey.ob = arr[0].split('.').pop(); obKey.key = arr[2]; break;
    }
    return obKey;
}

//处理on关系
/* tblname=a.idd=>[ng,tblname,a,idd]
b.tblname=a.idd=>[b,tblname,a,idd] */
function onSplit(stro) {
    function alisSplit(str) {
        let temp = str.split('.')
        let reValue = new Array();
        if (temp.length == 1) {
            reValue.push('ng');
            reValue.push(str);
            return reValue;
        }
        if (temp.length == 2) {
            reValue.push(temp[0]);
            reValue.push(temp[1]);
            return reValue;
        }

    }
    let p = stro[0].split('=').map(alisSplit)
    let v = p[0].concat(p[1]);
    return v;
}




let innerff = new Array();//调用数组栈
let currentStack = 0 //默认指向0

let recurse = function (i) {
    let child = [];
    let temArr = new Array();//存储 表或关系的临时数组
    let flag = 1; //默认插入，插入标志
    let reValue = { from: [], join: [], on: [] }; //返回值    


    let stack = new Array(); //历史栈
    let recuing = 0; //默认不子递归，是否在子递归的标志

    let curStack = i || 0; //当前位于递归的第几层

    return function internel(item) {
        let sign = 1; //默认开启，也就是插入，当出现关键字的时候，本次循环不插入的标志

        //是否在子递归中
        if (recuing == 1) {

            recuValue = innerff[curStack + 1](item);
            if (recuValue == null) {
                return;
            }
            else {
                temArr.push(recuValue.from)
                let bs = new Array();
                bs = child.concat(recuValue.kv)
                child = bs;
                recuing = 0;
                return;
            }
        }

        //子递归的开启开关
        if ((stack[stack.length - 1] == 'join' || stack[stack.length - 1] == 'from') && item == '(') {
            recuing = 1; //设置当前在递归中的标志
            innerff.push(recurse(curStack + 1));
            return;
        }

        //把临时数组加入到返回数组，并将临时数组清空
        if (stack.length == 0 && item == 'from') {
            stack.push(item);
        }
        //from
        if (stack[stack.length - 1] == 'from' && item == 'join') {
            stack.push(item);

            reValue.from.push(temArr);
            reValue.join.push(temArr);
            temArr = [];

        }
        //join
        if (stack[stack.length - 1] == 'join' && item == 'on') {
            stack.push(item);

            reValue.join.push(temArr);

            temArr = [];
        }
        //on
        if (stack[stack.length - 1] == 'on' && item == 'join') {

            let ms = new Array();
            ms = reValue.on.concat(temArr);
            reValue.on = ms;

            stack.pop(); //弹出on
            stack.pop();//弹出join 

            stack.push(item);

            temArr = [];
        }
        if (stack[stack.length - 1] == 'on' && item == ')') {
            let ms = new Array();
            ms = reValue.on.concat(temArr);
            reValue.on = ms;

            stack.pop(); //弹出on
            stack.pop();//弹出join	

            temArr = [];
        }

        //函数是否完全结束的标志

        if (stack[stack.length - 1] == 'from' && item == ')') {
           // console.log(reValue)

            let endValue = new Object();

            //对from，join，on进行前期处理
            endValue.from = reValue.from.map(proc);
            endValue.join = reValue.join.map(proc);
            endValue.on = reValue.on.map(onSplit).filter((x) => {
                if (x[0] == 'ng') {
                    if (x[1].length == 1) {
                        return false;
                    }
                }
                if (x[2] == 'ng') {
                    if (x[3].length == 1) {
                        return false;
                    }
                }
                return true;
            });

            //console.dir(endValue)            
            var map = new Map();
            for (let fruit of endValue.join) {
                map.set(fruit.key, fruit.ob);
            }
            //console.dir(map);
            let a = endValue.from;
            let re = { from: a[0].ob, kv: [] };
            //console.log(re);

            for (let fruit of endValue.on) {
                let kk = new Object();
                kk.a = map.get(fruit[0]);
                kk.ak = fruit[1];
                kk.b = map.get(fruit[2]);
                kk.bk = fruit[3];
                re.kv.push(kk);
                //console.dir(kk);
            }

            let jsbu = new Array();
            jsbu = re.kv.concat(child);
            re.kv = jsbu;

            innerff.pop();
            return re;

        }


        //设置插入标识
        switch (item) {
            case 'select': flag = 0; sign = 0; break;
            case 'where': flag = 0; sign = 0; break;
            case 'group': flag = 0; sign = 0; break;
            case 'from': flag = 1; sign = 0; break;
            case 'join': flag = 1; sign = 0; break;
            case 'on': flag = 1; sign = 0; break;
        }
        // 这里负责插入临时数组
        if (flag == 1 && sign == 1) {
            if (item == 'left' || item == 'inner') {
                return;
            }
            else if (stack[stack.length - 1] == 'on') {
                let linshi = new Array();
                linshi.push(item);
                temArr.push(linshi);
                //flag = 0;
                return;

            }
            else {
                temArr.push(item);
                return;
            }
        }

        //一般结束
    }
}

innerff.push(recurse(0));
//console.dir(innerff.length)
let inner = innerff[currentStack];

for (let i = 0; i <= abc.length; i++) {

    let bc = inner(abc[i]);
    if (bc!=null) {
        console.dir(bc);
        //{from:'tbl',kv:[{a:'a',ak:'ak',b:'b',bk:'bk'},]
        return bc

    }
}











