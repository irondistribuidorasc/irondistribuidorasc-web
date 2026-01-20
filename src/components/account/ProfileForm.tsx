"use client";

import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Divider,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Spinner,
	Tab,
	Tabs,
	useDisclosure,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { maskCEP, maskCPFOrCNPJ, maskPhone } from "@/src/lib/masks";
import {
	type UserProfileSchema,
	userProfileSchema,
} from "@/src/lib/schemas/user";

export function ProfileForm() {
	const router = useRouter();
	const { update: updateSession } = useSession();
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deletePassword, setDeletePassword] = useState("");
	const [deleteConfirmation, setDeleteConfirmation] = useState("");
	const { isOpen, onOpen, onClose } = useDisclosure();

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<UserProfileSchema>({
		resolver: zodResolver(userProfileSchema),
	});

	// Watch field values for masks
	const phone = watch("phone") || "";
	const docNumber = watch("docNumber") || "";
	const postalCode = watch("postalCode") || "";
	const storePhone = watch("storePhone") || "";

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
				setValue("storeName", user.storeName || "");
				setValue("storePhone", user.storePhone || "");
				setValue("tradeLicense", user.tradeLicense || "");
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

			// Update session to reflect new data in cart
			await updateSession();

			router.refresh();
		} catch (error) {
			console.error("Error updating user:", error);
			toast.error("Erro ao atualizar perfil");
		} finally {
			setIsSaving(false);
		}
	};

	const handleExportData = async () => {
		setIsExporting(true);
		try {
			const response = await fetch("/api/account/export");
			if (!response.ok) {
				throw new Error("Erro ao exportar dados");
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `meus-dados-iron-${new Date().toISOString().split("T")[0]}.json`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			toast.success("Dados exportados com sucesso!");
		} catch (error) {
			console.error("Error exporting data:", error);
			toast.error("Erro ao exportar dados");
		} finally {
			setIsExporting(false);
		}
	};

	const handleDeleteAccount = async () => {
		if (deleteConfirmation !== "EXCLUIR MINHA CONTA") {
			toast.error("Digite 'EXCLUIR MINHA CONTA' para confirmar");
			return;
		}

		setIsDeleting(true);
		try {
			const response = await fetch("/api/account/delete", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					password: deletePassword,
					confirmation: deleteConfirmation,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Erro ao excluir conta");
			}

			toast.success("Conta excluída com sucesso");
			onClose();

			// Fazer logout e redirecionar
			await signOut({ callbackUrl: "/" });
		} catch (error) {
			console.error("Error deleting account:", error);
			toast.error(
				error instanceof Error ? error.message : "Erro ao excluir conta",
			);
		} finally {
			setIsDeleting(false);
		}
	};

	const resetDeleteModal = () => {
		setDeletePassword("");
		setDeleteConfirmation("");
		onClose();
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center p-8 min-h-[400px]">
				<Spinner size="lg" label="Carregando seus dados..." />
			</div>
		);
	}

	return (
		<Card className="w-full max-w-4xl mx-auto">
			<CardHeader className="flex flex-col gap-1 px-6 pt-6">
				<h1 className="text-2xl font-bold">Minha Conta</h1>
				<p className="text-small text-default-500">
					Gerencie suas informações pessoais, endereço e dados da loja.
				</p>
			</CardHeader>
			<Divider />
			<CardBody className="px-6 py-6">
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
					<Tabs
						aria-label="Seções do perfil"
						variant="underlined"
						classNames={{
							tabList:
								"gap-6 w-full relative rounded-none p-0 border-b border-divider",
							cursor: "w-full bg-primary",
							tab: "max-w-fit px-0 h-12",
							tabContent: "group-data-[selected=true]:text-primary",
						}}
					>
						<Tab
							key="personal"
							title={
								<div className="flex items-center space-x-2">
									<span>Dados Pessoais</span>
								</div>
							}
						>
							<div className="flex flex-col gap-4 py-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										label="Nome Completo"
										placeholder="Seu nome"
										variant="bordered"
										{...register("name")}
										isInvalid={!!errors.name}
										errorMessage={errors.name?.message}
										isRequired
										onKeyDown={(e) => {
											if (e.key === " ") {
												e.nativeEvent.stopPropagation();
											}
										}}
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
										label="Telefone Pessoal"
										placeholder="(00) 00000-0000"
										variant="bordered"
										value={phone}
										onValueChange={(value) => {
											const masked = maskPhone(value);
											setValue("phone", masked);
										}}
										isInvalid={!!errors.phone}
										errorMessage={errors.phone?.message}
										maxLength={16}
									/>
									<Input
										label="CPF / CNPJ"
										placeholder="000.000.000-00"
										variant="bordered"
										value={docNumber}
										onValueChange={(value) => {
											const masked = maskCPFOrCNPJ(value);
											setValue("docNumber", masked);
										}}
										isInvalid={!!errors.docNumber}
										errorMessage={errors.docNumber?.message}
										maxLength={18}
									/>
								</div>
							</div>
						</Tab>

						<Tab
							key="address"
							title={
								<div className="flex items-center space-x-2">
									<span>Endereço</span>
								</div>
							}
						>
							<div className="flex flex-col gap-4 py-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										label="CEP"
										placeholder="00000-000"
										variant="bordered"
										value={postalCode}
										onValueChange={(value) => {
											const masked = maskCEP(value);
											setValue("postalCode", masked);
										}}
										isInvalid={!!errors.postalCode}
										errorMessage={errors.postalCode?.message}
										maxLength={9}
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
										onKeyDown={(e) => {
											if (e.key === " ") {
												e.nativeEvent.stopPropagation();
											}
										}}
									/>
									<Input
										label="Complemento / Número"
										placeholder="Apto 101, Casa..."
										variant="bordered"
										{...register("addressLine2")}
										isInvalid={!!errors.addressLine2}
										errorMessage={errors.addressLine2?.message}
										onKeyDown={(e) => {
											if (e.key === " ") {
												e.nativeEvent.stopPropagation();
											}
										}}
									/>
									<Input
										label="Cidade"
										placeholder="Sua cidade"
										variant="bordered"
										{...register("city")}
										isInvalid={!!errors.city}
										errorMessage={errors.city?.message}
										onKeyDown={(e) => {
											if (e.key === " ") {
												e.nativeEvent.stopPropagation();
											}
										}}
									/>
									<Input
										label="Estado (UF)"
										placeholder="SC"
										variant="bordered"
										{...register("state")}
										isInvalid={!!errors.state}
										errorMessage={errors.state?.message}
										maxLength={2}
										style={{ textTransform: "uppercase" }}
									/>
								</div>
							</div>
						</Tab>

						<Tab
							key="store"
							title={
								<div className="flex items-center space-x-2">
									<span>Dados da Loja</span>
								</div>
							}
						>
							<div className="flex flex-col gap-4 py-4">
								<p className="text-sm text-default-500 mb-2">
									Preencha as informações da sua assistência técnica ou loja.
								</p>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										label="Nome da Assistência Técnica"
										placeholder="Ex: Tech Cell Assistência"
										variant="bordered"
										className="md:col-span-2"
										{...register("storeName")}
										isInvalid={!!errors.storeName}
										errorMessage={errors.storeName?.message}
										onKeyDown={(e) => {
											if (e.key === " ") {
												e.nativeEvent.stopPropagation();
											}
										}}
									/>
									<Input
										label="Telefone Comercial"
										placeholder="(00) 0000-0000"
										variant="bordered"
										value={storePhone}
										onValueChange={(value) => {
											const masked = maskPhone(value);
											setValue("storePhone", masked);
										}}
										isInvalid={!!errors.storePhone}
										errorMessage={errors.storePhone?.message}
										maxLength={16}
									/>
									<Input
										label="Inscrição Estadual / Municipal"
										placeholder="000.000.000.000"
										variant="bordered"
										{...register("tradeLicense")}
										isInvalid={!!errors.tradeLicense}
										errorMessage={errors.tradeLicense?.message}
										description="Opcional"
									/>
								</div>
							</div>
						</Tab>

						<Tab
							key="privacy"
							title={
								<div className="flex items-center space-x-2">
									<span>Privacidade</span>
								</div>
							}
						>
							<div className="flex flex-col gap-6 py-4">
								<div>
									<h3 className="text-lg font-semibold mb-2">
										Seus Direitos (LGPD)
									</h3>
									<p className="text-sm text-default-500 mb-4">
										De acordo com a Lei Geral de Proteção de Dados (LGPD), você
										tem direito de acessar, exportar e solicitar a exclusão dos
										seus dados pessoais.
									</p>
									<p className="text-sm text-default-500">
										Para mais informações, consulte nossa{" "}
										<Link
											href="/politica-de-privacidade"
											className="text-primary hover:underline"
										>
											Política de Privacidade
										</Link>
										.
									</p>
								</div>

								<Divider />

								<div className="flex flex-col gap-4">
									<div className="p-4 border border-default-200 rounded-lg">
										<h4 className="font-medium mb-2">Exportar Meus Dados</h4>
										<p className="text-sm text-default-500 mb-4">
											Faça o download de todos os seus dados pessoais em formato
											JSON. Isso inclui suas informações de perfil, histórico de
											pedidos e notificações.
										</p>
										<Button
											variant="bordered"
											onPress={handleExportData}
											isLoading={isExporting}
											className="font-medium"
										>
											{isExporting ? "Exportando..." : "Exportar Dados"}
										</Button>
									</div>

									<div className="p-4 border border-danger-200 rounded-lg bg-danger-50 dark:bg-danger-900/20">
										<h4 className="font-medium mb-2 text-danger">
											Excluir Minha Conta
										</h4>
										<p className="text-sm text-default-500 mb-4">
											<strong className="text-danger">Atenção:</strong> Esta
											ação é irreversível. Todos os seus dados, incluindo
											histórico de pedidos e informações pessoais, serão
											permanentemente excluídos.
										</p>
										<Button
											color="danger"
											variant="flat"
											onPress={onOpen}
											className="font-medium"
										>
											Excluir Conta
										</Button>
									</div>
								</div>
							</div>
						</Tab>
					</Tabs>

					<Divider />

					<div className="flex justify-end mt-2">
						<Button
							color="primary"
							type="submit"
							isLoading={isSaving}
							className="font-semibold"
							size="lg"
						>
							{isSaving ? "Salvando..." : "Salvar Alterações"}
						</Button>
					</div>
				</form>
			</CardBody>

			{/* Modal de Confirmação de Exclusão */}
			<Modal isOpen={isOpen} onClose={resetDeleteModal} size="lg">
				<ModalContent>
					<ModalHeader className="flex flex-col gap-1">
						<span className="text-danger">Excluir Conta Permanentemente</span>
					</ModalHeader>
					<ModalBody>
						<div className="flex flex-col gap-4">
							<div className="p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg border border-danger-200">
								<p className="text-sm font-medium text-danger mb-2">
									Esta ação não pode ser desfeita!
								</p>
								<ul className="text-sm text-default-600 list-disc list-inside space-y-1">
									<li>Seu perfil e informações pessoais serão excluídos</li>
									<li>Seu histórico de pedidos será removido</li>
									<li>Você perderá acesso à sua conta</li>
								</ul>
							</div>

							<Input
								type="password"
								label="Sua Senha"
								placeholder="Digite sua senha para confirmar"
								variant="bordered"
								value={deletePassword}
								onValueChange={setDeletePassword}
								description="Se você se cadastrou com Google, deixe em branco"
							/>

							<Input
								label="Confirmação"
								placeholder="Digite EXCLUIR MINHA CONTA"
								variant="bordered"
								value={deleteConfirmation}
								onValueChange={setDeleteConfirmation}
								description="Digite exatamente: EXCLUIR MINHA CONTA"
								onKeyDown={(e) => {
									if (e.key === " ") {
										e.nativeEvent.stopPropagation();
									}
								}}
							/>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button variant="light" onPress={resetDeleteModal}>
							Cancelar
						</Button>
						<Button
							color="danger"
							onPress={handleDeleteAccount}
							isLoading={isDeleting}
							isDisabled={deleteConfirmation !== "EXCLUIR MINHA CONTA"}
						>
							{isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Card>
	);
}
