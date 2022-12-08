const express = require("express");
const router = express.Router();

const bookInstanceController = require("../controllers/book_instance_controller");

// GET request for creating a BookInstance. NOTE This must come before route that displays BookInstance (uses id).
router.get(
  "/bookinstance/create",
  bookInstanceController.bookInstanceCreateGet
);

// POST request for creating BookInstance.
router.post(
  "/bookinstance/create",
  bookInstanceController.bookInstanceCreatePost
);

// GET request to delete BookInstance.
router.get(
  "/bookinstance/:id/delete",
  bookInstanceController.bookInstanceDeleteGet
);

// POST request to delete BookInstance.
router.post(
  "/bookinstance/:id/delete",
  bookInstanceController.bookInstanceDeletePost
);

// GET request to update BookInstance.
router.get(
  "/bookinstance/:id/update",
  bookInstanceController.bookInstanceUpdateGet
);

// POST request to update BookInstance.
router.post(
  "/bookinstance/:id/update",
  bookInstanceController.bookInstanceUpdatePost
);

// GET request for one BookInstance.
router.get("/bookinstance/:id", bookInstanceController.bookInstanceDetail);

// GET request for list of all BookInstance.
router.get("/bookinstances", bookInstanceController.bookInstanceList);

module.exports = router;
