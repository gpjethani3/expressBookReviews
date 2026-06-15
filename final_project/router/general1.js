const express = require('express');
const axios = require('axios');
const public_users = express.Router();

// Base URL of your data source/database API
const DB_API_URL = "http://localhost:5000"; 

// Register a new user
public_users.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Missing fields" });
    }

    try {
        // Checking or persisting user via external API database
        const response = await axios.post(`${DB_API_URL}/users`, { username, password });
        return res.status(201).json({ message: "User registered!", data: response.data });
    } catch (error) {
        if (error.response && error.response.status === 400) {
            return res.status(400).json({ error: "User already exists" });
        }
        return res.status(500).json({ message: "Registration failed", error: error.message });
    }
});

// Get the book list available in the shop using async/await and axios
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${DB_API_URL}/books`);
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Get book details based on ISBN using async/await and axios
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const response = await axios.get(`${DB_API_URL}/books/${isbn}`);
        return res.status(200).json(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: "Book not found" });
        }
        return res.status(500).json({ message: "Error retrieving book details", error: error.message });
    }
});

// Get book details based on author using async/await and axios
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author;
        const response = await axios.get(`${DB_API_URL}/books`);
        const allBooks = Object.values(response.data);

        const filteredBooks = allBooks.filter(
            book => book.author.toLowerCase() === author.toLowerCase()
        );

        if (filteredBooks.length > 0) {
            return res.status(200).json(filteredBooks);
        } else {
            return res.status(404).json({ message: "No books found for this author" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books by author", error: error.message });
    }
});

// Get all books based on title using async/await and axios
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        const response = await axios.get(`${DB_API_URL}/books`);
        const allBooks = Object.values(response.data);

        const filteredBooks = allBooks.filter(
            book => book.title.toLowerCase() === title.toLowerCase()
        );

        if (filteredBooks.length > 0) {
            return res.status(200).json(filteredBooks);
        } else {
            return res.status(404).json({ message: "No books found for this title" });
        }
    } catch (error) {
        return res.status(500).json({ message: "An error occurred while searching by title", error: error.message });
    }
});

// Get book review
public_users.get('/review/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const response = await axios.get(`${DB_API_URL}/books/${isbn}`);
        return res.status(200).json(response.data.reviews || {});
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: "Book not found" });
        }
        return res.status(500).json({ message: "Error retrieving reviews", error: error.message });
    }
});

module.exports.general = public_users;
