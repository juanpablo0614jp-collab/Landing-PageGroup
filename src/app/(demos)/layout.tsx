"use client";

import { DemoStoreProvider } from "@/context/DemoStore";
import { FormStoreProvider } from "@/lib/formStorage";

export default function DemoGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoStoreProvider>
      <FormStoreProvider>
        {children}
      </FormStoreProvider>
    </DemoStoreProvider>
  );
}
