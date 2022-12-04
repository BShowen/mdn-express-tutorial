const Genre = require("../models/genre");

const Book = require("../models/book");
const async = require("async");
const mongoose = require("mongoose");

const { body, validationResult } = require("express-validator");

// Display list of all Genre.
exports.genre_list = (req, res) => {
  Genre.find()
    .sort({ name: "asc" })
    .exec(function (err, list_genres) {
      res.render("genre_list", {
        title: "Genre List",
        genre_list: list_genres,
      });
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = (req, res, next) => {
  // res.send(`NOT IMPLEMENTED: Genre detail: ${req.params.id}`);
  const id = mongoose.Types.ObjectId(req.params.id);
  async.parallel(
    {
      genre(callback) {
        Genre.findById(id).exec(callback);
      },
      genre_books(callback) {
        Book.find({ genre: id }, "title summary").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.genre === null) {
        // No results for this genre.
        const err = new Error("Genre not found");
        err.status = 400;
        return next(err);
      }

      // Successful.
      res.render("genre_detail", {
        genre: results.genre,
        genre_books: results.genre_books,
      });
    }
  );
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res) => {
  res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize the name field.
  body("name", "Genre name required").trim().isLength({ min: 3 }).escape(),
  body("name", "Genre name must be at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    // Create a genre object with escaped and trimmed data.
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Create Genre",
        genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Form data is valid.
      // Check is Genre with same name already exists.
      Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
        if (err) {
          return next(err);
        }

        if (found_genre) {
          // Genre already exists, redirect to its detail page.
          res.redirect(found_genre.url);
        } else {
          genre.save((err) => {
            if (err) {
              return next(err);
            }
            // Genre saved. Redirect to its detail page.
            res.redirect(genre.url);
          });
        }
      });
    }
  },
];

// Display Genre delete form on GET.
exports.genre_delete_get = (req, res, next) => {
  const genreId = mongoose.Types.ObjectId(req.params.id);
  async.parallel(
    {
      genre(callback) {
        Genre.findById(genreId).exec(callback);
      },
      genre_books(callback) {
        Book.find({ genre: genreId }, "title summary").exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);

      if (results.genre === null) {
        // No results for this genre.
        const err = new Error("Genre not found");
        err.status = 400;
        return next(err);
      }

      // Successful.
      res.render("genre_detail", {
        genre: results.genre,
        genre_books: results.genre_books,
        confirmDelete: true,
      });
    }
  );
};

// Handle Genre delete on POST.
exports.genre_delete_post = (req, res, next) => {
  const genreId = mongoose.Types.ObjectId(req.params.id);
  async.parallel(
    {
      genre(callback) {
        return Genre.findById(genreId).exec(callback);
      },
      genre_books(callback) {
        return Book.find({ genre: genreId }).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);

      if (results.genre_books.length > 0) {
        return render("genre_detail", {
          genre: results.genre,
          genre_books: results.genre_books,
          confirmDelete: true,
        });
      }

      results.genre.remove((err) => {
        if (err) return next(err);
        return res.redirect("/catalog/genres");
      });
    }
  );
};

// Display Genre update form on GET.
exports.genre_update_get = (req, res, next) => {
  // Get the genre from the DB
  const genreId = mongoose.Types.ObjectId(req.params.id);
  Genre.findById(genreId).exec((err, genre) => {
    if (err) return next(err);

    return res.render("genre_form", {
      genre: genre,
    });
  });
  // Render the form with the genre object.
};

// Handle Genre update on POST.
exports.genre_update_post = [
  // Validate genre form data
  body("name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Genre name is required")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Genre name must be at least 3 characters")
    .isLength({ max: 100 })
    .withMessage("Genre name must be less than 100 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    const genreId = mongoose.Types.ObjectId(req.params.id);

    if (!errors.isEmpty()) {
      // re-render form with errors
      Genre.findById(genreId).exec((err, genre) => {
        if (err) return next(err);
        // console.log(errors.array());
        return res.render("genre_form", {
          genre,
          errors: errors.array(),
        });
      });
      return;
    }

    // Update the genre and redirect to genre detail page
    const genre = new Genre({ ...req.body, _id: genreId });
    Genre.findByIdAndUpdate(genreId, genre, { new: true }).exec(
      (err, results) => {
        // Genre not found in DB.
        if (err) return next(err);

        return res.redirect(genre.url);
      }
    );
  },
];
