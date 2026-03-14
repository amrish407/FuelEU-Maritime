// Banking domain entity — FuelEU Article 20

export interface BankEntry {
  id: string;
  shipId: string;
  year: number;
  amountGco2eq: number;   // positive = banked surplus
  createdAt: Date;
}

export interface BankingResult {
  cbBefore: number;
  applied: number;
  cbAfter: number;
  bankEntryId: string;
}

export interface BankSurplusInput {
  shipId: string;
  year: number;
  amount: number;
}

export interface ApplyBankedInput {
  shipId: string;
  year: number;
  amount: number;
}

export function validateBankSurplus(cb: number): void {
  if (cb <= 0) {
    throw new Error('Cannot bank: Compliance Balance is zero or negative (no surplus).');
  }
}

export function validateApplyBanked(
  amountToApply: number,
  availableBanked: number
): void {
  if (amountToApply <= 0) {
    throw new Error('Amount to apply must be positive.');
  }
  if (amountToApply > availableBanked) {
    throw new Error(
      `Cannot apply ${amountToApply}: only ${availableBanked} banked surplus available.`
    );
  }
}
