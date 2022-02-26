import * as functions from "firebase-functions";
import * as express from "express";

import {
  loginUser,
  signUpUser,
  uploadProfilePhoto,
  getUserDetails,
  updateUserDetails,
} from "./APIs/users";
import {
  getAllTodos,
  postOneTodo,
  deleteTodo,
  editTodo,
  getOneTodo,
} from "./APIs/todos";
import { auth } from "./utils/auth";

const app = express();

// Users
app.post("/login", loginUser);
app.post("/signup", signUpUser);
app.post("/user/image", auth, uploadProfilePhoto);
app.post("/user", auth, updateUserDetails);
app.get("/user", auth, getUserDetails);

// Todos
app.get("/todos", auth, getAllTodos);
app.get("/todo/:todoId", auth, getOneTodo);
app.post("/todo", auth, postOneTodo);
app.delete("/todo/:todoId", auth, deleteTodo);
app.put("/todo/:todoId", auth, editTodo);

exports.api = functions.https.onRequest(app);
