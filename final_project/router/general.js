const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Missing fields" });
}

// 2. Check if user already exists in the ARRAY
// We use .find() to see if any object in the array has this username
const userExists = users.find(user => user.username === username);

if (userExists) {
    return res.status(400).json({ error: "User already exists" });
}

// 3. PUSH the new user object into the array
users.push({
    "username": username,
    "password": password
});

return res.status(201).json({ message: "User registered!" });


});
// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn]; // Direct lookup by key

    if (book) {
        res.status(200).json(book);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;
  
  const filteredBooks = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());
  
  if (filteredBooks.length > 0) {
    res.status(200).json(filteredBooks);
} else {
    res.status(404).json({ message: "No books found for this author" });
}
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
  
  const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());
  
  if (filteredBooks.length > 0) {
    res.status(200).json(filteredBooks);
} else {
    res.status(404).json({ message: "No books found for this title" });
}
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        // Return only the reviews object, not the whole book
        res.status(200).json(book.reviews);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
