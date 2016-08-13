//主程序入口文件
var express = require('express');
var mymodule = require('./lib/mymodule');
var app = express();
app.use(require('body-parser')());


var handlebars = require('express3-handlebars')
					.create({
						defaultLayout: 'main',
						//extname: '.hbs',//更改扩展名
						helpers: {
							section: function(name, options){
								if(!this._sections) this._sections = {};
								this._sections[name] = options.fn(this);
								return null;
							}
						}
					});
app.engine('handlebars', handlebars.engine);//设置模板引擎，处理指定的后缀名文件
app.set('view engine', 'handlebars');//指定渲染模板文件的后缀名

app.set('port', process.env.PORT || 3000);

//static 中间件,express.static指定静态文件的查找目录
app.use(express.static(__dirname+'/public'));


//页面测试中间件，检测查询字符串中的test=1
app.use(function(req, res, next) {
	res.locals.showTests = app.get('env')!='production'&&req.query.test ==='1';
	next();
});


//路由
app.get('/', function(req, res) {
	res.render('home');
});
app.get('/about', function(req, res) {
	res.render('about', {
		MovieName: mymodule.getMovieName(),
		pageTestScript: '/qa/tests-about.js'
	});
});
app.get('/jquerytest', function(req, res) {//测试段落section
	res.render('jquerytest');
});
app.get('/client-template', function(req, res) {//客户端模板
	res.render('client-template');
});
app.get('/data/client-template', function(req, res) {//客户端模板
	res.json({
		animal: 'squirrel',
		bodyPart: 'tail',
		adjective: 'bushy',
		noun: 'heck',
	});
});
app.get('/newsletter', function(req, res) {//表单处理
	res.render('newsletter', {csrf: "CSRF token goes here"});
});
app.post('/process', function(req, res) {//表单处理
	if (req.xhr || req.accepts('json, html')==='json') {
		res.send({success: true});
	} else {
		res.redirect(303, '/thank-you');
	}
});
app.get('/workroom/dreamworks', function(req, res) {
	res.render('/workroom/dreamworks');
});
app.get('/workroom/dreamworks-rate', function(req, res) {
	res.render('/workroom/dreamworks-rate');
});
app.get('/headers', function(req, res) {//示例：查看浏览器发送信息
	res.set('Content-Type', 'text/plain');
	var s = '';
	for (var name in req.headers) s += name+":"+req.headers[name]+'\n';
	res.send(s);
});

//404页面
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(404).render('404');
});
//500页面
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500).render('500');
});

app.listen(app.get('port'), function() {
	console.log('Start on http://localhost:'+app.get('port')+'; 摁Ctrl+C结束终端terminate');
});
