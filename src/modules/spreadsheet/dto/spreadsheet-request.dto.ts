import { Workbook } from '@modules/workbook/types';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmptyObject } from 'class-validator';
import { DataTable } from '../types';

export class SpreadsheetRequestDto {
    @ApiProperty()
    @ArrayNotEmpty()
    data: DataTable;

    @ApiProperty()
    @IsNotEmptyObject()
    workbook: Workbook;
}
