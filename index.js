require("babel-core/register");
require("./app.js"); //app.js 是正式启动的express服务的代码
require("babel-core").transform("code", {
    plugins: ["transform-runtime"]
});