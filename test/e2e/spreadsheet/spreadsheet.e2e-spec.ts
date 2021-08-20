import { agent, generateTokenForXsuaa } from '../utils';
import invalidPayloadInputString from './__fixtures__/payload-empty-workbook-input-string.fixture.json';
import invalidPayloadEmptyWorkbook from './__fixtures__/payload-empty-workbook.fixture.json';
import fallbackPayloadWithCellFormulas from './__fixtures__/payload-fallback-with-cell-formulas.fixture.json';
import fallbackPayloadWithDislocatedTable from './__fixtures__/payload-fallback-with-dislocated-table-workbook.fixture.json';
import fallbackPayloadNoFieldInDataSource from './__fixtures__/payload-fallback-workbook-no-field-in-data-source.fixture.json';
import fallbackPayloadNoFieldInWorkbook from './__fixtures__/payload-fallback-workbook-no-field-in-workbook.fixture.json';
import fallbackPayload from './__fixtures__/payload-fallback-workbook.fixture.json';
import fullPayloadNoFieldInWorkbookResults from './__fixtures__/payload-full-workbook-no-field-in-workbook-results.fixture.json';
import fullPayload from './__fixtures__/payload-full-workbook.fixture.json';
import invalidPayload from './__fixtures__/payload-invalid-workbook.fixture.json';

describe('Spreadsheet calculation', () => {
    describe('/api/spreadsheet/calculate (POST)', () => {
        const tokenPayload = { cid: '12345', azp: '12345', zid: 'tenant-id' };
        const validTokenWithoutScope = generateTokenForXsuaa(tokenPayload);
        const validToken = generateTokenForXsuaa({ scope: ['papm.run_calculation'], ...tokenPayload });

        it('should correctly calculate formulas from _INPUT table based on input and lookup data', async () => {
            // given

            // when
            const response = agent.post(`/api/spreadsheet/calculate`).set('Authorization', `Bearer ${validToken}`).send(fallbackPayload);

            // then
            const results = await response
                .expect('Content-Type', /json/)
                .expect(200)
                .then<any>(({ body }) => body);

            expect(results).toMatchSnapshot();
        });

        it('should correctly calculate formulas from dislocated _INPUT table based on input and lookup data', async () => {
            // given

            // when
            const response = agent
                .post(`/api/spreadsheet/calculate`)
                .set('Authorization', `Bearer ${validToken}`)
                .send(fallbackPayloadWithDislocatedTable);

            // then
            const results = await response
                .expect('Content-Type', /json/)
                .expect(200)
                .then<any>(({ body }) => body);

            expect(results).toMatchSnapshot();
        });

        it('should correctly calculate formulas from _RESULT table based on input and lookup data', async () => {
            // given

            // when
            const response = agent.post(`/api/spreadsheet/calculate`).set('Authorization', `Bearer ${validToken}`).send(fullPayload);

            // then
            const results = await response
                .expect('Content-Type', /json/)
                .expect(200)
                .then<any>(({ body }) => body);

            expect(results).toMatchSnapshot();
        });

        it('should fail with "400 Bad Request" when sending empty payload', async () => {
            // given
            const emptyPayload = {};

            // when
            const response = agent.post(`/api/spreadsheet/calculate`).set('Authorization', `Bearer ${validToken}`).send(emptyPayload);

            // then
            await response.expect(400);
        });

        it('should fail with "400 Bad Request" when sending invalid input data', async () => {
            // given
            const payloadWithInvalidInputData = { data: '', workbook: '' };

            // when
            const response = agent.post(`/api/spreadsheet/calculate`).set('Authorization', `Bearer ${validToken}`).send(payloadWithInvalidInputData);

            // then
            await response.expect(400);
        });

        it('should fail with "422 Unprocessable Entity" when sending invalid workbook', async () => {
            // given

            // when
            const response = agent.post(`/api/spreadsheet/calculate`).set('Authorization', `Bearer ${validToken}`).send(invalidPayload);

            // then
            await response.expect(422);
        });

        it('should correctly return data based on _INPUT table with many formulas and formatters', async () => {
            // given

            // when
            const response = agent
                .post(`/api/spreadsheet/calculate`)
                .set('Authorization', `Bearer ${validToken}`)
                .send(fallbackPayloadWithCellFormulas);

            // then
            const results = await response
                .expect('Content-Type', /json/)
                .expect(200)
                .then<any>(({ body }) => body);

            expect(results).toMatchSnapshot();
        });

        it('should fail when token is not valid', async () => {
            // given
            const invalidAuthToken = Buffer.from('FOOBAR').toString('base64');

            // when
            const request = agent
                .post('/api/spreadsheet/calculate')
                .set('Authorization', `Bearer ${invalidAuthToken}`)
                .send(fallbackPayloadWithCellFormulas);

            //then
            await request.expect(401);
        });

        it('should return "Forbidden resource" when unauthorized', async () => {
            // given

            // when
            const request = agent
                .post('/api/spreadsheet/calculate')
                .set('Authorization', `Bearer ${validTokenWithoutScope}`)
                .send(fallbackPayloadWithCellFormulas);

            //then
            await request.expect(403);
        });

        it('should return status 422 for incorrect _INPUT table columns in data source', async () => {
            // given

            // when
            const response = agent
                .post(`/api/spreadsheet/calculate`)
                .set('Authorization', `Bearer ${validToken}`)
                .send(fallbackPayloadNoFieldInDataSource);

            // then
            const results = await response
                .expect('Content-Type', /json/)
                .expect(422)
                .then<any>(({ body }) => body);

            expect(results.message).toMatchSnapshot();
        });

        it('should return status 422 for incorrect _INPUT table columns in workbook', async () => {
            // given

            // when
            const response = agent
                .post(`/api/spreadsheet/calculate`)
                .set('Authorization', `Bearer ${validToken}`)
                .send(fallbackPayloadNoFieldInWorkbook);

            // then
            const results = await response
                .expect('Content-Type', /json/)
                .expect(422)
                .then<any>(({ body }) => body);

            expect(results.message).toMatchSnapshot();
        });

        it('should return status 422 for incorrect _RESULT table columns in workbook', async () => {
            // given

            // when
            const response = agent
                .post(`/api/spreadsheet/calculate`)
                .set('Authorization', `Bearer ${validToken}`)
                .send(fullPayloadNoFieldInWorkbookResults);

            // then
            const results = await response
                .expect('Content-Type', /json/)
                .expect(422)
                .then<any>(({ body }) => body);

            expect(results.message).toMatchSnapshot();
        });

        it('should return status 422 for incorrect data source as string instead of array', async () => {
            // given

            // when
            const response = agent.post(`/api/spreadsheet/calculate`).set('Authorization', `Bearer ${validToken}`).send(invalidPayloadInputString);

            // then
            const results = await response
                .expect('Content-Type', /json/)
                .expect(422)
                .then<any>(({ body }) => body);

            expect(results.message).toMatchSnapshot();
        });

        it('should return status 422 when table not found in wokbook', async () => {
            // given

            // when
            const response = agent.post(`/api/spreadsheet/calculate`).set('Authorization', `Bearer ${validToken}`).send(invalidPayloadEmptyWorkbook);

            // then
            const results = await response
                .expect('Content-Type', /json/)
                .expect(422)
                .then<any>(({ body }) => body);

            expect(results.message).toMatchSnapshot();
        });
    });
});
