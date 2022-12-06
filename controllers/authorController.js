const Author = require("../models/author");
const Book = require("../models/book");
const mongoose = require("mongoose");

const async = require("async");

const { body, validationResult } = require("express-validator");

const validateAuthor = [
  // Validate the first name
  body("first_name", "First name is required")
    .trim()
    .isLength({ min: 1, max: 100 })
    .bail()
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  // Validate the family name
  body("family_name", "Family name is required")
    .trim()
    .isLength({ min: 1, max: 100 })
    .bail()
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  // Validate the date of birth, if provided
  body("date_of_birth", "Invalid birth date")
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .isDate(),
  body("date_of_birth", "Birth date must be before today")
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .isBefore(new Date().toString()),
  // Validate the date of death, if provided
  body("date_of_death", "Invalid death date")
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .isDate(),
];

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
  res.render("author_form", {
    title: "Create Author",
  });
};

// Handle Author create on POST.
exports.author_create_post = [
  validateAuthor,
  (req, res, next) => {
    // Create an Author object with escaped and trimmed data.
    const author = new Author({ ...req.body });

    // If author is invalid then re-render form with errors
    // Otherwise save and redirect to author details page
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      console.log(req.body);
      return res.render("author_form", {
        title: "Create Author",
        author: author,
        errors: errors.array(),
      });
    }

    // Data from form is valid.
    author.save((err) => {
      if (err) return next(err);
      res.redirect(author.url);
    });
  },
];

// Display Author delete form on GET.
exports.author_delete_get = (req, res) => {
  const authorId = mongoose.Types.ObjectId(req.params.id);

  async.parallel(
    {
      list_books(callback) {
        return Book.find({ author: authorId }).exec(callback);
      },
      author(callback) {
        return Author.findById(authorId).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      res.render("author_delete", {
        author: results.author,
        book_list: results.list_books,
      });
      return;
    }
  );
};

// Handle Author delete on POST.
exports.author_delete_post = (req, res) => {
  const authorId = mongoose.Types.ObjectId(req.params.id);

  async.parallel(
    {
      list_books(callback) {
        return Book.find({ author: authorId }).exec(callback);
      },
      author(callback) {
        return Author.findById(authorId).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);

      if (results.list_books.length) {
        // This author has books. Render the author_delete page.
        return res.render("author_delete", {
          author: results.author,
          book_list: results.list_books,
        });
      }

      Author.deleteOne({ _id: authorId }).exec((err, result) => {
        return res.redirect("/catalog/authors");
      });
    }
  );
};

// Display Author update form on GET.
exports.author_update_get = (req, res, next) => {
  const authorId = mongoose.Types.ObjectId(req.params.id);

  // Get author from DB
  Author.findById(authorId).exec((err, author) => {
    // Author not found in DB.
    if (err) return next(err);

    // Render author form with author object
    return res.render("author_form", {
      title: "Update Author",
      author: author,
    });
  });
};

// Handle Author update on POST.
exports.author_update_post = [
  // validate form params.
  validateAuthor,
  (req, res, next) => {
    console.log(req.body);
    // Create a new author instance.
    const authorId = mongoose.Types.ObjectId(req.params.id);
    const author = new Author({ ...req.body, _id: authorId });

    // Re render form if there are errors.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Render for with author object and error object.
      return res.render("author_form", {
        title: "Update Author",
        author: author,
        errors: errors.array(),
      });
    }

    // Find author in the DB and update with new instance.
    Author.findByIdAndUpdate(authorId, author).exec((err, author) => {
      // Error updating the author.
      if (err) return next(err);

      return res.redirect(author.url);
    });
  },
];
