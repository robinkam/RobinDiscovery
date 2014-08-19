// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件

// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/hello', function(req, res) {
  res.render('hello', { message: 'Congrats, you just set up your app!' });
});


app.get('/wechatCallback', function(req, res) {
//    AV.Cloud.run("wechatCallback", req, {
//        success: function(data){
//            //调用成功，得到成功的应答data
//            console.log(data);
//        },
//        error: function(err){
//            //处理调用失败
//            console.log(err);
//        }
//    });
    var echoStr = request.params.echostr;
    console.log(echoStr);

    //valid signature , option
    var signature = request.params.signature;
    var timestamp = request.params.timestamp;
    var nonce = request.params.nonce;

    var token = "RobinKam";
    var tmpArr = [token, timestamp, nonce];
    var tmpStr = tmpArr.sort().join('');
    tmpStr = require('crypto').createHash('sha1').update(tmpStr).digest('hex');

    if( tmpStr == signature ){
        console.log("Signature: "+echoStr);
        response.success(echoStr);
    }else{
        console.log("Check Signature Failed");
    }
//    res.render('wechatCallback', { echoStr: 'RobinKam```' });
});

app.get('/wechatResponseMessage', function(req, res) {
    res.render('wechatResponseMessage', { echoStr: 'RobinKam' });
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();