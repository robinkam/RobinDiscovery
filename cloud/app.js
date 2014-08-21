// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();

var myWeixinAPI = require('cloud/myWeixinAPI.js');
var weixinAPI = require('cloud/weixinAPI.js')
//var weixinAPI = require('node-weixin');

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件

// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/hello', function(req, res) {
    var username = req.query.username;
    if(username)
        res.render('hello', { message: 'Hello, '+username });
    else
        res.render('hello', { message: 'Hello, Guest'})
});

app.get('/weixin', function(req, res){
    console.log('Handling GET request to /weixin...');
    weixinAPI.token(req, res);
});

app.post('/weixin', function(req, res){
    console.log('Handling POST request to /weixin...');
    myWeixinAPI.logRequestMainContent(req);
    myWeixinAPI.validateSignature(req, res);

    try{
        weixinAPI.msg(req, res);
    }catch (error){
        console.log('Error when executing weixinAPI.msg(req, res);\n'+error);
    }
});

app.get('/wechatCallback', function(req, res) {
    console.log('Handling GET request to /wechatCallback...');
    weixinAPI.token(req, res);
});

app.post('/wechatCallback', function(req, res) {
    console.log('Handling POST request to /wechatCallback...');
    myWeixinAPI.logRequestMainContent(req);
    myWeixinAPI.validateSignature(req, res);
    try {
        myWeixinAPI.processMessage(req, res);
    }catch (erro){
        console.log('Error when executing myWeixinAPI.processMessage(req, res);\n'+error);
    }
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();