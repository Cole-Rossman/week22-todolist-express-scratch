const { Router } = require('express');
const Todo = require('../models/Todo');
const authenticate = require('../middleware/authenticate');
const authorizeTodo = require('../middleware/authorizeTodo');

module.exports = Router()
  .delete('/:id', authenticate, authorizeTodo, async (req, res, next) => {
    try {
      const todo = await Todo.delete(req.params.id);
      res.json(todo);
    } catch (e) {
      next(e);
    }
  })
  .put('/:id', authenticate, authorizeTodo, async (req, res, next) => {
    try {
      const todo = await Todo.updateById(req.params.id, req.body);
      res.json(todo);
    } catch (e) {
      next(e);
    }
  })
  .post('/', authenticate, async (req, res, next) => {
    try {
      const todo = await Todo.insert({ ...req.body, user_id: req.user.id });
      res.json(todo);  
    } catch (e) {
      next(e); 
    }
  })
  .get('/', authenticate, async (req, res, next) => {
    try {
      const data = await Todo.getAll(req.user.id);
      res.json(data);  
    } catch (e) {
      next(e);  
    }
  });
