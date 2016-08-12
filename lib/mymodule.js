//创建自己的模块示例
var randomShow = [
	'疯狂动物城',
	'冰雪奇缘',
	'超能陆战队',
];

exports.getMovieName = function() {
	var index = Math.floor(Math.random()*randomShow.length);
	return randomShow[index];
}
