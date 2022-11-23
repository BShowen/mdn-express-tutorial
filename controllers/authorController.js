const Author = require("../models/author");
const Book = require("../models/book");
const mongoose = require("mongoose");

const async = require("async");

// Display list of all Authors.
exports.author_list = (req, res) => {
  Author.find()
    .sort({ family_name: "asc" })
    .exec((err, list_authors) => {
      res.render("author_list", {
        title: "Author List",
        author_list: list_authors,
      });
    });
};

// Display detail page for specific Author.
exports.author_detail = (req, res) => {
  // res.send(`NOT IMPLEMENTED: Author detail: ${req.params.id}`);
  const authorId = mongoose.Types.ObjectId(req.params.id);
  async.parallel(
    {
      author(callback) {
        Author.findOne({ _id: req.params.id }).exec(callback);
      },
      authors_books(callback) {
        Book.find({ author: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      res.render("author_detail", {
        author: results.author,
        authors_books: results.authors_books,
      });
    }
  );
};

// Display Author create form on Get.
exports.author_create_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Author create GET");
};

// Handle Author create on POST.
exports.author_create_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Author create POST");
};

// Display Author delete form on GET.
exports.author_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Author delete GET");
};

// Handle Author delete on POST.
exports.author_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Author delete POST");
};

// Display Author update form on GET.
exports.author_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Author update GET");
};

// Handle Author update on POST.
exports.author_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Author update POST");
};
