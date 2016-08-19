//逻辑测试
var mymodule = require('../lib/mymodule.js');
var expect = require('chai').expect;

suite("测试mymodule", function () {
	test("getMovieName()应该返回一个电影名字", function() {
		expect(typeof mymodule.getFortune() === 'string');
	});
});
