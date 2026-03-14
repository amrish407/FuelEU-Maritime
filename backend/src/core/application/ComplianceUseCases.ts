import { ComplianceSnapshot } from '../domain/Compliance';
import { IComplianceRepository } from '../ports/IComplianceRepository';

export class ComplianceUseCases {
  constructor(private readonly complianceRepo: IComplianceRepository) {}

  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceSnapshot> {
    if (!shipId) throw new Error('shipId is required');
    if (!year || year < 2024) throw new Error('Valid year is required (>=2024)');

    return this.complianceRepo.computeSnapshot(shipId, year);
  }

  async getAdjustedCb(shipId: string, year: number): Promise<{
    shipId: string;
    year: number;
    adjustedCb: number;
  }> {
    const adjustedCb = await this.complianceRepo.getAdjustedCb(shipId, year);
    return { shipId, year, adjustedCb };
  }
}
