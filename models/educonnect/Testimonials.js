import mongoose from "mongoose";

const TestimomialsSchema = new mongoose.Schema({

},
{ timestamps: true }
)

const TestimomialsModel = mongoose.model('educonnecttestimonials', TestimomialsSchema)
export default TestimomialsModel