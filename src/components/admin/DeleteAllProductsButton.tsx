"use client";

import { deleteAllProducts } from "@/app/actions/products";
import { TrashIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { useState } from "react";
import { toast } from "sonner";

export default function DeleteAllProductsButton() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (onClose: () => void) => {
    setIsLoading(true);
    try {
      const result = await deleteAllProducts();
      if (result.success) {
        toast.success("Todos os produtos foram excluídos com sucesso");
        onClose();
      } else {
        toast.error("Erro ao excluir produtos");
      }
    } catch (error) {
      console.error("Error deleting products:", error);
      toast.error("Erro ao excluir produtos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        className="bg-error-600 text-white font-medium shadow-lg shadow-error-600/30 hover:bg-error-700 hover:shadow-xl hover:shadow-error-600/40 transition-all"
        startContent={<TrashIcon className="h-5 w-5" />}
        onPress={onOpen}
      >
        Excluir Todos
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirmar Exclusão
              </ModalHeader>
              <ModalBody>
                <p>
                  Tem certeza que deseja excluir <strong>TODOS</strong> os
                  produtos?
                </p>
                <p className="text-sm text-danger-500 font-semibold">
                  Esta ação não pode ser desfeita.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="danger"
                  onPress={() => handleDelete(onClose)}
                  isLoading={isLoading}
                >
                  Excluir Tudo
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
