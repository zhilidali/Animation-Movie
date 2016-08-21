var main = require('./handlers/main.js');
var room = require('./handlers/room.js');
var form = require('./handlers/form.js');
var samples = require('./handlers/samples.js');

module.exports = function(app) {

	app.get('/', main.home);
	app.get('/about', main.about);
	app.get('/movies', main.movies);

	app.get('/newsletter', form.newsletter);
	app.post('/process', form.process);//表单处理
	app.get('/upload-cover', form.uploadCover );//文件上传示例
	app.post('/upload-cover/:year/:month', form.uploadCoverPost);//文件上传示例

	app.get('/fail', samples.fail);//未捕获异常
	app.get('/jquerytest', samples.jquerytest);//测试段落section
	app.get('/client-template', samples.clientTemplate);//客户端模板
	app.get('/data/client-template', samples.clientTemplateData);//客户端模板
	app.get('/headers', samples.headers);//示例：查看浏览器发送信息
	app.get('/user/:name', samples.username);//路由参数

	//跨页测试
	app.get('/workroom', room.workroom);
	app.get('/workroom/dreamworks', room.dreamworks);

};
