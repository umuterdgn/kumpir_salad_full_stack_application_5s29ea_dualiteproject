import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // BURASI DEĞİŞTİ: Yeni roller eklendi
    role: {
      type: String,
      enum: ["admin", "kasa", "garson", "user"],
      default: "user",
    },
  },
  { timestamps: true },
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, ref: "Category", required: true }, // ObjectId yerine String yapıldı
    allergens: [{ type: String }],
    ingredients: [{ type: String }],
    extras: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        product: { type: String, ref: "Product" }, // ObjectId yerine String yapıldı
        quantity: { type: Number, required: true },
        note: { type: String, default: "" },
        price: { type: Number, required: true },
        selectedExtras: [
          {
            name: { type: String },
            price: { type: Number },
          },
        ],
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Beklemede", "Hazırlanıyor", "Tamamlandı", "İptal"],
      default: "Beklemede",
    },
    tableNumber: { type: String, required: true },
    phone: String,
    customerName: { type: String },
  },
  { timestamps: true },
);

const eventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ["view", "click", "cart_add"],
      required: true,
    },
    productId: { type: String, ref: "Product" }, // ObjectId yerine String yapıldı
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
export const Category = mongoose.model("Category", categorySchema);
export const Product = mongoose.model("Product", productSchema);
export const Order = mongoose.model("Order", orderSchema);
export const Event = mongoose.model("Event", eventSchema);
