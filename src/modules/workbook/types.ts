import GC from '@grapecity/spread-sheets';

export type Workbook = GC.Spread.Sheets.Workbook;

export interface ITableCoordinates {
    tableRowStartingIndex: number; // row from Table.range()
    tableColumnStartingIndex: number; // col from Table.range()
    tableColumnsCount: number; // colCount from Table.range()
    dataRowStartingIndex: number; // row + 1 from Table.range()
    tableRowsCount: number; // rowCount from Table.range()
    dataRowsCount?: number; // row + data.length from Table.range()
}
