let sqlStr=`tblBase_HR_Dept_Change]`


  //转化为数组
  //插入空格
  let inNon=sqlStr.replace(/\(/g, " ( ").replace(/\)/g, " ) ").replace(/\]/g, " ] ").replace(/\[/g, " [ ");
  
  let splt = msstr.split(/[,\s]/);//使用.和空格分割
  let trm = splt.map((str) => { return str.replace(/(^\s*)|(\s*$)/g, "") }) //去掉前后空格
  
  let flt = trm.filter((x) => { return x != '' }) //过滤
 

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
      let fromStack = new Array();
      let cStack = new Array();
      let kkStack=new Array();
      let flag = 0;
      let sign=0;
      let reValue=new Array();

      for (let i = 0; i <= arr.length; i++) { 
          kkStack.push(arr[i]);

          if(arr[i]=='('){
              cStack.push(arr[i]);
          }
          if(arr[i]==')' && cStack[cStack.length-1]=='('){
              cStack.pop();
          }

          if(arr[i]=='from' && cStack.length==1){
            
              flag=1;
          }
          if(arr[i]=='from' && flag==1){
               fromStack.push(arr[i]);
          }
          if(flag==1 && fromStack.length==cStack.length && kkStack[kkStack.length-2]=='from'&& arr[i]!='from'){
              return arr[i].split('.').pop();
          }
      }       
  }




  let ab = km(tempStrArr);
  return ab;



