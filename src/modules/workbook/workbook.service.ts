import { DataException, WorkbookException } from '@exceptions';
import GC from '@grapecity/spread-sheets';
import { CommonConfigService } from '@modules/config';
import { DataTable } from '@modules/spreadsheet/types';
import { Injectable } from '@nestjs/common';
import { Dictionary, isNull, isObject, range } from 'lodash';
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

    public importWorkbook(workbook: Workbook) {
        try {
            this.workbook.fromJSON(workbook);
        } catch {
            throw new WorkbookException('Invalid SpreadJS licence');
        }
    }

    public importData(inputData: DataTable) {
        inputData.forEach(({ name, data }) => {
            const sheet = this.findSheetByTable(name);
            const table = this.findTableByName(name);

            if (sheet && table) {
                this.adjustTableSizeAndInsertData(table, sheet, data);
            }
        });
    }

    public getCalculatedResults() {
        const { tableName, sheet } = this.findResultSheet();

        const table = sheet.tables.findByName(tableName);
        const { tableRowStartingIndex, tableColumnsCount, dataRowStartingIndex, tableRowsCount } = this.getResultTableCoordinates(table);

        // Fill all table rows and columns based on table coordinates using range(rows) and range(cols)
        const data = range(dataRowStartingIndex, tableRowsCount)
            .map((rowIndex) => range(tableColumnsCount).map((columnIndex) => this.getCellData(sheet, rowIndex, columnIndex, tableRowStartingIndex)))
            .filter((group) => group.some(({ value }) => !isNull(value) && !isObject(value))) // Filter only rows which has some non-empty values
            .map((group) => group.reduce<Dictionary<unknown>>((acc, { name, value }) => ({ ...acc, [name]: value }), {}));

        return { data };
    }

    public destroy() {
        this.workbook.destroy();
    }

    private findResultSheet() {
        const findSheet = (tableName: string) => {
            const sheet = this.findSheetByTable(tableName);

            return sheet ? { tableName, sheet } : null;
        };

        const resultSheet = findSheet(RESULT_TABLE) ?? findSheet(FALLBACK_TABLE);
        if (!resultSheet) {
            throw new DataException(`Couldn't find result tables "${RESULT_TABLE}" and "${FALLBACK_TABLE}" in provided workbook`);
        }

        return resultSheet;
    }

    private getCellData = (sheet: GC.Spread.Sheets.Worksheet, dataRowIndex: number, dataColIndex: number, tableHeaderRowIndex: number) => {
        const name = sheet.getCell(tableHeaderRowIndex, dataColIndex).value() as string;
        const value = sheet.getCell(dataRowIndex, dataColIndex).value() as unknown;
        return { name, value };
    };

    private adjustTableSizeAndInsertData(table: GC.Spread.Sheets.Tables.Table, sheet: GC.Spread.Sheets.Worksheet, data: Dictionary<unknown>[]) {
        const {
            tableRowStartingIndex,
            tableColumnStartingIndex,
            tableColumnsCount,
            dataRowStartingIndex,
            dataRowsCount,
        } = this.getPredictedTableCoordinatesForInputData(table, data);

        sheet.suspendPaint(); // for optimization purpose
        sheet.setRowCount(dataRowStartingIndex + dataRowsCount); // sets the right number of rows in the sheet (table index position in sheet + data count)

        const newTableRange = new GC.Spread.Sheets.Range(tableRowStartingIndex, tableColumnStartingIndex, dataRowsCount, tableColumnsCount);
        sheet.tables.resize(table, newTableRange); // set new table range based on new coordinates

        sheet.setArray(dataRowStartingIndex, tableColumnStartingIndex, this.dataWithoutColumnNames(data)); // insert data starting from first row after table header
        sheet.resumePaint();
    }

    private getPredictedTableCoordinatesForInputData(table: GC.Spread.Sheets.Tables.Table, data: Dictionary<unknown>[]) {
        const coordinates = this.getResultTableCoordinates(table);
        const dataRowsCount = coordinates.dataRowStartingIndex + data.length; // overall data rows number based on table position
        return {
            ...coordinates,
            dataRowsCount,
        };
    }

    private getResultTableCoordinates(table: GC.Spread.Sheets.Tables.Table) {
        const { row: tableRowStartingIndex, col: tableColumnStartingIndex, colCount: tableColumnsCount, rowCount: tableRowsCount } = table.range();
        const dataRowStartingIndex = tableRowStartingIndex + 1; // index of first data row (after header row)

        return {
            tableRowStartingIndex,
            tableColumnStartingIndex,
            tableColumnsCount,
            dataRowStartingIndex,
            tableRowsCount,
        };
    }

    private dataWithoutColumnNames(data: Dictionary<unknown>[]) {
        return data.map((value) => Object.values(value));
    }

    private findSheetByTable(tableName: string) {
        return this.workbook.sheets.find((sheet) => !!sheet.tables.findByName(tableName));
    }

    private findTableByName(name: string) {
        const sheet = this.findSheetByTable(name);
        return sheet?.tables.findByName(name);
    }
}
