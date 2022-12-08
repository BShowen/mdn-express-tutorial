const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");

const mongoose = require("mongoose");

const { body, validationResult } = require("express-validator");

const async = require("async");

const validateBookInstanceForm = [
  body("book", "Book is required").trim().isLength({ min: 1 }),
  body("imprint", "Imprint is required").trim().isLength({ min: 1 }),
  body("status", "Status is required").trim().isLength({ min: 1 }),
  body("due_back", "Date is required")
    .isISO8601()
    .isDate()
    .isAfter(new Date().toString())
    .withMessage("Date must be after today"),
];

// Display list of all BookInstances.
exports.bookInstanceList = (req, res, next) => {
  BookInstance.find({}, "imprint status due_back")
    //"populate the Book reference. Get the title"
    .populate({ path: "book", populate: "title" })
    .exec(function (err, listBookInstances, next) {
      if (err) return next(err);
      res.render("book_instance_list", {
        title: "Book Instance List",
        bookInstanceList: listBookInstances,
      });
    });
};

// Display detail page for a specific BookInstance.
exports.bookInstanceDetail = (req, res) => {
  const bookInstanceID = mongoose.Types.ObjectId(req.params.id);
  BookInstance.findOne({ _id: bookInstanceID })
    .populate({ path: "book", select: "title" })
    .exec((err, result) => {
      if (err) return next(err); //No book instance found.
      return res.render("book_instance_detail", {
        bookInstance: result,
      });
    });
};

// Display BookInstance create form on GET.
exports.bookInstanceCreateGet = (req, res) => {
  Book.find({}).exec((err, list_books) => {
    if (err) return next(err); //No book found
    return res.render("book_instance_form", {
      title: "Create Book Instance",
      book_list: list_books,
    });
  });
};

// Handle BookInstance create on POST.
exports.bookInstanceCreatePost = [
  validateBookInstanceForm,
  (req, res, next) => {
    const errors = validationResult(req);
    const bookInstance = new BookInstance({ ...req.body });

    if (!errors.isEmpty()) {
      // There are errors. Rerender the form with sanitized values
      return Book.find({}).exec((err, list_books) => {
        if (err) return next(err);

        // Set the selected book to the previously selected book
        list_books.some((book) => {
          if (book._id.toString() === bookInstance.book.toString()) {
            book.isSelected = true;
            return true;
          }
        });

        return res.render("book_instance_form", {
          title: "Create Book Instance",
          bookInstance: bookInstance,
          book_list: list_books,
          errors: errors.array(),
        });
      });
    }

    bookInstance.save((err) => {
      if (err) return next(err);
      return res.redirect(bookInstance.url);
    });
  },
];

// Display BookInstance delete form on GET.
exports.bookInstanceDeleteGet = (req, res, next) => {
  const bookInstanceId = mongoose.Types.ObjectId(req.params.id);
  BookInstance.findById(bookInstanceId)
    .populate({ path: "book", select: "title" })
    .exec((err, bookInstance) => {
      if (err) return next(err);
      return res.render("book_instance_detail", {
        bookInstance: bookInstance,
        confirmDelete: true,
      });
    });
};

// Handle BookInstance delete on POST.
exports.bookInstanceDeletePost = (req, res, next) => {
  const bookInstanceId = mongoose.Types.ObjectId(req.params.id);
  return BookInstance.findByIdAndDelete(bookInstanceId).exec((err) => {
    if (err) return next(err);

    return res.redirect("/catalog/bookinstances");
  });
};

// Display BookInstance update form on GET.
exports.bookInstanceUpdateGet = (req, res, next) => {
  const bookInstanceID = mongoose.Types.ObjectId(req.params.id);

  async.parallel(
    {
      bookInstance(callback) {
        // Get the single book instance.
        return BookInstance.findById(bookInstanceID)
          .populate("book")
          .exec(callback);
      },
      list_books(callback) {
        // Get a list of all the books.
        return Book.find({}).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);

      // Set the selected book
      results.list_books.some((book) => {
        if (book._id.toString() === results.bookInstance.book._id.toString()) {
          book.isSelected = true;
          return true;
        }
      });

      // Render bookInstance_form
      return res.render("book_instance_form", {
        title: "Update Book Instance",
        bookInstance: results.bookInstance,
        book_list: results.list_books,
      });
    }
  );
};

// Handle bookInstance update on POST.
exports.bookInstanceUpdatePost = [
  validateBookInstanceForm,
  (req, res, next) => {
    const errors = validationResult(req);
    const bookInstanceID = mongoose.Types.ObjectId(req.params.id);
    const bookInstance = new BookInstance({
      ...req.body,
      _id: bookInstanceID,
    });

    if (!errors.isEmpty()) {
      // There are errors, re-render the form with errors

      return Book.find({}).exec((err, books) => {
        if (err) return next(err); //no books found.

        // Set the selected book
        books.some((book) => {
          if (book._id.toString() === bookInstance.book._id.toString()) {
            book.isSelected = true;
            return true;
          }
        });

        return res.render("book_instance_form", {
          title: "Update Book Instance",
          bookInstance: bookInstance,
          book_list: books,
          errors: errors.array(),
        });
      });
    }

    // No errors, update the bookInstance and redirect to the bookInstance
    BookInstance.findByIdAndUpdate(bookInstanceID, bookInstance).exec((err) => {
      if (err) return next(err); //There was an error in updating.

      return res.redirect(bookInstance.url);
    });
  },
];
