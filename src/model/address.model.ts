export class CreateAddressRequest {
  address?: string;
  city?: string;
  province?: string;
  contactId: string;
  country: string;
  postalCode: string;
}

export class GetAddressByIdParams {
  contactId: string;
  addressId: string;
}

export class UpdateAddressRequest extends CreateAddressRequest {
  id: string;
}

export class AddressResponse {
  id: string;
  address?: string;
  city?: string;
  province?: string;
  country: string;
  postalCode: string;
}
