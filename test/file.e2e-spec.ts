import { agent } from './utils';

describe('Dummy test', () => {
    describe('/api/ (GET)', () => {
        it('should respond with status 200', async () => {
            // given

            // when
            const response = agent.get(`/api/`);

            // then
            const json = await response
                .expect('Content-Type', /json/)
                .expect(200)
                .then<any>(({ body }) => body);

            expect(Object.keys(json)).toBeTruthy();
        });
    });
});
