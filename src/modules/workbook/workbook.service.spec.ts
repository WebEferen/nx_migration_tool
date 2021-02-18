/**
 * @jest-environment jsdom
 */
import { Test, TestingModule } from '@nestjs/testing';
import { WorkbookModule } from './workbook.module';
import { WorkbookService } from './workbook.service';

describe('WorkbookService', () => {
    let provider: WorkbookService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [WorkbookModule],
        }).compile();

        provider = module.get<WorkbookService>(WorkbookService);
    });

    it('should be defined', () => {
        expect(provider).toBeDefined();
    });

    // TODO create unit tests for WorkbookService
});
