import { WorkbookService } from '@modules/workbook';
import { Workbook } from '@modules/workbook/types';
import { Injectable } from '@nestjs/common';
import { DataTable } from './types';

@Injectable()
export class SpreadsheetService {
    constructor(private readonly workbook: WorkbookService) {}

    public async calculate(inputData: DataTable, workbook: Workbook) {
        this.workbook.json = workbook;
        this.workbook.initTablesData(inputData);
        const results = this.workbook.resultsData;
        this.workbook.destroy();

        return results;
    }
}
