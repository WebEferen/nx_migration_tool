import { agent } from './utils';
import fallbackPayloadWithCellFormulas from './__fixtures__/payload-fallback-with-cell-formulas.fixture.json';
import fallbackPayloadWithDislocatedTable from './__fixtures__/payload-fallback-with-dislocated-table-workbook.fixture.json';
import fallbackPayload from './__fixtures__/payload-fallback-workbook.fixture.json';
import fullPayload from './__fixtures__/payload-full-workbook.fixture.json';
import invalidPayload from './__fixtures__/payload-invalid-workbook.fixture.json';

describe('Spreadsheet calculation', () => {
    describe('/api/spreadsheet/calculate (POST)', () => {
        it('should correctly calculate formulas from _INPUT table based on input and lookup data', async () => {
            // given

            // when
            const response = agent.post(`/api/spreadsheet/calculate`).send(fallbackPayload);

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
            const response = agent.post(`/api/spreadsheet/calculate`).send(fallbackPayloadWithDislocatedTable);

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
            const response = agent.post(`/api/spreadsheet/calculate`).send(fullPayload);

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
            const response = agent.post(`/api/spreadsheet/calculate`).send(emptyPayload);

            // then
            await response.expect(400);
        });

        it('should fail with "400 Bad Request" when sending invalid input data', async () => {
            // given
            const payloadWithInvalidinputData = { data: '', workbook: '' };

            // when
            const response = agent.post(`/api/spreadsheet/calculate`).send(payloadWithInvalidinputData);

            // then
            await response.expect(400);
        });

        it('should fail with "422 Unprocessable Entity" when sending invalid workbook', async () => {
            // given

            // when
            const response = agent.post(`/api/spreadsheet/calculate`).send(invalidPayload);

            // then
            await response.expect(422);
        });

        it('should correctly return data based on _INPUT table with many formulas and formatters', async () => {
            // given

            // when
            const response = agent.post(`/api/spreadsheet/calculate`).send(fallbackPayloadWithCellFormulas);

            // then
            const results = await response
                .expect('Content-Type', /json/)
                .expect(200)
                .then<any>(({ body }) => body);

            expect(results).toMatchSnapshot();
        });
    });
});
