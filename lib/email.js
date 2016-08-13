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
			var body = '<h1>Meadowlark Travel Site Error</h1>' +
			'message:<br><pre>' + message + '</pre><br>';
			if(exception) body += 'exception:<br><pre>' + exception + '</pre><br>';
			if(filename) body += 'filename:<br><pre>' + filename + '</pre><br>';
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
