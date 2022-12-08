const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const { DateTime } = require("luxon");

const BookInstanceSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true }, // reference to the associated book
  imprint: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Available", "Maintenance", "Loaned", "Reserved"],
    default: "Maintenance",
  },
  due_back: { type: String, default: DateTime.now().toISODate() },
});

// Virtual for bookinstance's URL
BookInstanceSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/bookinstance/${this._id}`;
});

// Virtual for bookinstance's date
BookInstanceSchema.virtual("due_back_formatted").get(function () {
  return DateTime.fromISO(this.due_back).toLocaleString(DateTime.DATE_FULL);
});

// Export model
module.exports = mongoose.model("BookInstance", BookInstanceSchema);
