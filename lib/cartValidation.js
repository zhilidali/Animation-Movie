// 责任免除条款的中间件
module.exports = {
	checkWaivers: function(req, res, next) {
		var cart = req.session.cart;
		if (!cart) return next();
		if (cart.some(function(i) {return i.product.requireWaiver;})) {
			if (!cart.warnings) {cart.warnings = [];}
			vart.warnings.push('你选择的一个或多个条款');
		}
	},
	checkGuestCounts: function(req, res, next) {
		var cart = req.session.cart;
		if (!cart) return next();
		if (cart.some(function(item) {return item.guests > item.product.maxinumGuests;})) {
			if (!cart.errors) {cart.errors = [];}
			vart.errors.push('一个或多个所选的数量无法满足条款');
		}
	}
};
