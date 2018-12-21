<!DOCTYPE html>
<html>
<head>
<meta id="viewport" name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=2.0; minimum-scale=1.0;">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<!--<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE8"/>-->
<title>网络准入系统</title>
<link href="../css/terminal.css" rel="stylesheet" type="text/css" />
<script>
/* 此行请勿改动-Don't modify this line */var IS_PREVIEW = false;/* 此行请勿改动-Don't modify this line */
</script>
</head>

<body onload="start()">

<script>
var checkTimer;
var connectTimer;
var connetFailTimes;

function start() {
    // 预览模式中只展示,不跑功能
    if (IS_PREVIEW) {
        // 实现鼠标无法选中文字
        setTimeout(function updateForPreview() {
            showMsg('正在连接网络准入系统...');
            setTimeout(updateForPreview, 100);
        }, 100);
        return;
    }

	showMsg('正在连接网络准入系统...');
	checkIngressRule(5000);
}

function checkIngressRule(timeout) {
	connetFailTimes = 0;
	for (var port = 20001; port < 20011; port++) {
		getCheckInfo(port);
	}
	
	connectTimer = setTimeout(function () {
		showMsg('您的电脑还未安装网络准入系统');
		doShowStep(true);
		if (checkTimer) {
			clearInterval(checkTimer);
		}
		checkIngressRule(5000);
	}, timeout);
}

function getCheckInfo(port) {
	var script = document.createElement('script');
	script.src = 'http://127.0.0.1:' + port + '/get_check_info_' + (+new Date()) + '.js';
	script.onerror = function() {
		connetFailTimes++;
		if (connetFailTimes >= 10) {
			connetFailTimes = 0;
			showMsg('您的电脑还未安装网络准入系统');
			doShowStep(true);
			clearTimeout(connectTimer);
			if (checkTimer) {
				clearInterval(checkTimer);
			}
			setTimeout(function () {
				checkIngressRule(5000);
			}, 5000);
		}
	};
	document.body.appendChild(script);
}

/**
 * obj: {msg: 'xxx', state: 0}
 *
 * obj.state值可能为0, 1, 2, 3:
 *     0: 客户端正在检测或升级
 *     1: 检测成功, 可上网
 *     2: 安全桌面没运行
 *     3: 连接准入失败
*/
function callback(obj) {
	doShowStep(false);
	clearTimeout(connectTimer);
	if (checkTimer) {
		clearInterval(checkTimer);
	}
	checkTimer = setInterval(function () {
		checkIngressRule(6000);
	}, 10000);
	
    obj.msg = obj.msg.replace(/&/g, '').replace(/\r\n/g, '<br>');
    switch (obj.state) {
        case 0:
            showMsg(obj.msg || '准入客户端正在升级，请稍后打开浏览器重试。若长时间未升级成功，可以点击下载链接下载准入客户端后进行手动安装！');
            if (!obj.msg) {
                doShowStep(true);
            }
            break;
        case 1:
            showMsg(obj.msg || '规则检测已经完成，可以正常上网！');
            clearInterval(checkTimer);
            redirect();
            break;
        case 2:
        case 3:
            showMsg(obj.msg || '您的电脑还未安装网络准入系统');
			if (!obj.msg) {
                doShowStep(true);
            }
            break;
        default:
            break;
    }
}

function showMsg(msg) {
    msg = msg || '';
    var dom = document.getElementById('loading');
    if (dom) {
        dom.innerHTML = msg;
    }
}

function doShowStep(doShow) {
    var dom = document.getElementById('install-step');
    if (dom) {
        dom.style.display = doShow ? 'block' : 'none';
    }
}

function redirect() {
    var url = window.location.href,
        index = url.indexOf('?');

    if (index > -1) {
        url = url.substr(index + 1);
        index = url.indexOf('://');
        if (index === -1) {
            url = 'http://' + url;
        }
        window.location = url;
    }
}

function onLocationSingress() {
    var ipaddress = "http://" + window.location.hostname + ":817/singress.exe";
    window.open(ipaddress);
}

</script>

<div id="content">
    <h1 class="warning">网络准入系统</h1>
    <div class="partition">
        <span class="partition_left" style="width:170px;"></span>
    </div>
    <p class="b_distance">依据组织的上网安全策略，您需要先在计算机上安装网络准入系统，并通过对计算机安全情况的检查，才能继续访问网络。</p>
    <p style="word-wrap: break-word; word-break: normal;">
        <span id="loading"></span><span id="loading-dot" style="display:none;">.</span>
    </p>
    <p>
        <span id="ScriptDiv"></span>
    </p>
    <br>

    <div id="install-step" style="display:none;">
        <p> <b>安装方法：</b>
        </p>
        <ol>
            <li>
                点击
                <a href="#" onclick="onLocationSingress()">下载</a>
                下载安装包，手动安装
            </li>
        </ol>
    </div>
</div>
</body>
</html>
