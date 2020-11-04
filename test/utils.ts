import request from 'supertest';

const API_HOST = 'localhost';
const API_PORT = 3000;

export const agent = request.agent(`http://${API_HOST}:${API_PORT}`);
