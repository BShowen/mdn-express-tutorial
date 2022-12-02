const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");

const async = require("async");

const mongoose = require("mongoose");

const { body, validationResult } = require("express-validator");

exports.index = (req, res) => {
  async.parallel(
    {
      book_count(callback) {
        Book.countDocuments({}, function (err, results) {
          if (err) return "THERE WAS AN ERROR";
          return callback(null, results);
        }); // Pass an empty object as match condition to find all documents of this collection
      },
      book_instance_count(callback) {
        BookInstance.countDocuments({}, callback);
      },
      book_instance_available_count(callback) {
        BookInstance.countDocuments({ status: "Available" }, callback);
      },
      author_count(callback) {
        Author.countDocuments({}, callback);
      },
      genre_count(callback) {
        Genre.countDocuments({}, callback);
      },
    },
    (err, results) => {
      res.render("index", {
        title: "Local Library Home",
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all books.
exports.book_list = (req, res, next) => {
  Book.find({}, "title author")
    .sort({ title: 1 })
    .populate("author")
    .exec(function (err, list_books) {
      if (err) return next(err);
      res.render("book_list", {
        title: "Book list",
        book_list: list_books,
      });
    });
};

// Display detail page for a specific book.
exports.book_detail = (req, res, next) => {
  // res.send(`NOT IMPLEMENTED: Book detail: ${req.params.id}`);
  const bookId = mongoose.Types.ObjectId(req.params.id);
  async.parallel(
    {
      book(callback) {
        Book.findOne({ _id: bookId })
          .populate({ path: "author" })
          .populate({ path: "genre" })
          .exec(callback);
      },
      book_instances(callback) {
        BookInstance.find({ book: bookId }).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      return res.render("book_detail", {
        book: results.book,
        author: results.book.author,
        book_instance_list: results.book_instances,
      });
    }
  );
};

// Display book create form on GET.
exports.book_create_get = (req, res, next) => {
  async.parallel(
    {
      list_authors(callback) {
        Author.find({}, "first_name family_name").exec(callback);
      },
      list_genres(callback) {
        Genre.find({}, "name").exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      return res.render("book_form", {
        title: "Create Book",
        author_list: results.list_authors,
        genre_list: results.list_genres,
      });
    }
  );
};

// Handle book create on POST.
exports.book_create_post = [
  body("title", "Title is required").trim().isLength({ min: 1 }),
  body("summary", "Summary is required").trim().isLength({ min: 1 }),
  body("author", "Author is required").trim().isLength({ min: 1 }),
  body("isbn", "ISBN is required").trim().isLength({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);
    const book = new Book({ ...req.body });

    if (!errors.isEmpty()) {
      (req, res, next) => {
        if (Array.isArray(req.body.genre)) {
          next();
        } else {
          req.body.genre = [req.body.genre || []];
        }
      };
      async.parallel(
        {
          list_authors(callback) {
            Author.find({}, "first_name family_name").exec(callback);
          },
          list_genres(callback) {
            Genre.find({}, "name").exec(callback);
          },
        },
        (err, results) => {
          if (err) return next(err);

          for (const genre of results.list_genres) {
            if (book.genre.includes(genre._id)) {
              genre.checked = true;
            }
          }

          return res.render("book_form", {
            title: "Create Book",
            author_list: results.list_authors,
            genre_list: results.list_genres,
            errors: errors.array(),
            book: book,
          });
        }
      );
      return;
    }

    // const book = new Book({ ...req.body });
    book.save((err) => {
      if (err) return next(err);
      res.redirect(book.url);
    });
  },
];

// Display book delete form on GET.
exports.book_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Book delete GET");
};

// Handle book delete on POST.
exports.book_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Book delete POST");
};

// Display book update form on GET.
exports.book_update_get = (req, res) => {
  const bookId = mongoose.Types.ObjectId(req.params.id);
  // Get the book data from the DB
  async.parallel(
    {
      list_authors(callback) {
        return Author.find({}).exec(callback);
      },
      list_genres(callback) {
        return Genre.find({}).exec(callback);
      },
      book(callback) {
        return Book.findById(bookId).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);

      for (const genre of results.list_genres) {
        if (results.book.genre.includes(genre._id)) {
          genre.checked = true;
        }
      }

      return res.render("book_form", {
        title: "Update Book",
        author_list: results.list_authors,
        genre_list: results.list_genres,
        book: results.book,
      });
    }
  );
};

// Handle book update on POST.
exports.book_update_post = [
  body("title", "Title is required").trim().isLength({ min: 1 }),
  body("summary", "Summary is required").trim().isLength({ min: 1 }),
  body("author", "Author is required").trim().isLength({ min: 1 }),
  body("isbn", "ISBN is required").trim().isLength({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);
    const bookId = mongoose.Types.ObjectId(req.params.id);
    const book = new Book({ ...req.body, _id: bookId });

    if (!errors.isEmpty()) {
      (req, res, next) => {
        if (Array.isArray(req.body.genre)) {
          next();
        } else {
          req.body.genre = [req.body.genre || []];
        }
      };
      async.parallel(
        {
          list_authors(callback) {
            return Author.find({}).exec(callback);
          },
          list_genres(callback) {
            return Genre.find({}).exec(callback);
          },
        },
        (err, results) => {
          if (err) return next(err);

          for (const genre of results.list_genres) {
            if (book.genre.includes(genre._id)) {
              genre.checked = true;
            }
          }

          return res.render("book_form", {
            title: "Update Book",
            author_list: results.list_authors,
            genre_list: results.list_genres,
            errors: errors.array(),
            book: book,
          });
        }
      );
      return;
    }
    // No errors, so update the book.

    Book.findOneAndUpdate({ _id: bookId }, book).exec((err, book) => {
      if (err) return next(err); //Book not found in DB

      // Update book
      return res.redirect(book.url);
    });
  },
];
