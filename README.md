
---
#  Collaborative Kanban Board

A real-time collaborative task board with Smart Assign and Conflict Handling features. Built using the MERN stack, this application enables teams to manage their tasks efficiently in a live, synchronized environment.

---

##  Project Overview

This is a collaborative Kanban board that allows multiple users to:
- Manage tasks across different statuses (Todo, In Progress, Done)
- Automatically assign tasks to the least-loaded user
- Resolve conflicts when multiple users update the same task
- View real-time task updates and activity logs

---

##  Tech Stack

### Frontend
- React.js
- React Router
- Vite
- Axios
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.IO
- JWT (JSON Web Token)
- Bcrypt.js

---

##  Features

-  User authentication (register/login with JWT)
-  Create and delete tasks
-  Drag-and-drop tasks between columns
-  Smart Assign: Auto-assigns task to user with fewest active tasks
-  Conflict Handling: Detects and handles concurrent task updates
-  Real-time updates via Socket.IO
- Activity log tracking user actions

---

## Setup & Installation Instructions

### Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
````

---

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder with:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:

```bash
node server.js
```

---

### Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

The frontend runs at:
**[http://localhost:5173/](http://localhost:5173/)**

---

### 4️ Run Both Together (Optional)

If using `concurrently` from the root directory:

```bash
npm run start
```

---

##  Usage Guide

1.  Register or log in using your credentials.
2.  Create a task using the form.
3.  Use drag-and-drop to move tasks between columns.
4.  Click "Smart Assign" to automatically assign the task.
5.  Use "Delete" to remove a task.
6.  Real-time updates appear instantly across all users.
7.  View logs of all user activity in the Activity Log panel.

---

## Smart Assign Logic

The **Smart Assign** feature ensures even distribution of tasks by:

* Counting active tasks (not 'Done') assigned to each user.
* Assigning the task to the user with the fewest such tasks.

This balances workload automatically without manual intervention.

### Endpoint:

```http
PUT /tasks/:id/smart-assign
```

---

## Conflict Handling Logic

To avoid overwriting changes made by others:

* When updating a task, the client sends the `lastKnownUpdatedAt`.
* The server compares this with the current `updatedAt`.
* If they mismatch, the server responds with a **409 Conflict**.
* The user is prompted to either:

  * Overwrite the changes
  * Accept the server’s version

This ensures safe and informed task updates in a multi-user environment.

---

## Folder Structure

```
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middlewares
│   └── utils
├── frontend
│   ├── components
│   ├── pages
│   └── App.jsx
└── README.md
```

---




