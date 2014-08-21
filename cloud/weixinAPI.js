var weixin = require('cloud/node-weixin/node-weixin.js').init({
    url: '/',
    token: 'RobinKam'
});

weixin.errMsg(function (err) {
    console.log(err);
});

/**
 * 监听广本消息
 */
weixin.textMsg(function (msg) {
    weixin.postMsg({
        FromUserName: msg.ToUserName,
        ToUserName: msg.FromUserName,
        CreateTime: new Date().getTime(),
        MsgType: 'text',
        Content: '哈哈'   //广本内容
    });
    console.log(msg);
});

/**
 * 监听图片消息
 */
weixin.imageMsg(function (msg) {
    weixin.postMsg({
        FromUserName: msg.ToUserName,
        ToUserName: msg.FromUserName,
        CreateTime: new Date().getTime(),
        MsgType: 'image',
        MediaId: msg.MediaId
    });
    console.log(msg);
});

/**
 * 监听语音消息
 */
weixin.voiceMsg(function (msg) {
    weixin.postMsg({
        FromUserName: msg.ToUserName,
        ToUserName: msg.FromUserName,
        CreateTime: new Date().getTime(),
        MsgType: 'voice',
        MediaId: msg.MediaId
    });
    console.log(msg);
});

/**
 * 监听视频消息
 */
weixin.videoMsg(function (msg) {
    weixin.postMsg({
        FromUserName: msg.ToUserName,
        ToUserName: msg.FromUserName,
        CreateTime: new Date().getTime(),
        MsgType: 'video',
        MediaId: msg.MediaId,
        ThumbMediaId: msg.ThumbMediaId
    });
    console.log(msg);
});

/**
 * 监听上报地理位置消息
 */
weixin.locationMsg(function (msg) {
    weixin.postMsg({
        FromUserName: msg.ToUserName,
        ToUserName: msg.FromUserName,
        CreateTime: new Date().getTime(),
        MsgType: 'music',
        Title: '果果的原创音乐',
        Description: '果果的原创音乐介绍',
        MusicUrl: 'http://qiniu.tuhuangzhe.com/audio/%E7%9B%B8%E6%80%9D%E5%90%9F2.wav?avthumb/mp3/ab/192k',
        HQMusicUrl: 'http://qiniu.tuhuangzhe.com/audio/%E7%9B%B8%E6%80%9D%E5%90%9F2.wav?avthumb/mp3/ab/250k',
        ThumbMediaId: ThumbMediaId //要使用自己上传的一张图的MediaId
    });
    console.log(msg);
});

/**
 * 监听链接消息
 */
weixin.linkMsg(function (msg) {
    weixin.postMsg({
        FromUserName: msg.ToUserName,
        ToUserName: msg.FromUserName,
        CreateTime: new Date().getTime(),
        MsgType: 'news',
        Articles: [
            {
                Title: 'aa',
                Description: 'bb',
                PicUrl: 'http://feeloc08.u.qiniudn.com/1385473580021/1385473580021.jpg?imageView/2/w/320',
                Url: 'http://blog.feeloc.cn'
            },
            {
                Title: 'aa',
                Description: 'bb',
                PicUrl: 'http://feeloc08.u.qiniudn.com/1385473580021/1385473580021.jpg?imageView/2/w/320',
                Url: 'http://blog.feeloc.cn'
            }
        ]
    });
    console.log(msg);
});

/**
 * 点击关注
 */
weixin.subEventMsg(function (msg) {
    console.log(msg);
});

/**
 * 取消关注
 */
weixin.unsubEventMsg(function (msg) {
    console.log(msg);
});

/**
 * 扫自定义二维码
 */
weixin.scanEventMsg(function (msg) {
    console.log(msg);
});

/**
 * 进入会话
 */
weixin.enterEventMsg(function (msg) {
    console.log(msg);
});

/**
 * 上报地理位置
 */
weixin.locationEventMsg(function (msg) {
    console.log(msg);
});

/**
 * 点击自定义菜单事件
 */
weixin.clickEventMsg(function (msg) {
    console.log(msg);
});

exports.token = function (req, res) {
    if (weixin.signature(req)) {
        res.send(200, req.query.echostr);
    } else {
        res.send(200, 'fail');
    }
};

exports.msg = function (req, res) {
    weixin.getMsg(req, res);
};