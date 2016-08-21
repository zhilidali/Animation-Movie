var mymodule = require('../lib/mymodule.js');
var Movie = require('../models/movie.js');

exports.home = function(req, res) {
	res.render('home');
};

exports.about = function(req, res) {
	res.render('about', {
		MovieName: mymodule.getMovieName(),
		pageTestScript: '/qa/tests-about.js'
	});
};
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
exports.movies = function(req, res) {
	Movie.find({ available: true }, function(err, movies){
		var context = {
			movies: movies.map(function(movie){
				movie.notes = movie.getNotes();
				return movie;
			})
		};
		res.render('movies', context);
	});
};
