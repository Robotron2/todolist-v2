const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express()
app.set("view engine", "ejs") //Tell your app to use ejs as the view engine. Must be under the app declaration

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))

mongoose.connect("mongodb://localhost:27017/todoListDB", { useNewUrlParser: true })

const itemsSchema = {
	name: {
		type: String,
		required: true
	}
}

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

let defaultItems = [item1, item2, item3]

app.get("/", async (req, res) => {
	// res.send("Welcome to my page");
	let foundItems = await Item.find({})
	// console.log(foundItems)
	if (foundItems.length === 0) {
		Item.insertMany(defaultItems, function (err) {
			if (!err) {
				console.log("Successfully saved the item to the DB")
			} else {
				console.log(err)
			}
		})
	} else {
		res.render("list", { listTitle: "Today", newListItem: foundItems })
	}

	// Item.find({}).then(function (err, foundItems) {
	// 	console.log(foundItems)
	// })
	// Item.find({}, (err, foundItems) => {
	// 	if (err) {
	// 		console.log(err)
	// 	} else {
	// 		if (foundItems.length === 0) {
	// 			Item.insertMany(defaultItems, (err) => {
	// 				if (err) {
	// 					console.log(err)
	// 				} else {
	// 					console.log("Successfully saved the item to the DB")
	// 				}
	// 			})
	// 			res.redirect("/")
	// 		} else {
	// 			res.render("list", { listTitle: "Today", newListItem: foundItems })
	// 		}
	// 	}
	// })
})

const listSchema = {
	name: String,
	items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/:customListName", async (req, res) => {
	const customListName = _.capitalize(req.params.customListName)

	const foundList = await List.findOne({ name: customListName }).exec()

	if (foundList !== null) {
		res.render("list", { listTitle: foundList.name, newListItem: foundList.items })
	} else {
		//Create a new list here
		const list = new List({
			name: customListName,
			items: defaultItems
		})
		list.save()
		res.redirect("/" + customListName)
	}

	// List.findOne({ name: customListName }, (err, foundList) => {
	// 	if (!err) {
	// 		if (!foundList) {
	// //Create a new list here
	// const list = new List({
	// 	name: customListName,
	// 	items: defaultItems
	// })
	// list.save()
	// res.redirect("/" + customListName)
	// 		} else {
	// 			// Show an existing list
	// res.render("list", { listTitle: foundList.name, newListItem: foundList.items })
	// 		}
	// 	}
	// })
})

app.post("/", (req, res) => {
	const itemName = req.body.newItem
	const listName = req.body.list
	const item = new Item({
		name: itemName
	})

	if (listName === "Today") {
		item.save()
		res.redirect("/")
	} else {
		List.findOne({ name: listName }, (err, foundList) => {
			if (err) {
				console.log(err)
			} else {
				foundList.items.push(item)
				foundList.save()
				res.redirect("/" + listName)
			}
		})
	}
})

app.post("/delete", (req, res) => {
	const checkedItemId = req.body.checkbox
	const listName = req.body.listName

	if (listName === "Today") {
		Item.findByIdAndDelete(checkedItemId, (err) => {
			if (err) {
				console.log(err)
			} else {
				console.log(`Successfully deleted item with id ${checkedItemId}`)
				res.redirect("/")
			}
		})
	} else {
		List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, (err, foundList) => {
			if (!err) {
				res.redirect("/" + listName)
			}
		})
	}
})

app.listen("4000", () => {
	console.log("Server started on port 4000")
})
