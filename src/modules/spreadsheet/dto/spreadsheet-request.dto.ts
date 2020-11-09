import { Workbook } from '@modules/workbook/types';
import { ArrayNotEmpty, IsNotEmptyObject } from 'class-validator';
import { DataTable } from '../types';

export class SpreadsheetRequestDto {
    @ArrayNotEmpty()
    data: DataTable;

    @IsNotEmptyObject()
    workbook: Workbook;
}
