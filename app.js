const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express()
app.set("view engine", "ejs") //Tell your app to use ejs as the view engine. Must be under the app declaration

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))

mongoose.connect("mongodb://localhost:27017/todoListDB")
// mongoose.connect("mongodb+srv://theophilusadesola002:Test123@todolistcluster.pgb1wum.mongodb.net/")

const itemsSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	}
})

const userSchema = new mongoose.Schema({
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
		type: String,
		required: true
	},
	userTodo: [itemsSchema]
	// userTodo: [{ type: mongoose.Schema.Types.ObjectId, ref: "itemsSchema" }]
})

const User = mongoose.model("User", userSchema)

const Item = mongoose.model("Item", itemsSchema)
//create new doc

// let defaultItem = {
// 	name: "Default. Delete me after entering your first todo."
// }

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

	User.findById(userId)
		.then((user) => {
			// console.log(user)
			res.render("list", { usersTodos: user.userTodo, listTitle: user.username, userId })
		})
		.catch((err) => {
			console.log(err)
		})
})

//////////////////////////////////////////Post Requests //////////////////////////////////////////////////////

app.post("/signup", (req, res) => {
	const userName = req.body.userName
	const userEmail = req.body.userEmail
	const userPassword = req.body.userPassword

	// console.log(userEmail, userPassword, userName)

	const newUser = new User({
		username: userName,
		useremail: userEmail,
		password: userPassword
	})
	newUser
		.save()
		.then(async (result) => {
			console.log("User saved successfully to the DB!")
			// console.log(result)
			await User.findOne({ useremail: userEmail }).then((user) => {
				// console.log(user._id == "645aa1a9267d7861a27aceb0")
				res.redirect(`/users/${user._id}`)
			})

			// res.redirect(`/users/${userName}`)
		})
		.catch((err) => {
			// console.log(err)
			// res.send(err)
			if (err.code) {
				res.send("Email has already been used")
				// Create an error page that displays the error properly. Create buttons that can link to the signUp page.
			}
		})
})

app.post("/delete", (req, res) => {
	const checkedItemId = req.body.checkbox
	const userId = req.body.userId

	console.log("checkedItemId:" + checkedItemId)
	console.log("userId:" + userId)

	// User.findOneAndUpdate({ _id: userId }, { $pull: { userTodo: { _id: checkedItemId } } }, { new: true })
	// 	.then((result) => {
	// 		// console.log(result)
	// 		res.redirect(`/users/${userId}`)
	// 	})
	// 	.catch((err) => {
	// 		console.log(err)
	// 	})
	// User.findByIdAndUpdate(userId, { $pull: { userTodo: { _id: checkedItemId } } })
	// 	.then((result) => {
	// 		console.log(result)
	// 	})
	// 	.catch((err) => {
	// 		console.log(err)
	// 	})
})

// app.get("/", async (req, res) => {
// 	let foundItems = await Item.find({})
// 	if (foundItems.length === 0) {
// 		Item.insertMany(defaultItems)
// 	} else {
// 		res.render("list", { listTitle: "Today", newListItem: foundItems })
// 	}
// })

// app.get("/lists/:customListName", async (req, res) => {
// 	try {
// 		const customListName = _.capitalize(req.params.customListName)

// 		const foundList = await List.findOne({ name: customListName }).exec()

// 		if (foundList === null) {
// 			//Create a new list here
// 			const list = new List({
// 				name: customListName,
// 				items: defaultItems
// 			})
// 			await list.save()

// 			res.redirect("/lists/" + customListName)
// 		} else {
// 			res.render("list", { listTitle: foundList.name, newListItem: foundList.items })
// 		}
// 	} catch (error) {
// 		console.log(error)
// 	}
// })

// app.post("/", async (req, res) => {
// 	try {
// 		const itemName = req.body.newItem
// 		const listName = req.body.list

// 		const item = new Item({
// 			name: itemName
// 		})

// 		if (listName === "Today") {
// 			await item.save()
// 			res.redirect("/")
// 		} else {
// 			const foundList = await List.findOne({ name: listName })
// 			if (foundList) {
// 				foundList.items.push(item)
// 				await foundList.save()
// 				res.redirect(`/lists/${listName}`)
// 				// console.log("Foundddd and done")
// 			}
// 		}
// 	} catch (error) {
// 		console.log(error)
// 	}
// })

// app.app.post("/delete", async (req, res) => {
// 	const checkedItemId = req.body.checkbox
// 	const listName = req.body.listName

// 	if (listName === "Today") {
// 		await Item.findByIdAndDelete(checkedItemId)
// 		// console.log("Deleted successfully.")
// 		res.redirect("/")
// 	} else {
// 		try {
// 			const updatedResult = await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
// 			console.log(updatedResult)
// 			// console.log("Deleted successfully on newlist")
// 			res.redirect("/lists/" + listName)
// 		} catch (error) {
// 			// console.log(error + "Errrrrr")
// 			res.send(error)
// 		}
// 	}
// })

app.listen("4000", () => {
	console.log("Server started on port 4000")
})
