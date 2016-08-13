//主程序入口文件
var express = require('express');
var mymodule = require('./lib/mymodule');
var app = express();


var handlebars = require('express3-handlebars')
					.create({
						defaultLayout: 'main'
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

//404页面
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(404);
	res.render('404');
});

//500页面
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function() {
	console.log('Start on http://localhost:'+app.get('port')+'; 摁Ctrl+C结束终端terminate')
})
