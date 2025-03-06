const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{"username": "user1", "password": "password1"}];

const isValid = (username)=>{ //returns boolean
    return username && !users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
// Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Get ISBN from route
    const { review } = req.body; // Get review from request body
    const username = req.user?.username; // Get username from session (JWT middleware)
  
    if (!isbn || !review) {
      return res.status(400).json({ message: "ISBN and review are required." });
    }
  
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    if (!book.reviews) book.reviews = {}; // Initialize reviews if not present
    book.reviews[username] = review; // Add or update review by username
  
    return res.status(200).json({
      message: `Review by user '${username}' added/updated successfully`,
      reviews: book.reviews
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Get ISBN from route
    const username = req.user?.username; // Get username from session (JWT middleware)
  
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    if (book.reviews && book.reviews[username]) {
      delete book.reviews[username]; // Delete the review by the current user
      return res.status(200).json({
        message: `Review by user '${username}' deleted successfully`,
        reviews: book.reviews
      });
    } else {
      return res.status(404).json({ message: "Review not found for the current user" });
    }
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
