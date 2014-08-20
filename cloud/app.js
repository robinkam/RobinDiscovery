// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();

var util = require('util');
var myWeixinAPI = require('cloud/myWeixinAPI.js');

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件


var wechat = require('../node_modules/wechat');

app.use(express.query());
app.use('/wechat', wechat('RobinKam', function (req, res, next) {
    // 微信输入信息都在req.weixin上
    var message = req.weixin;
    if (message.FromUserName === 'diaosi') {
        // 回复屌丝(普通回复)
        res.reply('hehe');
    } else if (message.content === '你好') {
        //你也可以这样回复text类型的信息
        res.reply({
            content: 'Hello',
            type: 'text'
        });
    } else if (message.content === '音乐') {
        // 回复一段音乐
        res.reply({
            type: "music",
            content: {
                title: "来段音乐吧",
                description: "小苹果",
                musicUrl: "http://music.baidu.com/data/music/file?link=http://yinyueshiting.baidu.com/data2/music/122112390/12012502946800128.mp3?xcode=784e1a71858661f834bbd116c1a8a82f3f8882ee658cd7de&song_id=120125029",
                hqMusicUrl: "http://music.baidu.com/data/music/file?link=http://yinyueshiting.baidu.com/data2/music/122112390/12012502946800128.mp3?xcode=784e1a71858661f834bbd116c1a8a82f3f8882ee658cd7de&song_id=120125029"
            }
        });
    } else if (message.content === '图文')  {
        // 回复高富帅(图文回复)
        res.reply([
            {
                title: '你来我家接我吧',
                description: '这是女神与高富帅之间的对话',
                picurl: 'http://c.hiphotos.baidu.com/ting/pic/item/203fb80e7bec54e7959af539ba389b504fc26aa7.jpg',
                url: 'http://music.baidu.com/topic/special/taiminace?pst=jiaodian'
            }
        ]);
    }
}));

// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/hello', function(req, res) {
    var username = req.query.username;
    if(username)
        res.render('hello', { message: 'Hello, '+username });
    else
        res.render('hello', { message: 'Hello, Guest'})
});

app.get('/wechatCallback', function(req, res) {
    console.log('Handling GET request...');
    var echostr=req.query.echostr;
    var isSignatureValid=myWeixinAPI.isSignatureValid(req);
    console.log('Verify Signature Result: '+isSignatureValid);
    if(isSignatureValid){
        res.write(echostr);
    }else{
        res.write('Signature validation failed.');
    }
    res.end();
});

app.post('/wechatCallback', function(req, res) {
    console.log('Handling POST request...');
    console.log('The request original URL: '+req.originalUrl);
    console.log('The request headers: '+util.inspect(req.headers));
    console.log('The request query: '+util.inspect(req.query));

    var isSignatureValid=myWeixinAPI.isSignatureValid(req);
    console.log('Verify Signature Result: '+isSignatureValid);
    if(!isSignatureValid){
        res.write('Signature validation failed.');
        res.end();
        return;
    }

    var formData="";
    req.on("data",function(data){
        formData+=data;
    });
    req.on("end",function(){
        myWeixinAPI.processMessage(formData, res);
    });
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();