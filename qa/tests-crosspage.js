var Browser = require('zombie');
var assert = require('chai').assert;

var browser;

suite('跨页测试', function(){
	setup(function(){
		browser = new Browser();
	});
	test('请求一组引用dreamworks访问页面' +
		'应该填充引用字段', function(done){
		var referrer = 'http://localhost:3000/workroom/dreamworks';
		browser.visit(referrer, function(){
			browser.clickLink('.dreamworks', function(){
				assert(browser.field('referrer').value === referrer);
				done();
			});
		});
	});
	/*test('请求一组引用 oregon coast 访问页面' +
		'填充引用字段', function(done){
		var referrer = 'http://localhost:3000/tours/oregon-coast';
		browser.visit(referrer, function(){
			browser.clickLink('.dreamworks', function(){
				assert(browser.field('referrer').value
					=== referrer);
				done();
			});
		});
	});*/
	test('直接访问“dreamworks”页面应该结果' +
		'一个空引用字段', function(done){
		browser.visit('http://localhost:3000/workroom/dreamworks-rate',
			function(){
				assert(browser.field('referrer').value === '');
				done();
			});
	});
});
