suite('"关于"页面测试', function(){
	test('页应该包含链接到联系人contact页', function(){
		assert($('a[href="/contact"]').length);
	});
});
