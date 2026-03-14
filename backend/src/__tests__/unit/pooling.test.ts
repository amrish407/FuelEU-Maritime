import { allocatePool } from '../../core/domain/Pooling';

describe('Pooling Domain - allocatePool', () => {
  it('throws when sum of CBs is negative', () => {
    const members = [
      { shipId: 'R001', cb: -500 },
      { shipId: 'R002', cb: -100 },
    ];
    expect(() => allocatePool(members)).toThrow('Pool is invalid');
  });

  it('handles all-surplus pool correctly', () => {
    const members = [
      { shipId: 'R001', cb: 1000 },
      { shipId: 'R002', cb: 2000 },
    ];
    const result = allocatePool(members);
    expect(result.every(m => m.cbAfter >= 0)).toBe(true);
  });

  it('transfers surplus to deficit correctly', () => {
    const members = [
      { shipId: 'S1', cb: 1000 },
      { shipId: 'S2', cb: -500 },
    ];
    const result = allocatePool(members);
    const deficit = result.find(m => m.shipId === 'S2');
    expect(deficit?.cbAfter).toBe(0);
  });

  it('does not make deficit ships exit worse', () => {
    const members = [
      { shipId: 'S1', cb: 1300 },
      { shipId: 'S2', cb: -1000 },
    ];
    const result = allocatePool(members);
    const deficitShip = result.find(m => m.shipId === 'S2')!;
    expect(deficitShip.cbAfter).toBeGreaterThanOrEqual(deficitShip.cbBefore);
  });

  it('does not make surplus ships exit negative', () => {
    const members = [
      { shipId: 'S1', cb: 500 },
      { shipId: 'S2', cb: 200 },
      { shipId: 'S3', cb: -100 },
    ];
    const result = allocatePool(members);
    result.filter(m => m.cbBefore > 0).forEach(m => {
      expect(m.cbAfter).toBeGreaterThanOrEqual(0);
    });
  });

  it('pool sum is conserved after allocation', () => {
    const members = [
      { shipId: 'S1', cb: 1000 },
      { shipId: 'S2', cb: -300 },
      { shipId: 'S3', cb: -200 },
    ];
    const result = allocatePool(members);
    const sumBefore = members.reduce((s, m) => s + m.cb, 0);
    const sumAfter = result.reduce((s, m) => s + m.cbAfter, 0);
    expect(Math.abs(sumAfter - sumBefore)).toBeLessThan(0.01);
  });

  it('returns correct cbBefore values', () => {
    const members = [
      { shipId: 'S1', cb: 800 },
      { shipId: 'S2', cb: -400 },
    ];
    const result = allocatePool(members);
    expect(result.find(m => m.shipId === 'S1')?.cbBefore).toBe(800);
    expect(result.find(m => m.shipId === 'S2')?.cbBefore).toBe(-400);
  });
});
