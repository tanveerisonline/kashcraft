import React from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../ui/card';

interface Address {
  id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressBookProps {
  addresses: Address[];
  onAddAddress: () => void;
  onEditAddress: (addressId: string) => void;
  onSetDefault: (addressId: string) => void;
  onRemoveAddress: (addressId: string) => void;
}

const AddressBook: React.FC<AddressBookProps> = ({
  addresses,
  onAddAddress,
  onEditAddress,
  onSetDefault,
  onRemoveAddress,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Addresses</h2>
        <Button onClick={onAddAddress}>Add New Address</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addresses.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">No addresses found. Please add one.</p>
        ) : (
          addresses.map((address) => (
            <Card key={address.id} className={address.isDefault ? 'border-blue-500 ring-2 ring-blue-500' : ''}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {address.fullName}
                  {address.isDefault && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Default</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>{address.city}, {address.state} {address.zipCode}</p>
                <p>{address.country}</p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                {!address.isDefault && (
                  <Button variant="outline" size="sm" onClick={() => onSetDefault(address.id)}>
                    Set as Default
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => onEditAddress(address.id)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onRemoveAddress(address.id)}>
                  Remove
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AddressBook;
