import { ConfigModule } from '@modules/config';
import { Module } from '@nestjs/common';
import { WorkbookService } from './workbook.service';

@Module({
    imports: [ConfigModule],
    exports: [WorkbookService],
    providers: [WorkbookService],
})
export class WorkbookModule {}
