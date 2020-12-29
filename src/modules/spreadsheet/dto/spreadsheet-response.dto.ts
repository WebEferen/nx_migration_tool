import { ApiProperty } from '@nestjs/swagger';
import { Dictionary } from 'lodash';

export class SpreadsheetResponseDto {
    @ApiProperty()
    data: Dictionary<string>[];
}
