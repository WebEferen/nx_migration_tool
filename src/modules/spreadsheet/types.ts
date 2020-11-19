import { Dictionary, NumericDictionary } from 'lodash';

export type InputDataRow = {
    name: string;
    data: Dictionary<unknown>[];
};

export type FlatDataRow = {
    name: string;
    data: NumericDictionary<unknown>[];
};

export type DataTable<T> = Array<T>;
