import { WorkbookService } from '@modules/workbook';
import { Workbook } from '@modules/workbook/types';
import { Injectable } from '@nestjs/common';
import { DataTable } from './types';

@Injectable()
export class SpreadsheetService {
    constructor(private readonly workbookService: WorkbookService) {}

    public async calculate(inputData: DataTable, workbook: Workbook) {
        try {
            this.workbookService.importWorkbook(workbook);
            this.workbookService.importData(inputData);
            const results = this.workbookService.getCalculatedResults();
            return results;
        } finally {
            this.workbookService.destroy();
        }
    }
}
