// Pooling domain entity — FuelEU Article 21

export interface Pool {
  id: string;
  year: number;
  createdAt: Date;
}

export interface PoolMember {
  poolId: string;
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface PoolWithMembers extends Pool {
  members: PoolMember[];
  poolSum: number;
}

export interface CreatePoolInput {
  year: number;
  memberShipIds: string[];
}

export interface PoolAllocationResult {
  poolId: string;
  year: number;
  members: Array<{
    shipId: string;
    cbBefore: number;
    cbAfter: number;
  }>;
  poolSum: number;
}

/**
 * Greedy allocation algorithm:
 * Sort members desc by CB, transfer surplus from positive to negative ships.
 * Rules:
 * - Sum(adjustedCB) >= 0
 * - Deficit ship cannot exit worse
 * - Surplus ship cannot exit negative
 */
export function allocatePool(
  members: Array<{ shipId: string; cb: number }>
): Array<{ shipId: string; cbBefore: number; cbAfter: number }> {
  const total = members.reduce((sum, m) => sum + m.cb, 0);
  if (total < 0) {
    throw new Error('Pool is invalid: sum of adjusted CBs must be >= 0.');
  }

  // Sort descending by CB (surplus first)
  const sorted = [...members].sort((a, b) => b.cb - a.cb);

  const result = sorted.map(m => ({ shipId: m.shipId, cbBefore: m.cb, cbAfter: m.cb }));

  // Greedy transfer: surplus ships donate to deficit ships
  let surplusIdx = 0;
  let deficitIdx = result.length - 1;

  while (surplusIdx < deficitIdx) {
    const surplus = result[surplusIdx];
    const deficit = result[deficitIdx];

    if (surplus.cbAfter <= 0 || deficit.cbAfter >= 0) {
      if (surplus.cbAfter <= 0) surplusIdx++;
      if (deficit.cbAfter >= 0) deficitIdx--;
      continue;
    }

    const transferable = Math.min(surplus.cbAfter, Math.abs(deficit.cbAfter));
    surplus.cbAfter -= transferable;
    deficit.cbAfter += transferable;

    if (surplus.cbAfter === 0) surplusIdx++;
    if (deficit.cbAfter === 0) deficitIdx--;
  }

  // Validate rules
  for (const m of result) {
    if (m.cbAfter < m.cbBefore && m.cbBefore < 0) {
      throw new Error(`Deficit ship ${m.shipId} would exit worse — invalid pool.`);
    }
    if (m.cbBefore > 0 && m.cbAfter < 0) {
      throw new Error(`Surplus ship ${m.shipId} would exit negative — invalid pool.`);
    }
  }

  return result;
}
