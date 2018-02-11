const qiniu = require("qiniu");

const accessKey = '你的accessKey';
const secretKey = '你的secretKey';
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const config = new qiniu.conf.Config();
const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();
const bucketManager = new qiniu.rs.BucketManager(mac, config);

const path = require('path');

export default class UploadFile {

    static async upload(req, res) {

        //上传的空间名
        let bucket = 'test';
        //上传后保存的文件名
        let key = 'images/'+ req.files.image.path.split(path.sep).pop();
        //要上传文件的本地路径
        let filePath = req.files.image.path;
        //生成上传 Token
        let token = this.uptoken(bucket, key);


        let result = await this.uploadFile(token, key, filePath);

        return result;

    }

    static uptoken(bucket, key) {
        let options = {
            scope: bucket + ":" + key
        };
        let putPolicy = new qiniu.rs.PutPolicy(options);
        let uploadToken = putPolicy.uploadToken(mac);
        return uploadToken;
    }

    static  uploadFile(uptoken, key, localFile) {
        return new Promise((resolve, reject) => {
            formUploader.putFile(uptoken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
                if (respErr) {
                    resolve({
                        ret: 0,
                        data: respErr,
                        messages: '上传失败'
                    })
                }
                if (respInfo.statusCode == 200) {
                    /**
                     * http://image.guojielun.com/
                     * 此处是我配置的映射的二级域名，如果有备案的的童鞋
                     * 如果没有域名请使用七牛分配的域名：xxxxx.bkt.clouddn.com
                     * @type {string}
                     */
                    respBody.key = 'http://image.guojielun.com/'+respBody.key;
                    resolve({
                        ret: 0,
                        data: respBody,
                        messages: '上传成功'
                    })
                }


            });
        });
    }

    static delImg(key) {
        let bucket = "test";
        var key = "my-nodejs-logo.png";
        bucketManager.delete(bucket, key, function (err, respBody, respInfo) {
            if (err) {
                console.log(err);
                //throw err;
            } else {
                console.log(respInfo.statusCode);
                console.log(respBody);
            }
        });
    }
}
