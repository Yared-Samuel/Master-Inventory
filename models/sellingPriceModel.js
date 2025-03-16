import mongoose from "mongoose";


const SpriceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Price name is required!"],
    unique: [true, "Price name must be unique!"],
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Product is required"],
        ref: "Product", // Reference to the Product model by name
      },
      sellingPrice: {
        type: Number,
        required: [true, "Price is required!"],
      },
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Reference to the User model by name
  },
});

const Sprice = mongoose.models.Sprice || mongoose.model("Sprice", SpriceSchema);
export default Sprice;
