const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	gender: {
		type: String,
		enum: ["male", "female"]
	},
	address: String,
	phone: Number,
	joinedTime: {
		type: Date,
		default: Date.now
	},
	is_admin:{
      type:Boolean,
	  default:false,
	},
	role: {
		type: String,
		enum: [ "donor", "agent"],
		required: true
	}
});

const User = mongoose.model("users", userSchema);
module.exports = User;