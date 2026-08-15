import { apiClient } from "./client";
import type { Address, AddressInput } from "../../types/Address";

export async function getAddresses(customerEmailId: string): Promise<Address[]> {
  const { data } = await apiClient.get<Address[]>(`/customers/customer/${encodeURIComponent(customerEmailId)}/addresses`);
  return data;
}

export async function addAddress(customerEmailId: string, address: AddressInput): Promise<Address> {
  const { data } = await apiClient.post<Address>(`/customers/customer/${encodeURIComponent(customerEmailId)}/addresses`, address);
  return data;
}

export async function updateAddress(customerEmailId: string, addressId: number, address: AddressInput): Promise<Address> {
  const { data } = await apiClient.put<Address>(
    `/customers/customer/${encodeURIComponent(customerEmailId)}/addresses/${addressId}`,
    address
  );
  return data;
}

export async function deleteAddress(customerEmailId: string, addressId: number): Promise<void> {
  await apiClient.delete(`/customers/customer/${encodeURIComponent(customerEmailId)}/addresses/${addressId}`);
}

export async function setDefaultAddress(customerEmailId: string, addressId: number): Promise<Address> {
  const { data } = await apiClient.patch<Address>(
    `/customers/customer/${encodeURIComponent(customerEmailId)}/addresses/${addressId}/default`
  );
  return data;
}
