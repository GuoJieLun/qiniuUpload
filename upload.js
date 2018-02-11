const qiniu = require("qiniu");

const accessKey = '你的accessKey';
const secretKey = '你的secretKey';

/**
 * 鉴权对象mac
 * @type {auth.digest.Mac|*|Mac}
 */
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

/**
 * 构建配置类
 * @type {conf.Config|exports.Config}
 */
const config = new qiniu.conf.Config();

/**
 * 初始化上传对象
 * @type {form_up.FormUploader|*|FormUploader}
 */
const formUploader = new qiniu.form_up.FormUploader(config);


/**
 * 扩展参数
 * @type {resume_up.PutExtra|form_up.PutExtra|*|PutExtra}
 */
const putExtra = new qiniu.form_up.PutExtra();


/**
 * 资源管理相关的操作首先要构建对象
 * （bucketManager 应该是获取操作权限的） PS：纯属个人克烈
 * @type {rs.BucketManager|*|BucketManager}
 */
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

    /**
     * 获取到验证的token
     * @param bucket
     * @param key
     * @returns {string}
     */
    static uptoken(bucket, key) {
        let options = {
            scope: bucket + ":" + key
        };
        let putPolicy = new qiniu.rs.PutPolicy(options);
        let uploadToken = putPolicy.uploadToken(mac);
        return uploadToken;
    }

    /**
     * 上传
     * @param uptoken
     * @param key
     * @param localFile
     * @returns {Promise}
     */
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

    /**
     * 删除
     * @param key 要删除的图片名
     * bucket 要删除的图片所属空间
     */
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
