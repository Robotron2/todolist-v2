import mongoose from "mongoose"

const connectDB = async () => {
	try {
		const connect = await mongoose.connect(process.env.MONGO_URL)
		console.log(`Connected to Atlas`)

		// const connect = await mongoose.connect("mongodb://localhost:27017/ecommerce")
		// console.log(`Connected to MongoLocal`)
	} catch (error) {
		console.log(error)
	}
}

export default connectDB
