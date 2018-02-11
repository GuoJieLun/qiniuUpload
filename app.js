var express = require('express');
const path = require('path');
const app = express();
import UploadFile from './upload'



/**
 * express-formidable
 * 可用于处理表单和上传文件，功能大而全,可配置项非常多，最大的区别是还提供了一个对象,用于处理各种事件
 * 传送门：https://www.npmjs.com/package/express-formidable
 */
const formidable = require('formidable');
app.use(function (req, res, next) {
    var form = new formidable.IncomingForm({
        encoding: 'utf-8',
        // uploadDir:  path.join(__dirname, '/Upload'), 转存到7牛的话 请注释这句话
        multiples: true,
        keepExtensions: true
    })
    form.once('error', console.log)
    form.parse(req, function (err, fields, files) {
        Object.assign(req, {fields, files});
        next();
    })
})


/**
 * 配置静态文件路径
 */
app.use('/', express.static(path.join(__dirname, 'public')));


/**
 * 监听上传入口
 */
app.post('/upload', async (req, res,next) =>{
    let ret = await UploadFile.upload(req,res);
    console.log(ret);
    res.json(ret);
});


app.listen(8234, function () {

    console.log("程序启动完毕～")

})