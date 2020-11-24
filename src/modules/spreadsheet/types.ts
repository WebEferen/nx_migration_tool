import { Dictionary } from 'lodash';

export type DataRow = {
    name: string;
    data: Dictionary<unknown>[];
};

export type DataTable = Array<DataRow>;
