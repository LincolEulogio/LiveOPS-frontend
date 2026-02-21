import { PaginatedResponse } from '@/shared/types/api.types';

export enum EngineType {
  OBS = 'OBS',
  VMIX = 'VMIX',
}

export enum ProductionStatus {
  SETUP = 'SETUP',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DRAFT = 'DRAFT',
}

export interface Production {
  id: string;
  name: string;
  description: string | null;
  status: ProductionStatus;
  engineType: EngineType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductionDto {
  name: string;
  description?: string;
  engineType: EngineType;
  status?: ProductionStatus;
}

export interface UpdateProductionDto {
  name?: string;
  description?: string;
  status?: ProductionStatus;
  engineType?: EngineType;
}

export interface ProductionListResponse extends PaginatedResponse<Production> { }
