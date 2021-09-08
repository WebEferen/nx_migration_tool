import { DataException, WorkbookException } from '@exceptions';
import GC from '@grapecity/spread-sheets';
import { CommonConfigService } from '@modules/config';
import { DataHeader, DataTable } from '@modules/spreadsheet/types';
import { Injectable, Scope } from '@nestjs/common';
import { Dictionary, differenceWith, isArray, isEqual, range } from 'lodash';
import { ITableCoordinates, Workbook } from './types';

export const RESULT_TABLE = '_RESULT';
export const FALLBACK_TABLE = '_INPUT';

@Injectable({ scope: Scope.REQUEST })
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
            throw new WorkbookException('Invalid Workbook Calculation licence');
        }
    }

    public importData(inputData: DataTable) {
        return inputData.reduce((acc, { name, data }) => {
            if (!isArray(data)) {
                throw new DataException(`Input data for table '${name}' is not an array, ${typeof data} was passed instead.`);
            }

            const sheet = this.findSheetByTable(name);
            const table = this.findTableByName(name);
            if (!table || !sheet) {
                // Don't throw an error if input data is empty, just return current results
                if (data.length === 0) {
                    return acc;
                }

                throw new DataException(`Table '${name}' doesn't exist in workbook`);
            }

            const tableCoordinates = this.getPredictedTableCoordinatesForInputData(table, data.length);

            // get field names from data source
            const dataFields = data.length > 0 ? Object.keys(data[0]) : [];
            // get field names from workbook table
            const workbookFields = this.getTableColumns(sheet, tableCoordinates);

            this.validateTableFields(name, dataFields, workbookFields);

            const processedData = this.getProcessedData(data, workbookFields);

            sheet.suspendPaint(); // for optimization purpose
            this.resizeTable(sheet, table, tableCoordinates);
            this.setFormattersAndFormulas(sheet, tableCoordinates);
            this.insertData(sheet, processedData, tableCoordinates);
            sheet.resumePaint();

            // return name of data source and field names
            return [...acc, { name, fields: workbookFields }];
        }, [] as DataHeader[]);
    }

    /**
     * Set new table range and data rows count based on new coordinates
     */
    private resizeTable(sheet: GC.Spread.Sheets.Worksheet, table: GC.Spread.Sheets.Tables.Table, tableCoordinates: ITableCoordinates) {
        const { tableRowStartingIndex, tableColumnStartingIndex, dataRowsCount, tableColumnsCount, dataRowStartingIndex } = tableCoordinates;
        const newTableRange = new GC.Spread.Sheets.Range(tableRowStartingIndex, tableColumnStartingIndex, dataRowsCount, tableColumnsCount);

        sheet.setRowCount(dataRowStartingIndex + dataRowsCount); // Important: needs to be set before resize(); It sets the right number of rows in the sheet (table index position in sheet + data count)
        sheet.tables.resize(table, newTableRange);
    }

    public getCalculatedResults(dataHeaders: DataHeader[]) {
        const { tableName, sheet } = this.findResultSheet();

        const table = sheet.tables.findByName(tableName);
        const { tableRowStartingIndex, tableColumnsCount, dataRowStartingIndex, tableRowsCount } = this.getResultTableCoordinates(table);

        // Filter only rows which has some non-empty values
        const isNotEmptyRow = (row: { name: string; value: string }[]) => row.some(({ value }) => value !== '' && value !== '#N/A');

        // get column names from _INPUT data source
        const dataFields = dataHeaders.find((data) => data.name === FALLBACK_TABLE).fields;
        // get column names from workbook table
        const workbookFields = this.getTableColumns(sheet, { tableRowStartingIndex, tableColumnsCount });

        this.validateTableFields(RESULT_TABLE, dataFields, workbookFields);

        // Fill all table rows and columns based on table coordinates using range(rows) and range(cols)
        const data = range(dataRowStartingIndex, tableRowsCount)
            .map((rowIndex) => range(tableColumnsCount).map((columnIndex) => this.getCellData(sheet, rowIndex, columnIndex, tableRowStartingIndex)))
            .filter((row) => isNotEmptyRow(row))
            .map((row) => row.reduce<Dictionary<string>>((acc, { name, value }) => ({ ...acc, [name]: value }), {}));

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
            throw new DataException(`Couldn't find result tables '${RESULT_TABLE}' and '${FALLBACK_TABLE}' in provided workbook`);
        }

        return resultSheet;
    }

    private getCellData = (sheet: GC.Spread.Sheets.Worksheet, dataRowIndex: number, dataColIndex: number, tableHeaderRowIndex: number) => {
        const name = sheet.getValue(tableHeaderRowIndex, dataColIndex)?.toString() ?? ''; // get column name
        const value = sheet.getText(dataRowIndex, dataColIndex);
        return { name, value };
    };

    private insertData(sheet: GC.Spread.Sheets.Worksheet, data: unknown[][], tableCoordinates: ITableCoordinates) {
        const { tableColumnStartingIndex, dataRowStartingIndex } = tableCoordinates;
        sheet.setArray(dataRowStartingIndex, tableColumnStartingIndex, data); // insert data starting from first row after table header
    }

    /**
     * Set formatters and formulas for all table rows and columns based on table coordinates using range(rows) and range(cols)
     */
    private setFormattersAndFormulas(sheet: GC.Spread.Sheets.Worksheet, tableCoordinates: ITableCoordinates) {
        const sheetArea = GC.Spread.Sheets.SheetArea.viewport;
        const { tableColumnsCount, tableColumnStartingIndex, dataRowStartingIndex, dataRowsCount } = tableCoordinates;
        const cellFormatters = range(tableColumnStartingIndex, tableColumnsCount).map((columnIndex) =>
            sheet.getFormatter(dataRowStartingIndex, columnIndex, sheetArea),
        );
        const mainFormulas = range(tableColumnStartingIndex, tableColumnsCount).map((columnIndex) =>
            sheet.getFormula(dataRowStartingIndex, columnIndex, sheetArea),
        );

        range(dataRowStartingIndex, dataRowsCount).forEach((rowIndex) =>
            range(tableColumnStartingIndex, tableColumnsCount).forEach((columnIndex) => {
                const cellFormatter = cellFormatters[columnIndex - tableColumnStartingIndex];
                const mainFormula = mainFormulas[columnIndex - tableColumnStartingIndex];
                let cellFormula = sheet.getFormula(rowIndex, columnIndex, sheetArea);

                if (cellFormula !== mainFormula) {
                    // TODO report a warning about the inconsistent cell formulas within one column and send it back with the response
                    cellFormula = cellFormula ?? mainFormula; // if cell formula is empty than get the formula from the first row
                }
                sheet.setFormula(rowIndex, columnIndex, cellFormula, sheetArea);
                sheet.setFormatter(rowIndex, columnIndex, cellFormatter, sheetArea);
            }),
        );
    }

    private getPredictedTableCoordinatesForInputData(table: GC.Spread.Sheets.Tables.Table, dataSize: number) {
        const coordinates = this.getResultTableCoordinates(table);
        const dataRowsCount = coordinates.dataRowStartingIndex + dataSize; // overall data rows number based on table position

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

    private getProcessedData(data: Dictionary<unknown>[], columns: string[]) {
        return data.map((value) => columns.map((name) => value[name]));
    }

    private findSheetByTable(tableName: string) {
        return this.workbook.sheets.find((sheet) => !!sheet.tables.findByName(tableName));
    }

    private findTableByName(name: string) {
        const sheet = this.findSheetByTable(name);
        return sheet?.tables.findByName(name);
    }

    private getTableColumns(sheet: GC.Spread.Sheets.Worksheet, { tableRowStartingIndex, tableColumnsCount }: Partial<ITableCoordinates>) {
        return range(tableColumnsCount).map((columnIndex) => sheet.getValue(tableRowStartingIndex, columnIndex)?.toString() ?? '');
    }

    private validateTableFields(name: string, dataFields: string[], workbookFields: string[]) {
        const fieldsNotInWorkbook = differenceWith(dataFields, workbookFields, isEqual);
        const fieldsNotInData = differenceWith(workbookFields, dataFields, isEqual);
        const isDataColumnListInvalid = dataFields.length && fieldsNotInData.length > 0; // without data fields the validation is not needed
        const isWorkbookColumnListInvalid = fieldsNotInWorkbook.length > 0;

        if (isWorkbookColumnListInvalid || isDataColumnListInvalid) {
            const desc = [
                isWorkbookColumnListInvalid ? ` Fields ['${fieldsNotInWorkbook.join(`', '`)}'] don't exist in workbook.` : '',
                isDataColumnListInvalid ? ` Fields ['${fieldsNotInData.join(`', '`)}'] don't exist in data source.` : '',
            ].join('');

            throw new DataException(`Fields in table '${name}' don't match.${desc}`);
        }
    }
}
