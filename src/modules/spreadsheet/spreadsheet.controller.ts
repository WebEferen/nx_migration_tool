import { Scopes } from '@decorators';
import { Scope } from '@guards';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SpreadsheetRequestDto } from './dto/spreadsheet-request.dto';
import { SpreadsheetResponseDto } from './dto/spreadsheet-response.dto';
import { SpreadsheetService } from './spreadsheet.service';

@Controller('spreadsheet')
@ApiTags('spreadsheet')
@ApiExtraModels(SpreadsheetResponseDto)
export class SpreadsheetController {
    constructor(private readonly spreadsheetService: SpreadsheetService) {}

    @Post('calculate')
    @HttpCode(HttpStatus.OK)
    @Scopes(Scope.RunCalculation)
    @ApiResponse({ type: SpreadsheetResponseDto })
    async calculate(@Body() { data, workbook }: SpreadsheetRequestDto): Promise<SpreadsheetResponseDto> {
        return this.spreadsheetService.calculate(data, workbook);
    }
}
