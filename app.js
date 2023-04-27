const express = require("express")
const bodyParser = require("body-parser")

const app = express()
app.set("view engine", "ejs") //Tell your app to use ejs as the view engine. Must be under the app declaration

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))

let items = []

app.get("/", (req, res) => {
	// res.send("Welcome to my page");
	let today = new Date()
	let options = {
		weekday: "long",
		// year: "numeric",
		month: "long",
		day: "numeric"
	}
	let day = today.toLocaleDateString("en-US", options)

	res.render("list", { kindOfDay: day, newListItem: items })
})

app.post("/", (req, res) => {
	// console.log(item);
	items.push(req.body.newItem)
	res.redirect("/")
})

app.listen("4000", () => {
	console.log("Server started on port 4000")
})
