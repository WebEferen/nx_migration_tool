import { WorkbookService } from '@modules/workbook';
import { Workbook } from '@modules/workbook/types';
import { Injectable } from '@nestjs/common';
import { SpreadsheetResponseDto } from './dto/spreadsheet-response.dto';
import { GroupedData } from './types';

@Injectable()
export class SpreadsheetService {
    constructor(private readonly workbookService: WorkbookService) {}

    public async calculate(groupedData: GroupedData[], workbook: Workbook) {
        try {
            this.workbookService.importWorkbook(workbook);
            const results = groupedData.flatMap((inputData) => {
                this.workbookService.importData(inputData.inputs);
                return this.workbookService.getCalculatedResults().data;
            });
            return { data: results } as SpreadsheetResponseDto;
        } finally {
            this.workbookService.destroy();
        }
    }
}
