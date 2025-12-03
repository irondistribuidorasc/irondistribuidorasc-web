import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Trocas | IRON DISTRIBUIDORA SC",
  description: "Política de trocas e devoluções da IRON DISTRIBUIDORA SC.",
};

export default function PoliticaDeTrocasPage() {
  return (
    <div className="bg-white py-16 dark:bg-slate-900">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Política de Trocas e Devoluções
        </h1>

        <div className="prose prose-slate dark:prose-invert">
          <p>
            A IRON DISTRIBUIDORA SC preza pela satisfação de seus clientes. Por
            isso, criamos uma política de trocas e devoluções clara e
            transparente, baseada no Código de Defesa do Consumidor.
          </p>

          <h3>1. Condições Gerais</h3>
          <p>
            Todas as ocorrências que envolvam troca ou devolução devem ser
            feitas no prazo de até 7 (sete) dias, a contar da data de entrega, e
            devem ser comunicadas ao nosso setor de atendimento ao cliente.
          </p>

          <h3>2. Devolução por Arrependimento/Desistência</h3>
          <p>
            Se ao receber o produto, você resolver devolvê-lo por
            arrependimento, deverá fazê-lo em até sete dias corridos, a contar
            da data de recebimento. Observando as seguintes condições:
          </p>
          <ul>
            <li>O produto não poderá ter indícios de uso.</li>
            <li>
              O produto deverá ser encaminhado preferencialmente na embalagem
              original, acompanhado de nota fiscal, manuais e acessórios.
            </li>
          </ul>

          <h3>3. Produto com Defeito</h3>
          <p>
            A solicitação de troca deverá ser comunicada ao nosso setor de
            atendimento ao cliente em até 7 dias corridos, a contar da data do
            recebimento.
          </p>
          <p>
            Se o produto adquirido em nossa loja apresentar defeito após sete
            dias, a contar da data do recebimento, mas dentro do prazo de
            garantia do fabricante, você poderá entrar em contato com o
            fabricante para comunicar a ocorrência e obter esclarecimentos ou
            dirigir-se a uma das assistências técnicas credenciadas pelo próprio
            fabricante, indicadas no manual.
          </p>

          <h3>4. Garantia</h3>
          <p>
            A IRON DISTRIBUIDORA SC oferece garantia de 1 ano para todos os
            produtos vendidos, cobrindo defeitos de fabricação. A garantia não
            cobre danos causados por mau uso, quedas, contato com líquidos ou
            instalação incorreta.
          </p>

          <h3>5. Ressarcimento de Valores</h3>
          <p>
            A IRON DISTRIBUIDORA SC fará a restituição dos valores pagos
            utilizando a mesma forma de pagamento escolhida no processo de
            compras.
          </p>
          <ul>
            <li>
              Em compras pagas com cartão de crédito, a administradora do cartão
              será notificada e o estorno ocorrerá na fatura seguinte ou na
              posterior, de uma só vez, qualquer que seja o número de parcelas
              utilizado na compra. O prazo de ressarcimento depende da
              administradora do cartão.
            </li>
            <li>
              Em compras pagas com boleto bancário ou débito em conta, a
              restituição será efetuada por meio de depósito bancário, em até 10
              (dez) dias úteis, somente na conta corrente do(a) comprador(a),
              que deve ser individual. É necessário que o CPF do titular da
              conta corrente seja o mesmo que consta no pedido (CPF do cliente).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
