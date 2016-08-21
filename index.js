//主程序入口文件
var http = require('http');
var fs = require('fs');
var express = require('express');
var mymodule = require('./lib/mymodule');
var credentials = require('./lib/credentials.js');
var cartValidation = require('./lib/cartValidation.js');
var emailService = require('./lib/email.js')(credentials);
var formidable = require('formidable');
var jqupload = require('jquery-file-upload-middleware');
var Movie = require('./models/movie.js');
var mongoose = require('mongoose');
var vhost = require('vhost');

var app = express();
var opts = {
	server: {
		socketOptions: {keepAlive: 1}
	}
};
switch(app.get('env')){
	case 'development':
		mongoose.connect(credentials.mongo.development.connectionString, opts);
		break;
	case 'production':
		mongoose.connect(credentials.mongo.prodection.connectionString, opts);
		break;
	default:
		throw new Error('Unknow execution enviroment: ' + app.get('env'));
}

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


/*中间件*/
//使用域（更好的）错误处理
app.use(function(req, res, next){
	var domain = require('domain').create();// 为这个请求创建一个域
	domain.on('error', function(err){// 为这个请求创建一个域
		console.error('DOMAIN ERROR CAUGHT\n', err.stack);
		try {
			setTimeout(function(){// 在5 秒内进行故障保护关机
				console.error('Failsafe shutdown.');
				process.exit(1);
			}, 5000);

			// 从集群中断开
			var worker = require('cluster').worker;
			if(worker) worker.disconnect();

			// 停止接收新请求
			server.close();

			try {
				next(err);// 尝试使用Express 错误路由
			} catch(error){
				// 如果Express 错误路由失效，尝试返回普通文本响应
				console.error('Express error mechanism failed.\n', error.stack);
				res.statusCode = 500;
				res.setHeader('content-type', 'text/plain');
				res.end('Server error.');
			}
		} catch(error){
			console.error('Unable to send 500 response.\n', error.stack);
		}
	});

	// 向域中添加请求和响应对象
	domain.add(req);
	domain.add(res);

	// 执行该域中剩余的请求链
	domain.run(next);
});
//日志
switch(app.get('env')){
	case 'development':// 紧凑的、彩色的开发日志
		app.use(require('morgan')('dev'));
		break;
	case 'production':// 模块'express-logger' 支持按日志循环
		app.use(require('express-logger')({ path: __dirname + '/log/requests.log'}));
		break;
}
app.use(require('body-parser')());
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')());
app.use(express.static(__dirname+'/public'));//static中间件,express.static指定静态文件目录
app.use(cartValidation.checkWaivers);
app.use(cartValidation.checkGuestCounts);
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
//局部文件
function getFancy (){
	return {
		movieList: [
			{
				name: "爱宠大机密",
				workroom: "娱乐照明"
			},
			{
				name: "疯狂动物成",
				workroom: "迪士尼"
			}
		]
	};
}
app.use(function(req, res, next){
	if(!res.locals.partials) res.locals.partials = {};
	res.locals.partials.fancy = getFancy();
	next();
});

//创建子域名`admin`,应出现在所有其他路由之前
var admin = express.Router();
app.use(vhost('admin.*', admin));

//创建admin的路由，可在任何地方定义
admin.get('/', function(req, res){
	res.render('admin/home');
});
admin.get('users', function(req, res){
	res.render('admin/users');
});

//路由
/*app.get('/fail', function(req, res) {
	throw new Error('Node!');//未捕获异常
});*/
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
	res.render('newsletter', {csrf: "这里是CSRF令牌"});
});
/*
function NewsletterSignup(){
}
NewsletterSignup.prototype.save = function(cb){
	cb();
};
var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
app.post('/newsletter', function(req, res){
	var name = req.body.name || '', email = req.body.email || '';
	// input validation
	if(!email.match(VALID_EMAIL_REGEX)) {
		if(req.xhr) return res.json({ error: 'Invalid name email address.' });
		req.session.flash = {
			type: 'danger',
			intro: 'Validation error!',
			message: 'The email address you entered was  not valid.',
		};
		return res.redirect(303, '/newsletter/archive');
	}
	new NewsletterSignup({ name: name, email: email }).save(function(err){
		if(err) {
			if(req.xhr) return res.json({ error: 'Database error.' });
			req.session.flash = {
				type: 'danger',
				intro: 'Database error!',
				message: 'There was a database error; please try again later.',
			};
			return res.redirect(303, '/newsletter/archive');
		}
		if(req.xhr) return res.json({ success: true });
		req.session.flash = {
			type: 'success',
			intro: 'Thank you!',
			message: 'You have now been signed up for the newsletter.',
		};
		return res.redirect(303, '/newsletter/archive');
	});
});
app.get('/newsletter/archive', function(req, res){
	res.render('newsletter/archive');
});
*/
app.post('/process', function(req, res) {//表单处理
	if (req.xhr || req.accepts('json, html')==='json') {
		res.send({success: true});
	} else {
		res.redirect(303, '/thank-you');
	}
});

//跨页测试
app.get('/workroom', function(req, res) {
	res.render('workroom/workroom');
});
app.get('/workroom/dreamworks', function(req, res) {
	res.render('workroom/dreamworks');
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

//文件系统化
var dataDir = __dirname + '/data';// 确保存在目录data
var vacationPhotoDir = dataDir + '/vacation-photo';
if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if(!fs.existsSync(vacationPhotoDir)) fs.mkdirSync(vacationPhotoDir);
function saveContestEntry(contestName, email, year, month, photoPath){
	// TODO...这个稍后再做
}
app.post('/upload-cover/:year/:month', function(req, res){//文件上传示例
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		if(err) return res.redirect(303, '/error');
		if(err) {
			res.session.flash = {
				type: 'danger',
				intro: 'Oops!',
				message: '你的提交有一个错误处理。' +
				'请重试.',
			};
			return res.redirect(303, '/upload-cover');
		}
		var photo = files.photo;
		var dir = vacationPhotoDir + '/' + Date.now();
		var path = dir + '/' + photo.name;
		fs.mkdirSync(dir);
		fs.renameSync(photo.path, dir + '/' + photo.name);
		saveContestEntry('upload-cover', fields.email,
			req.params.year, req.params.month, path);
		req.session.flash = {
			type: 'success',
			intro: 'Good luck!',
			message: '你已经参加了比赛。',
		};
		res.redirect(303, '/thank-you');
	});
});
//持久化
Movie.find(function(err, movies){
	if(movies.length) return;

	new Movie({
		name: '宠物大机密',
		description: '2016年卖萌动画电影',
		workroom: '娱乐照明',
		notes: 100,
		tags: ['CG', '宠物的秘密生活', '娱乐照明'],
		city: ['美国'],
		sku: '0c39',
		date: '2016-08-03',
		available: true
	}).save();

	new Movie({
		name: '疯狂动物城',
		description: '迪士尼继超能陆战队又一最新力作',
		notes: 99,
		tags: ['动物乌托邦', 'CG', '迪士尼'],
		city: ['美国'],
		sku: 'HR1999',
		date: '2016-03',
		available: true
	}).save();
});
app.get('/movies', function(req, res) {
	Movie.find({ available: true }, function(err, movies){
		var context = {
			movies: movies.map(function(movie){
				movie.notes = movie.getNotes();
				return movie;
			})
		};
		res.render('movies', context);
	});
});
//路由参数
app.get('/user/:name', function(req, res){
	var username = req.params.name;
	res.render('user', username);
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

var server;
function startServer() {
	server = http.createServer(app).listen(app.get('port'), function() {
		console.log('Express的执行环境:' + app.get('env') +
			' 服务运行在:http://localhost:'+ app.get('port')+
			'; Ctrl+C结束终端terminate');
	});
}
if(require.main === module){//直接运行；启动应用程序服务器
	startServer();
} else {//作为一个模块通过“需要”输入的应用：导出函数来创建服务器
	module.exports = startServer;
}
