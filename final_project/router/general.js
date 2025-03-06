const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users[username]) {
    return res.status(400).json({ message: "Username already exists" });
  }
  users[username] = { password: password }; // In a real app, hash the password before storing it
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
    try {
        const getBooks = () => {
          return new Promise((resolve) => {
            setTimeout(() => resolve(books), 1000); // Simulating async operation
          });
        };
        const bookList = await getBooks(); // Fetching the book list
        res.status(200).json(bookList); // Returning the book list
      } catch (error) {
        res.status(500).json({ message: "Error retrieving books", error: error.message });
      }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    
    const myPromise = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(res.status(200).json(book))
    } else {
      reject(res.status(404).json({ message: "Book not found" }))
    }
  })

  myPromise.then(() => {
    console.log("Resolved!")
  }).catch(() => {
    console.log("Rejected!")
  })
  return res.status(300).json({message: "Yet to be implemented"});
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {
      const getBooksByAuthor = (author) => {
        return new Promise((resolve, reject) => {
          const booksByAuthor = [];
          Object.keys(books).forEach(isbn => {
            if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
              booksByAuthor.push({ isbn, ...books[isbn] });
            }
          });
  
          if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
          } else {
            reject(new Error("No books found by this author"));
          }
        });
      };
  
      const author = req.params.author; // Extract Author from route
      const booksByAuthor = await getBooksByAuthor(author); // Fetch books by author
      res.status(200).json(booksByAuthor); // Return books by author
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  });



// get book details based on Title 
public_users.get('/title/:title', async function (req, res) {
    try {
      const getBooksByTitle = (title) => {
        return new Promise((resolve, reject) => {
          const booksByTitle = [];
          Object.keys(books).forEach(isbn => {
            if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
              booksByTitle.push({ isbn, ...books[isbn] });
            }
          });
  
          if (booksByTitle.length > 0) {
            resolve(booksByTitle);
          } else {
            reject(new Error("No books found with this title"));
          }
        });
      };
  
      const title = req.params.title; // Extract Title from route
      const booksByTitle = await getBooksByTitle(title); // Fetch books by title
      res.status(200).json(booksByTitle); // Return books by title
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  });
//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
  const reviews = books[isbn]?.reviews;
  if (reviews) {
    return res.status(200).json(reviews);
  } else {
    return res.status(404).json({ message: "No reviews found for this book" });
  }
});

module.exports.general = public_users;
