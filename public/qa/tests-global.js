suite('全局页面测试', function(){
	test('页面有一个有效的标题', function(){
		assert(document.title && document.title.match(/\S/) && document.title.toUpperCase() !== 'TODO');
	});
});

