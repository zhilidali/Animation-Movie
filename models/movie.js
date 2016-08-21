var mongoose = require('mongoose');

var movieSchema = mongoose.Schema({
	name: String,
	descript: String,
	notes: Number,
	workroom: String,
	tags: [String],
	city: String,
	sku: String,
	date: String
});
movieSchema.methods.getNotes = function() {
	return this.notes;
};
//创建模型
var Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
