const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
let userswithsamename = users.filter((user) => {
    return user.username === username;
});
return userswithsamename.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
    console.log("Attempting login for:", username);
    console.log("Current records:", users)

    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return validusers.length > 0;
    //write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username; 
    const password = req.body.password
    if (!username || !password) {
        return res.status(400).json({ message: "Missing username or password" });
    }

    if (authenticatedUser(username, password)) {
        // Generate JWT Token
        let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
        
        // Store in session
        req.session.authorization = { accessToken, username };
        
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.body.review;

  // 1. Safety check for the session
  if (!req.session || !req.session.authorization) {
      return res.status(403).json({ message: "User not logged in or session expired" });
  }

  const username = req.session.authorization['username'];

  if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
      return res.status(400).json({ message: "Review content is missing" });
  }

  // Initialize and update
  if (!books[isbn].reviews) books[isbn].reviews = {};
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully" });
});


// This route is nested under /customer/auth
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization['username'];

    // 1. Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // 2. Check if the book has reviews and if THIS user has a review
    if (books[isbn].reviews && books[isbn].reviews[username]) {
        // Delete the review associated with the username
        delete books[isbn].reviews[username];
        
        return res.status(200).json({ 
            message: `Review for ISBN ${isbn} posted by user ${username} deleted.` 
        });
    } else {
        return res.status(404).json({ message: "No review found for this user on this book" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;