// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();

var util = require('util');
var wechat = require('cloud/wechat.js');

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

app.get('/wechatCallback', function(req, res) {
    console.log('Handling GET request...');
    var echostr=req.query.echostr;
    var isSignatureValid=wechat.isSignatureValid(req);
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
    console.log('The request params:'+util.inspect(req.params));
    console.log('The request query: '+util.inspect(req.query));
    console.log('The request body: '+util.inspect(req.body));
    console.log('The request raw body: '+util.inspect(req.rawBody));

    var isSignatureValid=wechat.isSignatureValid(req);
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
        wechat.processMessage(formData, res);
    });
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();