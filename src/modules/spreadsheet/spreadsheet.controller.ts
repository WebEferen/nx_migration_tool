import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SpreadsheetRequestDto } from './dto/spreadsheet-request.dto';
import { SpreadsheetResponseDto } from './dto/spreadsheet-response.dto';
import { SpreadsheetService } from './spreadsheet.service';

@Controller('spreadsheet')
export class SpreadsheetController {
    constructor(private readonly spreadsheetService: SpreadsheetService) {}

    @Post('calculate')
    @HttpCode(HttpStatus.OK)
    async calculate(@Body() { data, workbook }: SpreadsheetRequestDto): Promise<SpreadsheetResponseDto> {
        return this.spreadsheetService.calculate(data, workbook);
    }
}
