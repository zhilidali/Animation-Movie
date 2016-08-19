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
	4.

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

+ ## 质量保证

	+ ### 页面测试

	    - 目标：
	        * 访问`http://localhost:3000`加载首页
	        * 访问`http://localhost:3000?test=1`加载包含测试的首页
	    a. 测试模块

	        ```
	            $ npm install --save--dev mocha;
	            $ npm install --save-dev chai;
	            $ cp node_modules/mocha/mocha.js public/vendor
	            $ cp node_modules/mocha/mocha.css public/vendor
	            $ cp node_modules/chai/chai.js public/vendor
	        ```

	    b. 中间件检测查询字符串`test=1`,在路由之前添加

	        ```
	            app.use(function(req, res){
	                res.locals.showTest = app.get('env') !== 'public' && req.query.test === '1';
	            });
	        ```

	    c. 有条件的引入测试,`views/layouts/main.handlebars`

	        <head>部分

	            ```
	            {{!-- 跨页测试 --}}
	                {{#if showTests}}
	                    <link rel="stylesheet" href="/vendor/mocha.css">
	                {{/if}}
	            ```

	        </body>之前

	            ```
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

	        ```
	            suite('全局页面测试', function(){
	                test('页面有一个有效的标题', function(){
	                    assert(document.title && document.title.match(/\S/) && document.title.toUpperCase() !== 'TODO');
	                });
	            });
	        ```

	        访问http://localhost:3000?test=1
	    e.页面测试`public/qa/tests-about.js`;

	        ```
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
			* `$ npm install --save-dev zombie;
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
	+ ### 链接检查[LinkChecker](http://wummel.github.io/linkchecker/)
		* `$ linkchecker http://localhost:3000;`
	+ ### 用Grunt实现自动化
		a. 安装Grunt命令行及Grunt本身
			* `$ install -g grunt-cli;`
			* `$ npm install --save-dev grunt;`
		b. Grunt插件
			* `$ npm install --save-dev grunt-cafe-mocha;`Mocha
			* `$ npm install --save-dev grunt-contrib-jshint;`JSHint
			* `$ npm install --save-dev grunt-exec;`
		c. 目录下创建[Gruntfile.js](Gruntfile.js)

		d. 确保服务器运行，`$ grunt;`
