const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express()
app.set("view engine", "ejs") //Tell your app to use ejs as the view engine. Must be under the app declaration

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))

mongoose.connect("mongodb://localhost:27017/todoListDB")

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
	let foundItems = await Item.find({})
	if (foundItems.length === 0) {
		Item.insertMany(defaultItems)
	} else {
		res.render("list", { listTitle: "Today", newListItem: foundItems })
	}
})

const listSchema = {
	name: String,
	items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/lists/:customListName", async (req, res) => {
	const customListName = _.capitalize(req.params.customListName)

	const foundList = await List.findOne({ name: customListName }).exec()

	if (foundList === null) {
		//Create a new list here
		const list = new List({
			name: customListName,
			items: defaultItems
		})
		await list.save()

		res.redirect("/lists/" + customListName)
	} else {
		res.render("list", { listTitle: foundList.name, newListItem: foundList.items })
	}
})

app.post("/", async (req, res) => {
	const itemName = req.body.newItem
	const listName = req.body.list
	const item = new Item({
		name: itemName
	})

	if (listName === "Today") {
		item.save()
		res.redirect("/")
	} else {
		const foundList = await List.findOne({ name: listName })
		if (foundList) {
			foundList.items.push(item)
			foundList.save()
			res.redirect(`/lists/${listName}`)
			// console.log("Foundddd and done")
		}
	}
})

app.post("/delete", async (req, res) => {
	const checkedItemId = req.body.checkbox
	const listName = req.body.listName

	if (listName === "Today") {
		await Item.findByIdAndDelete(checkedItemId)
		res.redirect("/")
	} else {
		try {
			const updatedResult = await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
			console.log(updatedResult)
			res.redirect("/lists/" + listName)
		} catch (error) {
			console.log(error + "Errrrrr")
		}
	}

	//let foundItems = [1, 2, 3, 45, 5] // Prophet Ayo Jeje prophesying to Mike Orokpo

	// if (listName === "Today") {
	// 	if (foundItems.length === 1) {
	// 		console.log("No more items to delete. Reload now")
	// 		res.redirect("/")
	// 	}
	// 	if (foundItems.length !== 0) {
	// 		await Item.findByIdAndDelete(checkedItemId)
	// 		console.log(`Successfully deleted item with ID: ${checkedItemId}`)
	// 		res.redirect("/")
	// 	}
	// 	console.log(foundItems.length)
	// } else {
	// 	List.findByIdAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
	// 	res.redirect(`/lists/${listName}`)
	// 	// List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, (err, foundList) => {
	// 	// 	if (!err) {
	// 	// 		res.redirect("/" + listName)
	// 	// 	}
	// 	// })
	// }
})

app.listen("4000", () => {
	console.log("Server started on port 4000")
})
