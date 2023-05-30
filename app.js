import dotenv from "dotenv"
import express from "express"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import _ from "lodash"
import bcrypt from "bcrypt"
import JWT from "jsonwebtoken"
import connectDB from "./config.js"

dotenv.config()
const app = express()
app.set("view engine", "ejs") //Tell your app to use ejs as the view engine. Must be under the app declaration

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))

// mongoose.connect("mongodb://localhost:27017/todoListDB")

connectDB()

const itemsSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true
		},
		_id: Number
	},
	{ timestamps: true }
)

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true
		},
		useremail: {
			type: String,
			unique: true,
			required: true
		},
		password: {
			type: String
		},
		answer: {
			type: String,
			required: true
		},
		userTodo: [itemsSchema]
	},
	{ timestamps: true }
)

const User = mongoose.model("User", userSchema)

const Item = mongoose.model("Item", itemsSchema)

app.get("/", async (req, res) => {
	res.render("home")
})

app.get("/login", (req, res) => {
	res.render("login")
})
app.get("/signup", (req, res) => {
	res.render("signup")
})

app.get("/users/:userId", async (req, res) => {
	const userId = req.params.userId
	await User.findById(userId).then((user) => {
		if (user) {
			res.render("list", { usersTodos: user.userTodo, listTitle: user.username, userId })
		} else {
			res.redirect("/login")
		}
	})
})

//////////////////////////////////////////Post Requests //////////////////////////////////////////////////////

app.post("/signup", async (req, res) => {
	let username = _.upperFirst(req.body.username)
	let useremail = _.toLower(req.body.email)
	let password = req.body.password
	let answer = req.body.answer
	const saltRound = Number(process.env.SALT_ROUNDS)

	await User.findOne({ useremail }).then((user) => {
		if (user) {
			res.redirect("/login")
		} else {
			bcrypt.hash(password, saltRound, async (err, hashedPassword) => {
				try {
					const newUser = await new User({
						username,
						useremail,
						password: hashedPassword,
						answer
					})
						.save()
						.then(async () => {
							User.findOne({ useremail }).then((user) => {
								if (user) {
									res.redirect(`/users/${user._id}`)
								}
							})
						})
				} catch (error) {
					console.log(error)
				}
			})
		}
	})

	// console.log(userEmail, userPassword, userName)
})

app.post("/login", (req, res) => {
	try {
		const { useremail, password } = req.body
		// console.log(req.body)
		User.findOne({ useremail })
			.then(async (user) => {
				console.log(password, user.password)
				if (user) {
					bcrypt.compare(password, user.password, async (err, result) => {
						if (result) {
							res.redirect(`/users/${user._id}`)
						} else {
							res.redirect("/login")
						}
					})
				}
			})
			.catch((err) => {
				console.log(err)
			})
	} catch (error) {
		console.log(error)
		res.status(500).send({
			success: false,
			message: "Error in login",
			error
		})
	}
})

app.post("/users/:userId", async (req, res) => {
	// const todo = req.body.newItem
	const userId = req.params.userId

	const todo = new Item({
		name: req.body.newItem,
		_id: Math.floor(Math.random() * 84600)
	})

	await User.findById(userId)
		.then(async (user) => {
			user.userTodo.push(todo)
			await user.save().then(() => {
				console.log("Updated successfully.")
				res.redirect(`/users/${user._id}`)
			})
		})
		.catch((err) => {
			console.log(err)
		})
})

app.post("/delete", (req, res) => {
	const checkedItemId = parseInt(req.body.checkbox)
	const userId = req.body.userId

	User.findById(userId).then((user) => {
		let filteredTodo = user.userTodo.filter((todo) => todo._id !== checkedItemId)
		// console.log(filteredTodo)
		User.findByIdAndUpdate(userId, { userTodo: filteredTodo }, { new: true })
			.then(() => {
				res.redirect(`/users/${user._id}`)
			})
			.catch((err) => {
				res.send(err)
			})
	})
})

app.listen("4000", () => {
	console.log("Server started on port 4000")
})
