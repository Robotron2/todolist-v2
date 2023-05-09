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
		required: true
	},
	password: {
		type: String,
		required: true
	},
	itemsList: [itemsSchema]
})

const User = mongoose.model("User", userSchema)

const Item = mongoose.model("Item", itemsSchema)
//create new doc

const item1 = new Item({
	name: "Welcome to your todo list app"
})
const item2 = new Item({
	name: "Hit the + to add a new item"
})
const item3 = new Item({
	name: "<-- Hit this to delete an item."
})

let defaultItem = {
	name: "Default. Delete me after entering your first todo."
}

app.get("/", async (req, res) => {
	res.render("home")
})

app.get("/login", (req, res) => {
	res.render("login")
})
app.get("/signup", (req, res) => {
	res.render("signup")
})

app.get("/users/:usersname", (req, res) => {
	const userName = req.params.usersname
	res.render("list", { usersTodos: [defaultItem], listTitle: userName })
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
		password: userPassword,
		itemsList: defaultItem
	})
	newUser
		.save()
		.then((result) => {
			console.log("User saved successfully to the DB!")
			// console.log(result)
			res.redirect(`/users/${userName}`)
		})
		.catch((err) => {
			// console.log(err)
			res.send(err)
		})
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

// <% newListItem.forEach(item=> {%>
//     <a class="dropdown-item" href="/">
//         <%= listTitle %>
//     </a>
//     <%}); %>
