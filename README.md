+ ## 运行
	a. 在终端输入'npm install'，安装模依赖;
	b. 执行程序文件index.js，在终端输入`node index`

+ ## Use说明
	1. 开发框架:Express
	2. 视图引擎:Handlebars
	3. 测试:
		*assert函数: Chai断言库
		*页面测试：Mocha
		*跨页测试: Zombies.js
	4. ...

+ ## 目录
	1. package.json 存放项目元数据描述项目和列出依赖项
	2. index.js 主程序文件
	3. views 视图文件夹
		* /layouts 放置布局/母版页的文件夹
		* /partials 局部文件
	4. public 放置静态资源
		* /img
		* /vendor 第三方库
		* /qa 页面测试
	5. lib 保存模块的目录
	6. 跨页测试
	7. Gruntfile.json
	8. models 存放模型
	9. viewModels 视图模型
	10. controllers 控制器

+ ## 质量保证

	+ ### 页面测试

		- 目标：
			* 访问`http://localhost:3000`加载首页
			* 访问`http://localhost:3000?test=1`加载包含测试的首页
		a. 测试模块
			`$ npm install --save--dev mocha;`
			`$ npm install --save-dev chai;`
			`$ cp node_modules/mocha/mocha.js public/vendor`
			`$ cp node_modules/mocha/mocha.css public/vendor`
			`$ cp node_modules/chai/chai.js public/vendor`
		b. 中间件检测查询字符串`test=1`,在路由之前添加

			```javascript
				app.use(function(req, res){
					res.locals.showTest = app.get('env') !== 'public' && req.query.test === '1';
				});
			```

		c. 有条件的引入测试,`views/layouts/main.handlebars`
			* <head>部分

				```javascript
				{{!-- 跨页测试 --}}
					{{#if showTests}}
						<link rel="stylesheet" href="/vendor/mocha.css">
					{{/if}}
				```

			* </body>之前

				```html
					{{#if showTests}}{{!-- 跨页测试 --}}
					<div id="mocha"></div>
					<script src="/vendor/mocha.js"></script>
					<script src="/vendor/chai.js"></script>
					<script>
						mocha.ui('tdd');
						var assert = chai.assert;
					</script>
					<script src="/qa/tests-global.js"></script>
					{{#if pageTestScript}}
						<script src="{{pageTestScript}}"></script>
					{{/if}}
					<script>
						mocha.run();
					</script>
				{{/if}}
				```

		d. 全局测试`public/qa/tasts-global.js`

			```javascript
				suite('全局页面测试', function(){
					test('页面有一个有效的标题', function(){
						assert(document.title && document.title.match(/\S/) && document.title.toUpperCase() !== 'TODO');
					});
				});
			```

			访问http://localhost:3000?test=1
		e.页面测试`public/qa/tests-about.js`;

			```javascript
			suite('全局页面测试', function(){
				test('页面有一个有效的标题', function(){
					assert(document.title && document.title.match(/\S/) && document.title.toUpperCase() !== 'TODO');
				});
			});
			```

	+ ### 跨页测试

		- 目标 测试客户是那个页面进入dreamworks页面的
		a. 创建测试对象，新建两个页面,并设置路由
			* [workroom](views/workroom/workroom.handlebars)
			* [dreamworks](views/workroom/dreamworks.hanlebars)

			```javascript
				//跨页测试
				app.get('/workroom/workroom', function(req, res) {
					res.render('/workroom/workroom');
				});
				app.get('/workroom/dreamworks', function(req, res) {
					res.render('/workroom/dreamworks');
				});
			```
		b. 测试的方法
			* `$ npm install --save-dev zombie;`
			* [qa/tests-crosspage.js](qa/tests-crosspage.js)
		c. 启动服务， `$ mocha -u tdd -R spec qa/tests-crossage.js 2>/dev/null`

	+ ### 逻辑测试
		* 测试[lib](lib/mymodule.js)
		* 创建[qa/test-unit.js](qa/tests-unit.js)
		* `$ mocha -u tdd -R spec qa/test-unit.js`

	+ ### 去毛测试
		* `$ npm install -g jshint;`
		* `$ jshint index.js;`
		* 将jshint集成到编辑器

	+ ### 链接检查
		[LinkChecker](http://wummel.github.io/linkchecker/)
		* `$ linkchecker http://localhost:3000;`

	+ ### Grunt实现自动化

		a. 安装Grunt命令行及Grunt本身
			* `$ install -g grunt-cli;`
			* `$ npm install --save-dev grunt;`
		b. Grunt插件
			* `$ npm install --save-dev grunt-cafe-mocha;`Mocha
			* `$ npm install --save-dev grunt-contrib-jshint;`JSHint
			* `$ npm install --save-dev grunt-exec;`
		c. 目录下创建[Gruntfile.js](Gruntfile.js)

		d. 确保服务器运行，`$ grunt;`

+ ## Handlebars 模板引擎

	+ ### `layout`布局与视图

		* 视图首先被渲染，之后是布局

	+ ### `partial`局部文件

		a. 创建局部文件[partial](views/particals/partical.handlebars)

		b. 主程序文件中添加虚拟数据函数，并添加中间件

			```javascript
				function getFancy (){
					return {
						movieList: [
							{
								name: "爱宠大机密"
								workroom: "娱乐照明"
							},
							{
								name: "疯狂动物成"
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
			```

		c. `home.handlebars`中包含这个局部文件`{{> fancy}}`

	+ ### `section`段落

		视图本身添加到布局的不同部分时
		a. 实例化Handlebars对象时，添加一个叫做section的方法
		b. 创建[jquerytest](views/jquerytest.handlebars)
		c. 布局文件里，放置段落

	+ ### 客户端Handlebars

		显示动态内容
		a. 创建[client-template](views/client-template.handlebars)
		b. 添加针对client-template页面的路由和AJAX调用的路由

+ ## 表单处理

	+ ### 处理AJAX表单

		* POST需要引入中间件解析URL编码体
			* `$ npm install --save body-parser;`
			* 主文件引入`app.use(require('body-parser')());`
		* 创建视图[newsletter](views/newsletter.handlebars),并添加路由

			```javascript
				app.get('/newsletter', function(req, res) {//表单处理
					res.render('newsletter', {csrf: "这里是CSRF令牌"});
				});
				app.post('/process', function(req, res) {//表单处理
					if (req.xhr || req.accepts('json, html')==='json') {
						res.send({success: true});
					} else {
						res.redirect(303, '/thank-you');
					}
				});
			```

	+ ### 文件上传

		* 创建视图[upload-cover](views/upload-cover.handlebars),其中指定`entype="multipart/form-data`来启用文件上传
		* `$ npm install --save formidable;`，引入。并创建路由处理程序

			```javascript
				var formidable = require('formidable');

				app.get('/upload-cover',function(req,res){
					var now = new Date();
					res.render('upload-cover',{
						year: now.getFullYear(),
						month: now.getMonth()
					});
				});
				app.post('./upload-cover/:year/:month', function(req, res){
					var form = new formidable.IncomingForm();
					form.parse(req, function(err, fields, files){
						if(err) return res.redirect(303, '/error');
						console.log(fields)
						console.log(files)
						res.redirect(303, '/thank-you')
					});
				});
			```

	+ ### jQuery文件上传

		* 安装ImageMagick：`$ npm intall --save jquery-file-up;oad-middleware;`
		* 主程序文件添加
			```
				var jqupload = require('jquery-file-upload-middleware');

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
			```
		* 添加文件上传的视图[upload-cover](views/upload-cover.handlebars);

+ ## Cookie与会话

	* 创建`lib/credentials.js`凭证化文件，并添加到git忽略中

		```
			module.exports = {
				cookieSecret: '此处是你的cookie密钥'
			};
		```

	*  安装引入中间件
		`$ npm indatll ---save cookie-parser;`
		`app.use(require('cookie-parser')(credentials.cookieSecret));`
	* 在任何能访问到相应对象的地方 设置cookie或签名cookie
		`res.cookie('monster', 'nom nom');`
		`res.cookie('signed_monster', 'nom nom', {signed: true});`
	* 获取客户端发来的cookie
		`var monster = req.cookie.monster;`
		`var signedmonster = req.signedCookie.signedmonster;`
	* 删除cookie：`ers.clearCookie('monster');`
	* 安装引入session
		`$ npm install --save express-session;`
		`app.use(require('express-session')());`
	* 使用会话：都是在请求对象上操作
		`req.session.userName = 'zhilidali';`设置
		`var colorScheme = req.session.colorSchem || 'dark;`获取
		`delete req.session.colorScheme;`
	* 会话实现flash即显消息
		* 布局中添加

			```html
				{{#if flash}}
					<div class="alert alert-dismissible alert-{{flash.type}}">
						<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
						<strong>{{flash.intro}}</strong> {{{flash.message}}}
					</div>
				{{/if}}
			```

		* 路由之前添加

			```javascripr
				app.use(function(req, res, next){//如果有即显消息，把它传到上下文中，然后清除它
					res.locals.flash = req.session.flash;
					delete req.session.flash;
					next();
				});
			```

+ ## 中间件

	封装在程序中处理HTTP请求的功能(函数)
	* [cartValidation](lib/cartValidation.js)
	* `var cartValidation = require('./lib/cartValidation.js');`
	*
		`app.use(cartValidation.checkWaivers);`
		`app.use(cartValidation.checkGuestCounts);`

+ ## 发送邮件Nodemailer

	* 安装： `$ npm install --save nodemailer;`
	* 引入并创建一个Nodemailer示例，[lib/email.js](lib/email.js)
	* 设置credentials模块

		```javascript
			gmail: {
				user: '你的谷歌账户用户名',
				password: '你的谷歌账户密码'
			},
		```

+ ## 与生产相关的问题

	+ ### 执行环境:
		一种在`production`生产、`development`开发、测试模式中运行应用程序的方法

		* 用环境变量NODE_ENV执行执行环境更好
			`$ export NODE_ENV=production`
			`$ NODE)ENV=prodection node index`

	+ ### 环境配置

		* 开发环境：输入便于查看的彩色文本`$ npm install --save morgan;`
		* 生产环境：日志循环`$ npm install --save express-logger;`

		```javascript
			switch(app.get('env')){
				case 'development':// 紧凑的、彩色的开发日志
					app.use(require('morgan')('dev'));
					break;
				case 'production':// 模块'express-logger' 支持按日志循环
					app.use(require('express-logger')({ path: __dirname + '/log/requests.log'}));
					break;
			}
		```

	+ ### 扩展：

		向上扩展、向外扩展

		- ##### 应用集群扩展

			可为系统上每个CPU内核创建一个独立的服务器
			a. 对主程序作调整

				```javascript
					var server;
					function startServer() {
						server = http.createServer(app).listen(app.get('port'), function() {
							console.log('Express的执行环境:' + app.get('env') +
								' 服务运行在:http://localhost:'+ app.get('port')+
								'; Ctrl+C结束终端terminate');
						});
					}
					if(require.main === module){
						startServer();//直接运行；启动应用程序服务器
					} else {
						module.exports = startServer;//作为一个模块通过“需要”输入的应用：导出函数来创建服务器
					}
				```

			b. 创建[index_cluster.js](index_cluster.js)

		- ##### 处理未捕获异常

		- ##### 多台服务器扩展

	+ ### 网站监控

	+ ### 压力测试

		* `$ npm install --save loadtest;`
		* [tests-stress.js](qa/tests-stress.js)

+ ## 持久化

	+ ### 文件系统持久化

	+ ### 数据库持久化

		* `npm install --save mongoose;`
		* 添加数据凭证[credentials.js](lib/credengtial.js)

			```javascript
				mongo: {
					development: {
						connectionString: "你的开发数据库连接"
					},
					production: {
						connectionString: "你的生产数据库连接"
					}
				}
			```

		* 创建数据库连接 `$ npm install --save mongoose;`

			```javascript
				var mongoose = require('mongoose');
				var opts = {
					server: {
						socketOptions: {keepAlive: 1}
					}
				};
				switch(app.get('env')){
					case 'development':
						mongoose.connect(creadentials.mongo.development.connectionString, opts);
						break;
					case 'production':
						mongoose.connect(creadentials.mongo.prodection.connectionString, opts);
						break;
					default:
						throw new Error('Unknow execution enviroment: ' + app.get('env'));
				}
			```

		* 创建模式和模型
			* 创建电影包数据库[movie.js](models/movies.js)
		* 添加初始数据

			```javascript
				Movie.find(function(err, movies){
					if(movies.length) return;

					new Movie({
						name: '宠物大机密',
						descript: '2016年卖萌动画电影',
						workroom: '娱乐照明',
						notes: 100,
						tags: ['CG', '宠物的秘密生活', '娱乐照明'],
						city: ['美国'],
						sku: '0c39',
						date: '2016-08-03'
					}).save();

					new Movie({
						name: '疯狂动物城',
						descript: '迪士尼继超能陆战队又一最新力作',
						notes: 99,
						tags: ['动物乌托邦', 'CG', '迪士尼'],
						city: ['美国'],
						sku: 'HR1999',
						date: '2016-03'
					}).save();
				});
			```

		* 获取数据[movies.handlebars](views/movies.handlebars)
		* 添加路由

			```javascript
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
			```

+ ## 路由

	+ ### `IA`信息架构

		* 不暴露细节
		* 避免无意义信息
		* 避免无谓的URL
		* 单词分隔符一致
		* 勿用空格或不可录入的字符
		* 用小写字母

	+ ### 子域名

		* `$ npm install ---save vhost;`

		```javascript
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
		```

	+ ### 路由参数

		```
			app.get('/user/:name', function(req, res){
				var username = req.params.name;
				res.render('user', username);
			});
		```

	+ ### 组织路由

		* 模块中声明路由
			创建`routes.js`

			```javascript
				module.export = function(app) {
					app.get('/', function(req, res){
						app.render(home);
					});
				};
				//...
			```

			主程序中`require('./routes.js')(app);`
		* 按逻辑对路由分组

			具体看routes.js和handlers目录

		* 自动化渲染视图

			```javascript
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
			```
