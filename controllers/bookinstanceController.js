const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");

const mongoose = require("mongoose");

const { body, validationResult } = require("express-validator");

// Display list of all BookInstances.
exports.bookinstance_list = (req, res, next) => {
  BookInstance.find({}, "imprint status due_back")
    //"populate the Book reference. Get the title and exclude the -_id field"
    .populate({ path: "book", populate: "title" })
    .exec(function (err, list_bookinstances, next) {
      if (err) return next(err);
      res.render("bookinstance_list", {
        title: "Book Instance List",
        bookinstance_list: list_bookinstances,
      });
    });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = (req, res) => {
  // res.send(`NOT IMPLEMENTED: BookInstance detail: ${req.params.id}`);
  const bookInstanceID = mongoose.Types.ObjectId(req.params.id);
  BookInstance.findOne({ _id: bookInstanceID })
    .populate({ path: "book", select: "title" })
    .exec((err, result) => {
      res.render("bookInstance_detail", {
        bookInstance: result,
      });
    });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = (req, res) => {
  Book.find({}).exec((err, list_books) => {
    res.render("bookInstance_form", {
      title: "Create BookInstance",
      book_list: list_books,
    });
  });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  body("book", "Book is required").trim().isLength({ min: 1 }),
  body("imprint", "Imprint is required").trim().isLength({ min: 1 }),
  body("status", "Status is required").trim().isLength({ min: 1 }),
  body("due_back", "Date is required")
    .isISO8601()
    .isDate()
    .isAfter(new Date().toString())
    .withMessage("Date must be after today"),
  (req, res, next) => {
    const errors = validationResult(req);
    const bookinstance = new BookInstance({ ...req.body });

    if (!errors.isEmpty()) {
      // There are errors. Rerender the form with sanitized values
      Book.find({}).exec((err, list_books) => {
        if (err) return next(err);

        // Set the selected book to the previously selected book
        list_books.forEach((book) => {
          if (book._id.toString() === bookinstance.book.toString()) {
            book.isSelected = true;
          }
        });

        return res.render("bookInstance_form", {
          title: "Create BookInstance",
          bookInstance: req.body,
          book_list: list_books,
          errors: errors.array(),
        });
      });
      return;
    }

    bookinstance.save((err) => {
      if (err) return next(err);
      res.redirect(bookinstance.url);
    });
  },
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = (req, res, next) => {
  const bookInstanceId = mongoose.Types.ObjectId(req.params.id);
  BookInstance.findById(bookInstanceId)
    .populate({ path: "book", select: "title" })
    .exec((err, bookInstance) => {
      if (err) return next(err);
      res.render("bookInstance_detail", {
        bookInstance: bookInstance,
        confirmDelete: true,
      });
    });
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = (req, res, next) => {
  const bookInstanceId = mongoose.Types.ObjectId(req.params.id);
  BookInstance.findByIdAndDelete(bookInstanceId).exec((err) => {
    if (err) return next(err);

    res.redirect("/catalog/bookinstances");
  });
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance update GET");
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance update POST");
};
