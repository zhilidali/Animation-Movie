var nodemailer = require('nodemailer');

module.exports = function(credentials){
	var mailTransport = nodemailer.createTransport('SMTP',{
		service: 'Gmail',
		auth: {
			user: credentials.gmail.user,
			pass: credentials.gmail.password,
		}
	});
	var from = '"CG动画电影交流社区" <info@CGworks.com>';
	var errorRecipient = 'zhilidali@gmail.com';
	return {
		send: function(to, subj, body){
			mailTransport.sendMail({
				from: from,
				to: to,
				subject: subj,
				html: body,
				generateTextFromHtml: true
			}, function(err){
				if(err) console.error('无法发送电子邮件: ' + err);
			});
		},

		emailError: function(message, filename, exception){
			var body = '<h1>CG动画电影交流社区网站的错误</h1>' +
			'信息:<br><pre>' + message + '</pre><br>';
			if(exception) body += '例外:<br><pre>' + exception + '</pre><br>';
			if(filename) body += '文件名:<br><pre>' + filename + '</pre><br>';
			mailTransport.sendMail({
				from: from,
				to: errorRecipient,
				subject: 'CG动画电影交流社区网站的错误',
				html: body,
				generateTextFromHtml: true
			}, function(err){
				if(err) console.error('无法发送电子邮件: ' + err);
			});
		},
	};
};
