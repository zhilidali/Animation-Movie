var fs = require('fs');
var formidable = require('formidable');

exports.newsletter = function(req, res) {//表单处理
	res.render('newsletter', {csrf: "这里是CSRF令牌"});
};
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
exports.process = function(req, res) {//表单处理
	if (req.xhr || req.accepts('json, html')==='json') {
		res.send({success: true});
	} else {
		res.redirect(303, '/thank-you');
	}
};
exports.uploadCover = function(req,res){//文件上传示例
	var now = new Date();
	res.render('upload-cover',{
		year: now.getFullYear(),
		month: now.getMonth()
	});
};

//文件系统化
var dataDir = __dirname + '/data';// 确保存在目录data
var vacationPhotoDir = dataDir + '/vacation-photo';
if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if(!fs.existsSync(vacationPhotoDir)) fs.mkdirSync(vacationPhotoDir);
function saveContestEntry(contestName, email, year, month, photoPath){
	// TODO...这个稍后再做
}
exports.uploadCoverPost = function(req, res){//文件上传示例
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
};
