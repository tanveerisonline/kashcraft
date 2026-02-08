import React from "react";
import { Modal } from "../../ui/modal"; // Assuming Modal component exists
import { Button } from "../../ui/button"; // Assuming Button component exists

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, children }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Your Cart">
      <div className="flex h-full flex-col">
        <div className="flex-grow overflow-y-auto p-4">{children}</div>
        <div className="border-t border-gray-200 p-4">
          <Button onClick={onClose} className="w-full">
            Continue Shopping
          </Button>
          {/* Add a checkout button here later */}
        </div>
      </div>
    </Modal>
  );
};

export { CartDrawer };
