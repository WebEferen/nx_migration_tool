import { InternalServerErrorException } from '@exceptions';
import { WorkbookService } from '@modules/workbook';
import { Workbook } from '@modules/workbook/types';
import { HttpException, Injectable } from '@nestjs/common';
import { SpreadsheetResponseDto } from './dto/spreadsheet-response.dto';
import { GroupedData } from './types';

@Injectable()
export class SpreadsheetService {
    constructor(private readonly workbookService: WorkbookService) {}

    public async calculate(groupedData: GroupedData[], workbook: Workbook) {
        try {
            this.workbookService.importWorkbook(workbook);
            const results = groupedData.flatMap((inputData) => {
                const dataHeaders = this.workbookService.importData(inputData.inputs);
                return this.workbookService.getCalculatedResults(dataHeaders).data;
            });
            return { data: results } as SpreadsheetResponseDto;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new InternalServerErrorException(error.message);
            }
        } finally {
            this.workbookService.destroy();
        }
    }
}
