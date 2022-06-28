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

    const [agent] = await registerAndLogin();
    const resp = await agent.get('/api/v1/todos');
    expect(resp.status).toBe(200);
    expect(resp.body).toEqual([
      {
        id: '1',
        task: 'Clean my room',
        description: 'Make bed, vacuum floor, fold laundry',
        complete: true,
        created_at: expect.any(String),
        user_id: 1,    
      },
      {
        id: '2',
        task: 'Wash my car',
        description: 'Go through wash, scrub moss off door, vacuum carpets',
        complete: false,
        created_at: expect.any(String),
        user_id: 1,    
      },
      {
        id: '3',
        task: 'Do yardwork',
        description: 'Mow the lawn, trim the hedges, pressure wash the driveway',
        complete: true,
        created_at: expect.any(String),
        user_id: 1,    
      },
    ]);
  });
    
});
