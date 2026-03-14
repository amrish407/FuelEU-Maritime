import { BankEntry, BankingResult, BankSurplusInput, ApplyBankedInput } from '../domain/Banking';

export interface IBankingRepository {
  findRecords(shipId: string, year: number): Promise<BankEntry[]>;
  getTotalBanked(shipId: string, year: number): Promise<number>;
  bankSurplus(input: BankSurplusInput): Promise<BankingResult>;
  applyBanked(input: ApplyBankedInput): Promise<BankingResult>;
}
