export interface Address {
  addressId: number;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  landmark: string | null;
  isDefault: boolean;
  latitude: number | null;
  longitude: number | null;
}

export type AddressInput = Omit<Address, "addressId" | "isDefault" | "latitude" | "longitude"> & {
  isDefault?: boolean;
  latitude?: number | null;
  longitude?: number | null;
};
