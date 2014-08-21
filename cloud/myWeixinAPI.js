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
                if(MsgType=='text'){
                    handleTextMsg(result.xml, res);   //文本消息
                }else if(MsgType=='image'){
                    handleImageMsg(result.xml, res);  //图片消息
                }
//                switch (MsgType) {
//                    case 'text':
//                        handleTextMsg(result.xml, res);   //文本消息
//                        break;
//                    case 'image':
//                        handleImageMsg(result.xml, res);  //图片消息
//                        break;
//                    case 'voice':
//                        this.handleVoiceMsg();  //语音消息
//                        break;
//                    case 'video':
//                        this.handleVideoMsg();  //视频消息
//                        break;
//                    case 'location':
//                        this.handleLocationMsg();   //地理位置消息
//                        break;
//                    case 'link':
//                        this.handleLinkMsg();   //链接消息
//                        break;
//                    case 'event':
//                        this.handleEventMsg();  //事件消息
//                        break;
//                }
            }
            res.end();
        });
    });
}

function handleTextMsg(msg, res){
    console.log('handleTextMsg: '+util.inspect(msg));
    if(msg.Content=='我的照片'){
        replyTextMessage(msg, res, '不好意思，这个功能还在开发中哦~');
    }else{
        replyTextMessage(msg, res, '请发送上传一张照片，丽之为您定制礼物哦~');
    }
}

function handleImageMsg(msg, res){
    console.log('handleImageMsg: '+util.inspect(msg));
//    AV.Cloud.run('savePictureForWechatUser', {picUrl:msg.PicUrl, userId:msg.FromUserName}, {
//        success: function(result) {
//            replyTextMessage(msg, res, '图片已上传成功，回复"我的照片"查看最后一张上传的照片。')
//        },
//        error: function(error) {
//            console.log('AV.Cloud.run(savePictureForWechatUser) failed with error: ');
//            console.dir(error);
//        }
//    });
    if(msg.PicUrl.count==0){
        console.log('No PicUrl');
        return;
    }
    var file = AV.File.withURL('photo.jpg', msg.PicUrl[0]);
    file.save().then(function() {
        // The file has been saved to AV.
        var avObject = new AV.Object("WechatUserAsset");
        avObject.set("userId", msg.FromUserName[0]);
        avObject.set("type", 'image');
        avObject.set("asset", file);
        avObject.save().then(function(){
            replyTextMessage(msg, res, '图片已上传成功，回复"我的照片"查看最后一张上传的照片。');
        }, function(error){
            console.log('Error when saving WechatUserAsset object: '+util.inspect(error));
        });
    }, function(error) {
        // The file either could not be read, or could not be saved to AV.
        console.log('Error when saving picture for Wechat user: '+util.inspect(error));
    });
}

function replyTextMessage(msg, res, txt){
    var reply = {
        ToUserName: msg.FromUserName,
        FromUserName: msg.ToUserName,
        CreateTime: new Date().getTime(),
        MsgType: 'text',
        Content: txt
    };
    console.log('replyTextMessage: '+util.inspect(reply));
    res.render('wechatResponseMessage', reply);
}

module.exports.isLegel=isLegel;
module.exports.validateSignature=validateSignature;
module.exports.logRequestMainContent = logRequestMainContent;
module.exports.processMessage=processMessage;