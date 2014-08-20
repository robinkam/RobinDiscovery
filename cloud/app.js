// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();

//var middlewares = require('./express-middlewares-js');
//app.use('/weixin', middlewares.xmlBodyParser({
//    type: 'text/xml'
//}));

var xmlBodyParser = require('./express-xml-parser');
app.use('/weixin', xmlBodyParser({
    type: 'text/xml',
    limit: '1mb'
}));

//var utils = require('express/node_modules/connect/lib/utils.js');
var util = require('util');
var xml2js = require('xml2js');
var wechat = require('cloud/wechat.js');
//var myXMLBodyParser = require('cloud/myxmlbodyparser.js');

var WechatClient = require('./nodejs-wechat');
var opt = {
    token: 'RobinKam',
    url: '/weixin'
};
var wechatClient = new WechatClient(opt);

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件
//app.use(myXMLBodyParser.xmlBodyParser());



app.get('/weixin', wechatClient.verifyRequest.bind(wechatClient));
app.post('/weixin', wechatClient.handleRequest.bind(wechatClient));

wechatClient.on('text', function(session) {
    session.replyTextMsg('Hello World');
});


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

    var isSignatureValid=wechat.isSignatureValid(req);
    console.log('Verify Signature Result: '+isSignatureValid);
    if(!isSignatureValid){
        res.write('Signature validation failed.');
        res.end();
        return;
    }

    var parseString = xml2js.parseString;
    var xml = req.body;
//    var xml = '<xml><ToUserName><![CDATA[toUser]]></ToUserName><FromUserName><![CDATA[fromUser]]></FromUserName><CreateTime>1357290913</CreateTime><MsgType><![CDATA[voice]]></MsgType><MediaId><![CDATA[media_id]]></MediaId><Format><![CDATA[Format]]></Format><MsgId>1234567890123456</MsgId><Content><![CDATA[this is a test]]></Content></xml>';
    console.log('Got post body: '+util.inspect(xml));
    parseString(xml.body, function (err, result) {
        if(err){
            console.log('XML Parsing Error: ');
            console.dir(err);
            res.write('XML to JSON failed with Error: '+console.dir(err));
        }else{
            console.log('XML to JSON Result: ')
            console.dir(result);
//            res.set('Content-Type', 'application/xml');
            res.render('wechatResponseMessage', {
                ToUserName: result.xml.FromUserName,
                FromUserName: result.xml.ToUserName,
                CreateTime: result.xml.CreateTime,
                MsgType: result.xml.MsgType,
                Content: result.xml.Content
            });
        }
        res.end();
    });
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();