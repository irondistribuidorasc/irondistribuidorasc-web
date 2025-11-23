import { ProfileForm } from "@/src/components/account/ProfileForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minha Conta | Iron Distribuidora",
  description: "Gerencie suas informações pessoais e de endereço.",
};

export default function MyAccountPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileForm />
    </div>
  );
}
