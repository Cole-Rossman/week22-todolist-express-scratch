const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../services/UserService');
const Todo = require('../models/Todo');

const mockUser = {
  email: 'testing@example.com',
  password: '654321',
};

const mockUser2 = {
  email: 'testing2@example.com',
  password: '123456',
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
    // create a user
    const [agent, user] = await registerAndLogin();
    // add second user with todos
    const user2 = await UserService.create(mockUser2);
    const user1Todo = await Todo.insert({
      task: 'organize shelves',
      description: 'put books in correct places',
      complete: false,
      user_id: user.id,
    });
    await Todo.insert({
      task: 'walk the dog',
      description: 'take the dog to the park',
      complete: true,
      user_id: user2.id,
    });
    const resp = await agent.get('/api/v1/todos');
    expect(resp.status).toBe(200);
    expect(resp.body).toEqual([user1Todo]);
  });
    
});
