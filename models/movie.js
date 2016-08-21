var mongoose = require('mongoose');
//创建模式
var movieSchema = mongoose.Schema({
	name: String,
	description: String,
	notes: Number,
	workroom: String,
	tags: [String],
	city: String,
	sku: String,
	date: String,
	available: Boolean
});
movieSchema.methods.getNotes = function() {
	return this.notes;
};
//创建模型
var Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
