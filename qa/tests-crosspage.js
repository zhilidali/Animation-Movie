var Browser = require('zombie'),
assert = require('chai').assert;
var browser;
suite('跨页测试', function(){
	setup(function(){
		browser = new Browser();
	});
	test('requesting a group rate quote from the hood dreamworks page' +
		'should populate the referrer field', function(done){
			var referrer = 'http://localhost:3000/workroom/dreamworks';
			browser.visit(referrer, function(){
				browser.clickLink('.dreamworksRate', function(){
					assert(browser.field('referrer').value === referrer);
					done();
				});
			});
		});
	/*test('requesting a group rate from the oregon coast tour page should ' +
		'populate the referrer field', function(done){
			var referrer = 'http://localhost:3000/tours/oregon-coast';
			browser.visit(referrer, function(){
				browser.clickLink('.dreamworksRate', function(){
					assert(browser.field('referrer').value
						=== referrer);
					done();
				});
			});
		});*/
	test('visiting the "dreamworks-rate" page dirctly should result ' +
		'in an empty referrer field', function(done){
			browser.visit('http://localhost:3000/workroom/dreamworks-rate',
				function(){
					assert(browser.field('referrer').value === '');
					done();
				});
		});
});
