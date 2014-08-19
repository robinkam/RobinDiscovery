// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();

//var utils = require('express/node_modules/connect/lib/utils.js');
var xml2js = require('xml2js');
var wechat = require('cloud/wechat.js');

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件
//app.use(xmlBodyParser);

//function xmlBodyParser(req, res, next) {
//    if (req._body) return next();
//    req.body = req.body || {};
//
//    // ignore GET
//    if ('GET' == req.method || 'HEAD' == req.method) return next();
//
//    // check Content-Type
//    if ('text/xml' != utils.mime(req)) return next();
//
//    // flag as parsed
//    req._body = true;
//
//    // parse
//    var buf = '';
//    req.setEncoding('utf8');
//    req.on('data', function(chunk){ buf += chunk });
//    req.on('end', function(){
//        var parseString = xml2js.parseString;
//        parseString(buf, function(err, json) {
//            if (err) {
//                err.status = 400;
//                next(err);
//            } else {
//                req.body = json;
//                next();
//            }
//        });
//    });
//};

// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/hello', function(req, res) {
    var username = req.query.username;
    if(username)
        res.render('hello', { message: 'Hello, '+username });
    else
        res.render('hello', { message: 'Hello, Guest'})
});


app.get('/wechatCallback', function(req, res) {
    var echoStr = req.query.echostr;
    //valid signature , option
    var signature = req.query.signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var token = "RobinKam";

    if( wechat.isLegel(signature, timestamp, nonce, token) ){
        console.log("Signature: "+echoStr);
        res.render('wechatCallback', {echoStr: echoStr});
    }else{
        console.log("Check Signature Failed");
        res.end();
    }
});

app.post('/wechatCallback/wechatResponseMessage', function(req, res) {
//    res.render('wechatResponseMessage', { echoStr: 'RobinKam' });
    var parseString = xml2js.parseString;
    var xml = req.body;
//    var xml = '<xml><ToUserName><![CDATA[toUser]]></ToUserName><FromUserName><![CDATA[fromUser]]></FromUserName><CreateTime>1357290913</CreateTime><MsgType><![CDATA[voice]]></MsgType><MediaId><![CDATA[media_id]]></MediaId><Format><![CDATA[Format]]></Format><MsgId>1234567890123456</MsgId><Content><![CDATA[this is a test]]></Content></xml>';
    console.dir(xml);
    parseString(xml, function (err, result) {
        if(err){
            console.dir(err);
            res.end();
        }else{
            console.dir(result);
            res.set('Content-Type', 'application/xml');
            res.render('wechatResponseMessage', {
                ToUserName: result.xml.ToUserName,
                FromUserName: result.xml.FromUserName,
                CreateTime: result.xml.CreateTime,
                MsgType: result.xml.MsgType,
                Content: result.xml.Content
            });
        }
    });
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();