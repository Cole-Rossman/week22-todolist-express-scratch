const pool = require('../utils/pool');

module.exports = class Todo {
  id;
  task;
  description;
  complete;
  user_id;
  created_at;
  
  constructor(row) {
    this.id = row.id;
    this.task = row.task;
    this.description = row.description;
    this.complete = row.complete;
    this.user_id = row.user_id;
    this.created_at = row.created_at;
  }

  static async insert({ task, description, complete, user_id }) {
    const { rows } = await pool.query(
      `
      INSERT INTO todos (task, description, complete, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [task, description, complete, user_id]
    );

    return new Todo(rows[0]);
  }

  static async getAll(user_id) {
    const { rows } = await pool.query(
      'SELECT * FROM todos WHERE user_id=$1 ORDER BY created_at DESC',
      [user_id]
    );
    return rows.map((todo) => new Todo(todo));
  } 

  static async updateById(id, attrs) {
    const todo = await Todo.getById(id);
    if (!todo) return null;
    const { task, description, complete } = { ...todo, ...attrs };
    const { rows } = await pool.query(
      `
      UPDATE todos
      SET task=$2, description=$3, complete=$4
      WHERE id=$1 RETURNING *
      `,
      [id, task, description, complete]
    );
    return new Todo(rows[0]);
  }

  static async getById(id) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM todos
      WHERE id=$1
      `,
      [id]
    );
    if (!rows[0]) {
      return null;
    }
    return new Todo(rows[0]);
  }

  static async delete(id) {
    const { rows } = await pool.query(
      `
      DELETE FROM todos
      WHERE id=$1
      RETURNING *
      `,
      [id]
    );
    return new Todo(rows[0]);
  }
};
