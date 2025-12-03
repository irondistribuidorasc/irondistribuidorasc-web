import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | IRON DISTRIBUIDORA SC",
  description: "Termos e condições de uso da IRON DISTRIBUIDORA SC.",
};

export default function TermosDeUsoPage() {
  return (
    <div className="bg-white py-16 dark:bg-slate-900">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Termos de Uso
        </h1>

        <div className="prose prose-slate dark:prose-invert">
          <p>
            Bem-vindo à IRON DISTRIBUIDORA SC. Ao acessar e utilizar nosso site,
            você concorda em cumprir e estar vinculado aos seguintes termos e
            condições de uso.
          </p>

          <h3>1. Aceitação dos Termos</h3>
          <p>
            Ao acessar este site, você concorda com estes Termos de Uso, todas
            as leis e regulamentos aplicáveis, e concorda que é responsável pelo
            cumprimento de todas as leis locais aplicáveis. Se você não
            concordar com algum desses termos, está proibido de usar ou acessar
            este site.
          </p>

          <h3>2. Uso de Licença</h3>
          <p>
            É concedida permissão para baixar temporariamente uma cópia dos
            materiais (informações ou software) no site da IRON DISTRIBUIDORA
            SC, apenas para visualização transitória pessoal e não comercial.
            Esta é a concessão de uma licença, não uma transferência de título,
            e sob esta licença você não pode:
          </p>
          <ul>
            <li>Modificar ou copiar os materiais;</li>
            <li>
              Usar os materiais para qualquer finalidade comercial ou para
              exibição pública (comercial ou não comercial);
            </li>
            <li>
              Tentar descompilar ou fazer engenharia reversa de qualquer
              software contido no site da IRON DISTRIBUIDORA SC;
            </li>
            <li>
              Remover quaisquer direitos autorais ou outras notações de
              propriedade dos materiais; ou
            </li>
            <li>
              Transferir os materiais para outra pessoa ou &apos;espelhar&apos;
              os materiais em qualquer outro servidor.
            </li>
          </ul>

          <h3>3. Isenção de Responsabilidade</h3>
          <p>
            Os materiais no site da IRON DISTRIBUIDORA SC são fornecidos
            &apos;como estão&apos;. A IRON DISTRIBUIDORA SC não oferece
            garantias, expressas ou implícitas, e, por este meio, isenta e nega
            todas as outras garantias, incluindo, sem limitação, garantias
            implícitas ou condições de comercialização, adequação a um fim
            específico ou não violação de propriedade intelectual ou outra
            violação de direitos.
          </p>

          <h3>4. Limitações</h3>
          <p>
            Em nenhum caso a IRON DISTRIBUIDORA SC ou seus fornecedores serão
            responsáveis por quaisquer danos (incluindo, sem limitação, danos
            por perda de dados ou lucro ou devido a interrupção dos negócios)
            decorrentes do uso ou da incapacidade de usar os materiais na IRON
            DISTRIBUIDORA SC, mesmo que a IRON DISTRIBUIDORA SC ou um
            representante autorizado da IRON DISTRIBUIDORA SC tenha sido
            notificado oralmente ou por escrito da possibilidade de tais danos.
          </p>

          <h3>5. Precisão dos Materiais</h3>
          <p>
            Os materiais exibidos no site da IRON DISTRIBUIDORA SC podem incluir
            erros técnicos, tipográficos ou fotográficos. A IRON DISTRIBUIDORA
            SC não garante que qualquer material em seu site seja preciso,
            completo ou atual. A IRON DISTRIBUIDORA SC pode fazer alterações nos
            materiais contidos em seu site a qualquer momento, sem aviso prévio.
            No entanto, a IRON DISTRIBUIDORA SC não se compromete a atualizar os
            materiais.
          </p>

          <h3>6. Links</h3>
          <p>
            A IRON DISTRIBUIDORA SC não analisou todos os sites vinculados ao
            seu site e não é responsável pelo conteúdo de nenhum site vinculado.
            A inclusão de qualquer link não implica endosso por IRON
            DISTRIBUIDORA SC do site. O uso de qualquer site vinculado é por
            conta e risco do usuário.
          </p>

          <h3>7. Modificações</h3>
          <p>
            A IRON DISTRIBUIDORA SC pode revisar estes termos de serviço do site
            a qualquer momento, sem aviso prévio. Ao usar este site, você
            concorda em ficar vinculado à versão atual desses termos de serviço.
          </p>

          <h3>8. Lei Aplicável</h3>
          <p>
            Estes termos e condições são regidos e interpretados de acordo com
            as leis do Brasil e você se submete irrevogavelmente à jurisdição
            exclusiva dos tribunais naquele estado ou localidade.
          </p>
        </div>
      </div>
    </div>
  );
}
