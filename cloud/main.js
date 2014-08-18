require("cloud/app.js");
// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
AV.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

AV.Cloud.define("wechatCallback", function(requst, response){
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


});

AV.Cloud.define("wechatResonseMessage", function(requst, response){

});