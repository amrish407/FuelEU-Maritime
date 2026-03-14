import { validateBankSurplus, validateApplyBanked } from '../../core/domain/Banking';

describe('Banking Domain - validateBankSurplus', () => {
  it('throws when CB is zero', () => {
    expect(() => validateBankSurplus(0)).toThrow('no surplus');
  });

  it('throws when CB is negative', () => {
    expect(() => validateBankSurplus(-100)).toThrow('no surplus');
  });

  it('does not throw when CB is positive', () => {
    expect(() => validateBankSurplus(500)).not.toThrow();
  });
});

describe('Banking Domain - validateApplyBanked', () => {
  it('throws when amount is zero', () => {
    expect(() => validateApplyBanked(0, 1000)).toThrow('positive');
  });

  it('throws when amount is negative', () => {
    expect(() => validateApplyBanked(-100, 1000)).toThrow('positive');
  });

  it('throws when amount exceeds available banked', () => {
    expect(() => validateApplyBanked(1500, 1000)).toThrow('1500');
  });

  it('does not throw when amount equals available', () => {
    expect(() => validateApplyBanked(1000, 1000)).not.toThrow();
  });

  it('does not throw when amount is less than available', () => {
    expect(() => validateApplyBanked(500, 1000)).not.toThrow();
  });
});
