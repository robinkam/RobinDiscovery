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
        res.send('Signature validation failed.');
    }
}

function logRequestMainContent(req){
    console.log('The request original URL: '+req.originalUrl);
    console.log('The request headers: '+util.inspect(req.headers));
    console.log('The request query: '+util.inspect(req.query));
}

function endResponseWithMessage(msg, res){
    console.log(msg);
    res.send(msg);
}

function endResponseWithError(when, error, res){
    console.log('Error ('+util.inspect(error)+') occurred when '+when);
    res.send('Something went wrong.');
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
                endResponseWithError('XML to JSON failed', err, res);
            }else{
                console.log('XML to JSON Result: '+util.inspect(result));

                var MsgType = result.xml.MsgType;
                if(MsgType=='text'){
                    handleTextMsg(result.xml, res);   //文本消息
                }else if(MsgType=='image'){
                    handleImageMsg(result.xml, res);  //图片消息
                }else if(MsgType=='event'){
                    handleEventMsg(result.xml, res);    //事件消息
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
        });
    });
}

function handleTextMsg(msg, res){
    console.log('handleTextMsg: '+util.inspect(msg));
    if(msg.Content=='我的照片'){
//        replyTextMessage(msg, res, '不好意思，这个功能还在开发中哦~');
        getPictureByWechatMessage(msg, res);
    }else{
        replyTextMessage(msg, res, '请发送上传一张照片，丽之为您定制礼物哦~');
    }
}

function handleImageMsg(msg, res){
    console.log('handleImageMsg: '+util.inspect(msg));
    savePictureForWechatUser(msg, res);
}

function handleEventMsg(msg, res){
    var event = msg.Event;
    if(event=='subscribe'){
        replyTextMessage(msg, res, '欢迎关注！请发送上传一张照片，丽之为您定制礼物哦~');
    }
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
    res.render('wechatTextReplyMessage', reply);
}

function replyImageMessage(msg, res, wechatUserAsset){
    var reply = {
        ToUserName: msg.FromUserName,
        FromUserName: msg.ToUserName,
        CreateTime: new Date().getTime(),
        MsgType: 'image',
        MediaId: wechatUserAsset.mediaId
    };
    console.log('replyImageMessage: '+util.inspect(reply));
    res.render('wechatImageReplyMessage', reply);
}

function savePictureForWechatUser(msg, res){
    if(msg.PicUrl.count==0){
        endResponseWithMessage('No PicUrl', res);
        return;
    }
    //先查找有没有重复的图片
    var WechatUserAsset = AV.Object.extend("WechatUserAsset");
    var query = new AV.Query(WechatUserAsset);
    query.equalTo("userId", msg.FromUserName[0]);
    query.equalTo("assetUrl", msg.PicUrl[0]);
    query.find({
        success: function(results) {
            // Do something with the returned AV.Object values
            if (results.length>0){//找到重复图片，则什么也不做
                endResponseWithMessage('Picture existed for user: '+msg.FromUserName+' with URL: '+msg.PicUrl, res);
                return;
            }else{//没有重复图片，则存入数据库
                var file = AV.File.withURL('photo.jpg', msg.PicUrl[0]);
                file.save().then(function() {
                    // The file has been saved to AV.
                    var avObject = new AV.Object("WechatUserAsset");
                    avObject.set("type", 'image');
                    avObject.set("userId", msg.FromUserName[0]);
                    avObject.set("msgId", msg.MsgId[0]);
                    avObject.set("createTime", msg.CreateTime[0]);
                    avObject.set("mediaId", msg.MediaId[0]);
                    avObject.set("assetUrl", msg.PicUrl[0]);
                    avObject.set("asset", file);
                    avObject.save().then(function(){
                        replyTextMessage(msg, res, '图片已上传成功，回复"我的照片"查看最后一张上传的照片。');
                    }, function(error){
                        endResponseWithError('saving WechatUserAsset object', error, res);
                    });
                }, function(error) {
                    // The file either could not be read, or could not be saved to AV.
                    endResponseWithError('saving picture for Wechat user', error, res);
                });
            }
        },
        error: function(error) {
            endResponseWithError('finding WechatUserAsset object', error, res);
        }
    });
}

function findExistedPictureByWechatMessage(msg, res){
    var WechatUserAsset = AV.Object.extend("WechatUserAsset");
    var query = new AV.Query(WechatUserAsset);
    query.equalTo("userId", msg.FromUserName[0]);
    query.equalTo("assetUrl", msg.PicUrl[0]);
    query.find({
        success: function(results) {
            // Do something with the returned AV.Object values
            return results.length>0;
        },
        error: function(error) {
            endResponseWithError("findExistedPictureByWechatMessage", error, res);
        }
    });
}

function getPictureByWechatMessage(msg, res){
    var WechatUserAsset = AV.Object.extend("WechatUserAsset");
    var query = new AV.Query(WechatUserAsset);
    query.equalTo("userId", msg.FromUserName[0]);
    query.descending("createdAt");
    query.find({
        success: function(results) {
            // Do something with the returned AV.Object values
            if(results.length>0){
                replyImageMessage(msg, res, results[0]._serverData);
            }else{
                replyTextMessage(msg, res, '您最近没有发过图片哦~');
            }
        },
        error: function(error) {
            endResponseWithError("getPictureByWechatMessage", error, res);
        }
    });
}

module.exports.isLegel=isLegel;
module.exports.validateSignature=validateSignature;
module.exports.logRequestMainContent = logRequestMainContent;
module.exports.processMessage=processMessage;