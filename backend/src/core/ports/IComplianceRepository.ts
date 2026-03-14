import { ShipCompliance, ComplianceSnapshot } from '../domain/Compliance';

export interface IComplianceRepository {
  findByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null>;
  upsert(compliance: Omit<ShipCompliance, 'id' | 'createdAt'>): Promise<ShipCompliance>;
  computeSnapshot(shipId: string, year: number): Promise<ComplianceSnapshot>;
  getAdjustedCb(shipId: string, year: number): Promise<number>;
}
