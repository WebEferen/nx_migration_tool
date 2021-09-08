import { Workbook } from '@modules/workbook/types';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmptyObject } from 'class-validator';
import { GroupedData } from '../types';

export class SpreadsheetRequestDto {
    @ApiProperty()
    @ArrayNotEmpty()
    groupedData: GroupedData[];

    @ApiProperty()
    @IsNotEmptyObject()
    workbook: Workbook;
}
