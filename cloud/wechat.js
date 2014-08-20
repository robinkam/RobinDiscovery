var crypto=require("crypto");

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

function processMessage(data,response){

}

module.exports.isLegel=isLegel;
module.exports.isSignatureValid=isSignatureValid;
module.exports.processMessage=processMessage;