var crypto=require("crypto");
var xml2js = require('xml2js');
var util = require('util');

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

function validateSignature(req, res){
    var token = 'RobinKam';
    var signature=req.query.signature;
    var timestamp=req.query.timestamp;
    var nonce=req.query.nonce;
    var isSignatureValid = isLegel(signature, timestamp, nonce, token);
    console.log('Verify Signature Result: '+isSignatureValid);
    if(!isSignatureValid){
        res.write('Signature validation failed.');
        res.end();
    }
}

function logRequestMainContent(req){
    console.log('Handling POST request...');
    console.log('The request original URL: '+req.originalUrl);
    console.log('The request headers: '+util.inspect(req.headers));
    console.log('The request query: '+util.inspect(req.query));
}

function processMessage(req,res){
    var formData="";
    req.on("data",function(data){
        formData+=data;
    });
    req.on("end",function(){
        var xml = formData;
        var parseString = xml2js.parseString;
        console.log('Got post body: '+xml);
        parseString(xml, function (err, result) {
            if(err){
                console.log('XML Parsing Error: ');
                console.dir(err);
                res.write('XML to JSON failed with Error: '+console.dir(err));
            }else{
                console.log('XML to JSON Result: ')
                console.dir(result);

                var MsgType = result.xml.MsgType;
                switch (MsgType) {
                    case 'text':
                        handleTextMsg(result.xml, res);   //文本消息
                        break;
                    case 'image':
                        handleImageMsg(result.xml, res);  //图片消息
                        break;
                    case 'voice':
                        this.handleVoiceMsg();  //语音消息
                        break;
                    case 'video':
                        this.handleVideoMsg();  //视频消息
                        break;
                    case 'location':
                        this.handleLocationMsg();   //地理位置消息
                        break;
                    case 'link':
                        this.handleLinkMsg();   //链接消息
                        break;
                    case 'event':
                        this.handleEventMsg();  //事件消息
                        break;
                }




            }
            res.end();
        });
    });
}

function handleTextMsg(msg, res){
    if(msg.Content=='我的照片'){
        replyTextMessage(msg, res, '不好意思，这个功能还在开发中哦~');
    }else{
        replyTextMessage(msg, res, '请发送上传一张照片，丽之为您定制礼物哦~');
    }
}

function handleImageMsg(msg, res){
    AV.Cloud.run('savePictureForWechatUser', {picUrl:result.xml.PicUrl, userId:result.xml.FromUserName}, {
        success: function(result) {
            res.set('Content-Type', 'text/xml');
            replyTextMessage(msg, res, '图片已上传成功，回复"我的照片"查看最后一张上传的照片。')
        },
        error: function(error) {
            console.log('AV.Cloud.run(savePictureForWechatUser) failed.');
        }
    });
}

function replyTextMessage(msg, res, txt){
    res.render('wechatResponseMessage', {
        ToUserName: msg.FromUserName,
        FromUserName: msg.ToUserName,
        CreateTime: new Date().getTime(),
        MsgType: 'text',
        Content: txt
    });
}

module.exports.isLegel=isLegel;
module.exports.validateSignature=validateSignature;
module.exports.logRequestMainContent = logRequestMainContent;
module.exports.processMessage=processMessage;