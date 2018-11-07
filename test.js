let trans = (queryString) => {
    return new Promise(function (resoleve, reject) {
        var appid = '20180819000195969';
        var key = 'qaA1Cm97ErLyyXKNn0ti';
        var salt = (new Date).getTime();
        var query = queryString;
        // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
        var from = 'cht';
        var to = 'zh';
        var str1 = appid + query + salt + key;
        var sign = MD5(str1);
        $.ajax({
            url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
            type: 'post',
            dataType: 'jsonp',
            data: {
                q: query,
                appid: appid,
                salt: salt,
                from: from,
                to: to,
                sign: sign
            },
            success: function (data) {
                console.log('data');
                console.log(data);


                resoleve(data.trans_result[0].dst);
            }
        });

    });
}


var  resultJson = [
    {
        "target": "主管管轄部門維護",
        "source": "View人事資料(關聯用)",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "考勤日期維護鎖卡",
        "source": "View人事資料(關聯用)",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "主管管轄部門維護",
        "source": "View上級部門視圖",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "個人基本資料",
        "source": "View身份證",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "信息歸類",
        "source": "View信息類別視圖",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "個人基本資料",
        "source": "View個人基本資料班組",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "個人基本資料",
        "source": "View個人基本資料擔保書",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "人事崗位負責人維護",
        "source": "View個人檔案視圖",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "永不錄用人員",
        "source": "View個人檔案視圖",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "考勤特殊人員",
        "source": "View個人檔案視圖",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "個人基本資料",
        "source": "View個人檔案視圖",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "特殊人員其他薪資維護",
        "source": "View個人檔案視圖",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "組織架構",
        "source": "View個人檔案視圖",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "管理層人員維護",
        "source": "View個人檔案視圖",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "員工技能資料",
        "source": "View員工技能維護人員",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "員工技能資料",
        "source": "View員工技能維護崗位",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "員工技能資料",
        "source": "View員工技能維護部門",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "各部門人員編制",
        "source": "View崗位基本信息",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "薪資公式參數設置",
        "source": "View薪資公式參數視圖",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "薪資項目設置",
        "source": "View薪資公式參數視圖",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "薪資工資基本參數設置",
        "source": "View薪資參數數據視圖",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "薪資工資基本參數設置",
        "source": "View薪資參數欄位視圖",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "信息歸類",
        "source": "View職務崗位視圖",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "個人基本資料",
        "source": "人才來源",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "個人基本資料",
        "source": "個人基本資料",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "培訓講師",
        "source": "個人基本資料",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "組織架構",
        "source": "個人基本資料",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "人員編制",
        "source": "崗位資料維護",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "個人基本資料",
        "source": "崗位資料維護",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "月考勤限制天數設定",
        "source": "組織架構",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "組織架構",
        "source": "組織層級",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "組織架構",
        "source": "管理級別維護",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "職務維護",
        "source": "管理級別維護",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "職務維護",
        "source": "薪資定義項目設置",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "人員編制",
        "source": "職務維護",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "各部門人員編制",
        "source": "職務維護",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "個人基本資料",
        "source": "職務維護",
        "type": "resolved",
        "rela": "主营产品"
    },
    {
        "target": "職務晉升專案關聯維護",
        "source": "職務維護",
        "type": "resolved",
        "rela": "主营产品"
    }
];



//定义节点	

var i = 0;
var ArrayPack = new Array();

var termineate = new Array();

let person = {};



for (let key of resultJson) {
    ArrayPack.push(key);
    i += 1;
    if (i == 5) {
        let package = JSON.stringify(ArrayPack);

       
        var p1= trans(package);

        
        i = 0;
        ArrayPack = [];
        package={};


    }
}
let package = JSON.stringify(ArrayPack);
/*  trans(package, (str) => {
    termineate.push(JSON.parse(str));

}); */

var p2= trans(package);
i = 0;
ArrayPack = [];
package={};


let p4=Promise.all([p1,p2]);
p4.then(
    (value)=>{
        console.dir(value[0])
        //console.dir(jQuery.parseJSON(value[0]));
        var ob=JSON.parse(value[0]);

        console.dir(typeof(value[0]));
      /*   termineate.push(JSON.parse(value[0]));
        termineate.push(JSON.parse(value[1])); */
        console.dir(termineate);
    }
)



