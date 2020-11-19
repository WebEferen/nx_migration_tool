import { WorkbookService } from '@modules/workbook';
import { Workbook } from '@modules/workbook/types';
import { Injectable } from '@nestjs/common';
import { DataTable, InputDataRow } from './types';

@Injectable()
export class SpreadsheetService {
    constructor(private readonly workbook: WorkbookService) {}

    public async calculate(inputData: DataTable<InputDataRow>, workbook: Workbook) {
        this.workbook.json = workbook;
        this.workbook.initTablesData(this.simplifyInputDataStructure(inputData));
        const results = this.workbook.resultsData;
        this.workbook.destroy();

        return results;
    }

    private simplifyInputDataStructure(inputData: DataTable<InputDataRow>) {
        return inputData.map(({ name, data }) => ({ name, data: data.map((value) => Object.values(value)) }));
    }
}
