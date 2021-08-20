import { Dictionary } from 'lodash';

export type GroupedData = {
    group: string;
    inputs: DataRow[];
};

export type DataRow = {
    name: string;
    data: Dictionary<unknown>[];
};

export type DataHeader = {
    name: string;
    fields: string[];
};

export type DataTable = Array<DataRow>;
