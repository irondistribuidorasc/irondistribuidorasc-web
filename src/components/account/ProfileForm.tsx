"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userProfileSchema, type UserProfileSchema } from "@/src/lib/schemas/user";
import { Button, Input, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ProfileForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserProfileSchema>({
    resolver: zodResolver(userProfileSchema),
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/user");
        const user = response.data;
        
        setValue("name", user.name || "");
        setValue("email", user.email || "");
        setValue("phone", user.phone || "");
        setValue("docNumber", user.docNumber || "");
        setValue("addressLine1", user.addressLine1 || "");
        setValue("addressLine2", user.addressLine2 || "");
        setValue("city", user.city || "");
        setValue("state", user.state || "");
        setValue("postalCode", user.postalCode || "");
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Erro ao carregar dados do usuário");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [setValue]);

  const onSubmit = async (data: UserProfileSchema) => {
    setIsSaving(true);
    try {
      await axios.patch("/api/user", data);
      toast.success("Perfil atualizado com sucesso!");
      router.refresh();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-col gap-1 px-6 pt-6">
        <h1 className="text-2xl font-bold">Minha Conta</h1>
        <p className="text-small text-default-500">
          Gerencie suas informações pessoais e de endereço.
        </p>
      </CardHeader>
      <Divider />
      <CardBody className="px-6 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Dados Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome Completo"
                placeholder="Seu nome"
                variant="bordered"
                {...register("name")}
                isInvalid={!!errors.name}
                errorMessage={errors.name?.message}
              />
              <Input
                label="Email"
                placeholder="seu@email.com"
                variant="bordered"
                isReadOnly
                className="opacity-70"
                {...register("email")}
                description="O email não pode ser alterado."
              />
              <Input
                label="Telefone"
                placeholder="(00) 00000-0000"
                variant="bordered"
                {...register("phone")}
                isInvalid={!!errors.phone}
                errorMessage={errors.phone?.message}
              />
              <Input
                label="CPF / CNPJ"
                placeholder="000.000.000-00"
                variant="bordered"
                {...register("docNumber")}
                isInvalid={!!errors.docNumber}
                errorMessage={errors.docNumber?.message}
              />
            </div>
          </div>

          <Divider />

          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Endereço</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="CEP"
                placeholder="00000-000"
                variant="bordered"
                {...register("postalCode")}
                isInvalid={!!errors.postalCode}
                errorMessage={errors.postalCode?.message}
              />
              <div className="hidden md:block"></div> {/* Spacer */}
              
              <Input
                label="Endereço"
                placeholder="Rua, Avenida..."
                variant="bordered"
                className="md:col-span-2"
                {...register("addressLine1")}
                isInvalid={!!errors.addressLine1}
                errorMessage={errors.addressLine1?.message}
              />
              <Input
                label="Complemento / Número"
                placeholder="Apto 101, Casa..."
                variant="bordered"
                {...register("addressLine2")}
                isInvalid={!!errors.addressLine2}
                errorMessage={errors.addressLine2?.message}
              />
              <Input
                label="Cidade"
                placeholder="Sua cidade"
                variant="bordered"
                {...register("city")}
                isInvalid={!!errors.city}
                errorMessage={errors.city?.message}
              />
              <Input
                label="Estado (UF)"
                placeholder="SC"
                variant="bordered"
                {...register("state")}
                isInvalid={!!errors.state}
                errorMessage={errors.state?.message}
                maxLength={2}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button 
              color="primary" 
              type="submit" 
              isLoading={isSaving}
              className="font-semibold"
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
