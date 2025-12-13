const request=require('supertest');
const app=require('../server');

describe('Health Check API',()=>{
  it('should return health status when GET /health',async ()=>{
    const res=await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status','ok');
    expect(res.body).toHaveProperty('message');
  })
})