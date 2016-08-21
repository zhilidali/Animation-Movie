exports.fail = function(req, res) {
	throw new Error('Node!');//未捕获异常
};
exports.jquerytest = function(req, res) {//测试段落section
	res.render('jquerytest');
};
exports.clientTemplate = function(req, res) {//客户端模板
	res.render('client-template');
};
exports.clientTemplateData = function(req, res) {//客户端模板
	res.json({
		animal: 'squirrel',
		bodyPart: 'tail',
		adjective: 'bushy',
		noun: 'heck',
	});
};
exports.headers = function(req, res) {//示例：查看浏览器发送信息
	res.set('Content-Type', 'text/plain');
	var s = '';
	for (var name in req.headers) s += name+":"+req.headers[name]+'\n';
	res.send(s);
};
exports.username = function(req, res){//路由参数
	var username = req.params.name;
	res.render('user', username);
};

