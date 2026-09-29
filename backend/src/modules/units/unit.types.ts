export interface CreateUnitInput {
  name: string;
  shortName: string;
}

export interface UpdateUnitInput {
  name?: string;
  shortName?: string;
  status?: "ACTIVE" | "INACTIVE";
}
