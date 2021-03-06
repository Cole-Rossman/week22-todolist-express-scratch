const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');
const Todo = require('../lib/models/Todo');

const mockUser = {
  email: 'testing@example.com',
  password: '654321',
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;
  
  // create an agent that gives us the ability to store cookies between requests in a test
  const agent = request.agent(app);
  
  // Create a user to sign in with
  const user = await UserService.create({ ...mockUser, ...userProps });
  
  // now sign in 
  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};

describe('todos routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  
  afterAll(() => {
    pool.end();
  });

  
  
  it('lists all todos for the authenticated user', async () => {

    const [agent] = await registerAndLogin();
    await agent.post('/api/v1/todos').send(
      {
        task: 'Clean my room',
        description: 'Make bed, vacuum floor, fold laundry',
      }
    );
    const resp = await agent.get('/api/v1/todos');
    expect(resp.status).toBe(200);
    expect(resp.body).toEqual([
      {
        id: expect.any(String),
        task: 'Clean my room',
        description: 'Make bed, vacuum floor, fold laundry',
        complete: false,
        created_at: expect.any(String),
        user_id: expect.any(String),    
      }
    ]);
  });

  it('posts a todo for the authenticated user', async () => {

    const [agent] = await registerAndLogin();
    const resp = await agent.post('/api/v1/todos').send(
      {
        task: 'Clean my room',
        description: 'Make bed, vacuum floor, fold laundry',
      }
    );
    expect(resp.status).toBe(200);
    expect(resp.body).toEqual(
      {
        id: expect.any(String),
        task: 'Clean my room',
        description: 'Make bed, vacuum floor, fold laundry',
        complete: false,
        created_at: expect.any(String),
        user_id: expect.any(String),    
      },
    );
  });

  it('updates a todo if associated with authenticated user', async () => {
    const [agent, user] = await registerAndLogin();
    const todo = await Todo.insert({
      task: 'Make bed',
      description: 'Wash sheets and pillow cases',
      complete: true,
      user_id: user.id,
    });
    const resp = await agent
      .put(`/api/v1/todos/${todo.id}`)
      .send({ task: 'Ruin bed' });
    expect(resp.status).toBe(200);
    expect(resp.body).toEqual({ ...todo, task: 'Ruin bed', created_at: expect.any(String) });
  });

  it('deletes a todo if associated with authenticated user', async () => {
    const [agent, user] = await registerAndLogin();
    const todo = await Todo.insert({
      task: 'Wash fish tank',
      description: 'Clean the glass and replace filter',
      complete: true,
      user_id: user.id,
    });
    const resp = await agent.delete(`/api/v1/todos/${todo.id}`);
    expect(resp.status).toBe(200);
    const { body } = await agent.get(`/api/v1/todos/${todo.id}`);
    expect(body.status).toEqual(404);
    // 404 not found will indicate the todo has been deleted
  });

});
