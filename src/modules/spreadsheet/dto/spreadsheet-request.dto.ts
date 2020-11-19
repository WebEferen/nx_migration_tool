import { Workbook } from '@modules/workbook/types';
import { ArrayNotEmpty, IsNotEmptyObject } from 'class-validator';
import { DataTable, InputDataRow } from '../types';

export class SpreadsheetRequestDto {
    @ArrayNotEmpty()
    data: DataTable<InputDataRow>;

    @IsNotEmptyObject()
    workbook: Workbook;
}
