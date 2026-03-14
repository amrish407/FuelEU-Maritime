import { BankEntry, BankingResult, validateBankSurplus, validateApplyBanked } from '../domain/Banking';
import { IBankingRepository } from '../ports/IBankingRepository';
import { IComplianceRepository } from '../ports/IComplianceRepository';

export class BankingUseCases {
  constructor(
    private readonly bankingRepo: IBankingRepository,
    private readonly complianceRepo: IComplianceRepository
  ) {}

  async getRecords(shipId: string, year: number): Promise<BankEntry[]> {
    return this.bankingRepo.findRecords(shipId, year);
  }

  async bankSurplus(shipId: string, year: number, amount: number): Promise<BankingResult> {
    const snapshot = await this.complianceRepo.computeSnapshot(shipId, year);
    validateBankSurplus(snapshot.cb);

    if (amount > snapshot.cb) {
      throw new Error(`Cannot bank ${amount}: only ${snapshot.cb} surplus available.`);
    }

    return this.bankingRepo.bankSurplus({ shipId, year, amount });
  }

  async applyBanked(shipId: string, year: number, amount: number): Promise<BankingResult> {
    const available = await this.bankingRepo.getTotalBanked(shipId, year);
    validateApplyBanked(amount, available);

    return this.bankingRepo.applyBanked({ shipId, year, amount });
  }
}
