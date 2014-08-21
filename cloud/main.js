require("cloud/app.js");
// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
AV.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

AV.Cloud.define("Logger", function(request, response) {
    console.log(request.params);
    response.success();
});

AV.Cloud.define("savePictureForWechatUser", function(requst, response){
    var file = AV.File.withURL('photo.jpg', request.params.PicURL)
    file.save().then(function() {
        // The file has been saved to AV.
        var avObject = new AV.Object("WechatUserAsset");
        avObject.set("userId", "Joe Smith");
        avObject.set("type", 'image');
        avObject.set("asset", file);
        avObject.save();
    }, function(error) {
        // The file either could not be read, or could not be saved to AV.
        console.log('Error in Cloud Function (savePictureForWechatUser): '+error);
    });;
});

AV.Cloud.define("getPictureByWechatUser", function(requst, response){

});