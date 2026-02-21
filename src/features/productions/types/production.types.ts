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
  obsConnection?: {
    url: string;
    password?: string;
    isEnabled: boolean;
  };
  vmixConnection?: {
    url: string;
    isEnabled: boolean;
  };
  users?: Array<{
    userId: string;
    productionId: string;
    roleId: string;
    user: { id: string; name: string; email: string };
    role: { id: string; name: string };
  }>;
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
  obsConfig?: {
    url?: string;
    password?: string;
    isEnabled?: boolean;
  };
  vmixConfig?: {
    url?: string;
    isEnabled?: boolean;
  };
}

export interface ProductionListResponse extends PaginatedResponse<Production> { }
