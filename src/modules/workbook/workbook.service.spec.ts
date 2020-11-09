import { Test, TestingModule } from '@nestjs/testing';
import { WorkbookService } from './workbook.service';

describe('WorkbookService', () => {
    let provider: WorkbookService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [WorkbookService],
        }).compile();

        provider = module.get<WorkbookService>(WorkbookService);
    });

    it('should be defined', () => {
        expect(provider).toBeDefined();
    });
});
