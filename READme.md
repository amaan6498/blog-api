# 📝 Blog API

A simple RESTful API for a blog application with user authentication and post management. Built with Node.js and Express.

## 🚀 Features

- 🔐 User authentication (Signup & Login)
- 📝 Create, Read, and List blog posts
- 👤 JWT-based authorization
- 📦 Modular route structure

## 🛠️ Tech Stack

- Node.js
- Express
- MongoDB (via Mongoose)
- JSON Web Tokens (JWT)
- bcrypt (for password hashing)

## 📁 API Endpoints

### Auth Routes

#### `POST /register`

Create a new user account.

- **Body:**

```json
{
  "username": "yourUsername",
  "password": "yourPassword"
}
```

#### `POST /login`

Login an existing user.

- **Body:**

```json
{
  "username": "yourUsername",
  "password": "yourPassword"
}
```

- **Response: Returns a JWT token if login is successful.**

### `GET /allposts`

Returns a list of all blog posts.

Public Route

#### `POST /addpost`

Create a new blog post.

- **Body:**

```json
{
  "name": "name",
  "imgUrl": "url",
  "description": "descriptions",
  "tags": "automated",
  "date": "automated"
}
```

🧪 Getting Started

1. Clone the Repository
   git clone https://github.com/amaan6498/blog-api.git
   cd blog-api
2. Install Dependencies
   npm install
3. Create a .env File with
   DATABASE_USER,
   DATABASE_HOST,
   DATABASE_NAME,
   DATABASE_PASS,
   DATABASE_PORT,
   JWT_SECRET.
4. Run the Server
   node index.js
   Server will be running at http://localhost:5000
