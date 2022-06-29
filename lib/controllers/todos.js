const { Router } = require('express');
const Todo = require('../models/Todo');
const authenticate = require('../middleware/authenticate');

module.exports = Router()
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
