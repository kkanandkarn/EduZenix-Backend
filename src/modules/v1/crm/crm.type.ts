import { InstitutionLocation } from "../../../generated/prisma/enums";
export interface BulkAddUniversityBody {
  universities: AddUniversityBody[];
}
export interface AddUniversityBody {
  aisheCode: string;
  name: string;
  state: string;
  district: string;
  website: string;
  yearOfEstablishment: number;
  location: InstitutionLocation;
  pocName: string | null;
  pocEmail: string | null;
  pocContact: string;
  address: string;
}
