import { WorkbookModule } from '@modules/workbook';
import { Module } from '@nestjs/common';
import { SpreadsheetController } from './spreadsheet.controller';
import { SpreadsheetService } from './spreadsheet.service';

@Module({
    imports: [WorkbookModule],
    exports: [SpreadsheetService],
    providers: [SpreadsheetService],
    controllers: [SpreadsheetController],
})
export class SpreadsheetModule {}
