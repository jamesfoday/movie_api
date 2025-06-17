# myFlix Movie API

A RESTful API for a movie database. Built with Node.js, Express, and MongoDB, this API allows users to register, log in, browse movie data, manage a list of favorite movies, and update or delete their user profiles. The API serves as the backend for the myFlix web and mobile client applications.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Documentation](#documentation)
- [Author](#author)
- [License](#license)

---

## Features

- User registration and login (with hashed passwords & JWT authentication)
- CRUD operations for movies and users
- Add/remove movies to user's favorites
- Get movie details, directors, and genres
- CORS enabled for client integration
- Input validation with `express-validator`
- MongoDB integration (Mongoose)
- Comprehensive API documentation (JSDoc)

---

## Tech Stack

- Node.js
- Express.js
- MongoDB & Mongoose
- Passport & JWT for authentication
- JSDoc for documentation

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or local MongoDB)

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/jamesfoday/myFlix-API.git
    cd myFlix-API
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Set up environment variables:**
    - Create a `.env` file in the project root:
        ```
        CONNECTION_URI=your-mongodb-connection-string
        PORT=8080
        JWT_SECRET=your-secret-key
        ```
    - Or set these as system environment variables.

4. **Start the server:**
    ```bash
    npm start
    ```
    The API will run on `http://localhost:8080` by default.

---

## API Endpoints

(For full details, see JSDoc documentation or use an API tool like Postman.)

| Endpoint                      | Method | Description                            | Auth Required |
|-------------------------------|--------|----------------------------------------|:------------:|
| `/`                           | GET    | Welcome message                        |      ❌       |
| `/users`                      | POST   | Register a new user                    |      ❌       |
| `/users/login`                | POST   | User login, returns JWT                |      ❌       |
| `/users/:username`            | GET    | Get user by username                   |      ✅       |
| `/users/:username`            | PUT    | Update user info                       |      ✅       |
| `/users/:id`                  | DELETE | Delete user by ID                      |      ✅       |
| `/users/:id/favorites`        | GET    | Get user's favorite movies             |      ✅       |
| `/users/:id/favorites`        | POST   | Add movie to user's favorites          |      ✅       |
| `/users/:id/favorites/:movieId`| DELETE| Remove movie from user's favorites     |      ✅       |
| `/movies`                     | GET    | Get all movies                         |      ❌\*     |
| `/movies/:title`              | GET    | Get a single movie by title            |      ✅       |
| `/genres/:name`               | GET    | Get genre by name                      |      ✅       |
| `/directors/:name`            | GET    | Get director by name                   |      ✅       |

> \*JWT auth can be enforced or left open as needed.

---

## Authentication

- Most endpoints require a valid **JWT token** sent in the `Authorization` header as:
