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
    tmpArr.sort();
    var tmpStr = tmpArr.toString();
//    tmpArr.forEach(function(element, index, array){
//        tmpStr+=element;
//    });
    tmpStr = crypto.createHash(tmpStr);

    if( tmpStr == signature ){
        console.log("Signature: "+echoStr);
    }else{
        console.log("Check Signature Failed");
    }


});

AV.Cloud.define("wechatResonseMessage", function(requst, response){

});