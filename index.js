//主程序入口文件
var express = require('express');
var mymodule = require('./lib/mymodule');
var credentials = require('./lib/credentials.js');
var emailService = require('./lib/email.js')(credentials);
var formidable = require('formidable');
var jqupload = require('jquery-file-upload-middleware');
var app = express();

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

app.use(require('body-parser')());
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')());
app.use(express.static(__dirname+'/public'));//static中间件,express.static指定静态文件目录
app.use(function(req, res, next){//简单中间件例子
	console.log('处理请求 "' + req.url + '"....');
	next();
});
app.use(function(req, res, next){//如果有即显消息，把它传到上下文中，然后清除它
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});
app.use(function(req, res, next) {//页面测试中间件，检测查询字符串中的test=1
	res.locals.showTests = app.get('env')!='production'&&req.query.test ==='1';
	next();
});
app.use('/upload', function(req, res, next){
	var now = Date.now();
	jqupload.fileHandler({
		uploadDir: function(){
			return __dirname + '/public/uploads/' + now;
		},
		uploadUrl: function(){
			return '/uploads/' + now;
		},
	})(req, res, next);
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
app.get('/upload-cover',function(req,res){//文件上传示例
	var now = new Date();
	res.render('upload-cover',{
		year: now.getFullYear(),
		month: now.getMonth()
	});
});
app.post('/upload-cover/:year/:month', function(req, res){//文件上传示例
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		if(err) return res.redirect(303, '/error');
		console.log('收到的字段:');
		console.log(fields);
		console.log('收到的文件:');
		console.log(files);
		res.redirect(303, '/thank-you');
	});
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
