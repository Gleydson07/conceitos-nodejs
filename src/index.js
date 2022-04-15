const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const user = users.find(item => item.username === username);

  if(!user){
    return response.status(404).send({error: "Usuário não encontrado."})
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const userAlreadyExists = users.some(item => item.username === username);

  if(userAlreadyExists){
    return response.status(400).send({error: "Usuário já existe."});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;

  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const {title, deadline} = request.body;

  const todo = user.todos.find(item => item.id === id);

  if(!todo){
    return response.status(404).send({error: "Todo não encontrado."});
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todo = user.todos.find(item => item.id === id);

  if(!todo){
    return response.status(404).send({error: "Todo não encontrado."});
  }

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todoIndex = user.todos.findIndex(item => item.id === id);
  
  if(!user.todos[todoIndex]){
    return response.status(404).send({error: "Todo não encontrado."});
  }
  
  user.todos.splice(todoIndex, 1);
  console.log(user.todos);

  return response.status(204).send();
});

module.exports = app;