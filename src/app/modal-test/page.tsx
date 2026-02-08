"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/modal/modal";
import ConfirmDialog from "@/components/ui/modal/confirm-dialog";
import AlertDialog from "@/components/ui/modal/alert-dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/modal/drawer";
import { Card } from "@/components/ui/card";

const TestModalSystemPage: React.FC = () => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = () => {
    setIsConfirming(true);
    setTimeout(() => {
      alert("Action confirmed!");
      setIsConfirming(false);
      setIsConfirmOpen(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Modal System Test Page</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Base Modal (Dialog)</h2>
        <Card className="p-6 flex justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="name" className="text-right">
                    Name
                  </label>
                  <input id="name" value="Pedro Duarte" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="username" className="text-right">
                    Username
                  </label>
                  <input id="username" value="@peduarte" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Confirm Dialog</h2>
        <Card className="p-6 flex justify-center">
          <Button onClick={() => setIsConfirmOpen(true)} variant="destructive">
            Delete Item
          </Button>
          <ConfirmDialog
            open={isConfirmOpen}
            onOpenChange={setIsConfirmOpen}
            title="Are you absolutely sure?"
            description="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
            onConfirm={handleConfirm}
            confirmText="Yes, delete account"
            isConfirming={isConfirming}
          />
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Alert Dialog</h2>
        <Card className="p-6 flex justify-center">
          <Button onClick={() => setIsAlertOpen(true)}>Show Alert</Button>
          <AlertDialog
            open={isAlertOpen}
            onOpenChange={setIsAlertOpen}
            title="Important Notice"
            description="Your session is about to expire. Please save your work."
            confirmText="Got it!"
          />
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Drawer</h2>
        <Card className="p-6 flex justify-center">
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline">Open Drawer</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Edit Profile</DrawerTitle>
                <DrawerDescription>
                  Make changes to your profile here. Click save when you're done.
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4 pb-0">
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="name" className="text-right">
                      Name
                    </label>
                    <input id="name" value="Pedro Duarte" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="username" className="text-right">
                      Username
                    </label>
                    <input id="username" value="@peduarte" className="col-span-3" />
                  </div>
                </div>
              </div>
              <DrawerFooter>
                <Button>Submit</Button>
                <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
                  Cancel
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </Card>
      </section>
    </div>
  );
};

export default TestModalSystemPage;
