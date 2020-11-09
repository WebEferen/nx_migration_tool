import { DataException, WorkbookException } from '@exceptions';
import GC from '@grapecity/spread-sheets';
import { CommonConfigService } from '@modules/config';
import { DataTable } from '@modules/spreadsheet/types';
import { Injectable } from '@nestjs/common';
import { Dictionary, range } from 'lodash';
import { Workbook } from './types';

export const RESULT_TABLE = '_RESULT';
export const FALLBACK_TABLE = '_INPUT';

@Injectable()
export class WorkbookService {
    private workbook: Workbook;

    constructor(private readonly configService: CommonConfigService) {
        this.setLicense();
        this.workbook = new GC.Spread.Sheets.Workbook();
    }

    private setLicense() {
        GC.Spread.Sheets.LicenseKey = this.configService.sheet.licenceKey;
    }

    public initTablesData(inputData: DataTable) {
        inputData.forEach(({ name, data }) => {
            const [tableName, sheet] = this.findSheetByTable(name);
            const table = sheet && sheet.tables.findByName(tableName);

            if (table) {
                sheet.suspendPaint();

                const { rowCount, row, col } = table.range();
                const firstDataRow = row + 1;

                sheet.setRowCount(firstDataRow + data.length);
                table.insertRows(0, data.length - rowCount);
                sheet.setArray(firstDataRow, col, data, false);

                sheet.resumePaint();
            }
        });
    }

    private findSheetByTable(tableName: string): [string, GC.Spread.Sheets.Worksheet | undefined] {
        return [tableName, this.workbook.sheets.find((sheet) => !!sheet.tables.findByName(tableName))];
    }

    public get resultsData() {
        let [tableName, resultsSheet] = this.findSheetByTable(RESULT_TABLE);
        if (!resultsSheet) {
            [tableName, resultsSheet] = this.findSheetByTable(FALLBACK_TABLE);
            if (!resultsSheet) throw new DataException(`Couldn't find result table ${RESULT_TABLE} or ${FALLBACK_TABLE} in provided workbook`);
        }

        const table = resultsSheet.tables.findByName(tableName);
        const { rowCount, colCount, row: firstRowIndex } = table.range();
        const setCell = (row: number, col: number): any => {
            const fieldName = resultsSheet.getCell(firstRowIndex, col).value();
            const fieldValue = resultsSheet.getCell(row, col).value();
            return { [fieldName]: fieldValue };
        };
        const setRow = (dataRow: Dictionary<undefined>, rowIndex: number, columnIndex: number) => ({ ...dataRow, ...setCell(rowIndex, columnIndex) });

        const data = range(rowCount).map((_, rowIndex) =>
            range(colCount).reduce((dataRow, _, colIndex) => setRow(dataRow, rowIndex + 2, colIndex), {}),
        );

        return { data };
    }

    public set json(workbook: Workbook) {
        try {
            this.workbook.fromJSON(workbook);
        } catch {
            throw new WorkbookException('Invalid SpreadJS licence');
        }
    }

    public destroy() {
        this.workbook.destroy();
    }
}
