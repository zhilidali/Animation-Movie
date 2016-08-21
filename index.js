//主程序入口文件
var http = require('http');
var express = require('express');
var credentials = require('./lib/credentials.js');
var cartValidation = require('./lib/cartValidation.js');
var emailService = require('./lib/email.js')(credentials);
var jqupload = require('jquery-file-upload-middleware');
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
require('./routes.js')(app);

//自动化渲染视图
var autoViews = {};
app.use(function(req,res,next){
	var path = req.path.toLowerCase();
	//检查缓存，存在，则渲染这个视图
	if(autoViews[path]) return res.render(autoViews[path]);
	// 如果他不在缓存里，那就看看有没有.handlebars文件能匹配
	if(fs.existsSync(__dirname + '/views' + path + '.handlebars')){
		autoViews[path] = path.replace(/^\//, '');
		return res.render(autoViews[path]);
	}
	//没有发现视图，转到404
	next();
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
