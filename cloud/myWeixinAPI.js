var crypto=require("crypto");
var xml2js = require('xml2js');

function isLegel(signature,timestamp,nonce,token){
    var array=new Array();
    array[0]=timestamp;
    array[1]=nonce;
    array[2]=token;
    array.sort();
    var hasher=crypto.createHash("sha1");
    var msg=array[0]+array[1]+array[2];
    hasher.update(msg);
    var msg=hasher.digest('hex');
    if(msg==signature){
        return true;
    }else{
        return false;
    }
}

function isSignatureValid(req){
    var token = 'RobinKam';
    var signature=req.query.signature;
    var timestamp=req.query.timestamp;
    var nonce=req.query.nonce;
    var result = isLegel(signature, timestamp, nonce, token);
    return result;
}

function processMessage(data,res){
    var xml = data;
    var parseString = xml2js.parseString;
//    var xml = '<xml><ToUserName><![CDATA[toUser]]></ToUserName><FromUserName><![CDATA[fromUser]]></FromUserName><CreateTime>1357290913</CreateTime><MsgType><![CDATA[voice]]></MsgType><MediaId><![CDATA[media_id]]></MediaId><Format><![CDATA[Format]]></Format><MsgId>1234567890123456</MsgId><Content><![CDATA[this is a test]]></Content></xml>';
    console.log('Got post body: '+xml);
    parseString(xml, function (err, result) {
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
}

module.exports.isLegel=isLegel;
module.exports.isSignatureValid=isSignatureValid;
module.exports.processMessage=processMessage;