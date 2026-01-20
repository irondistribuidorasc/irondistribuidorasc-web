import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade | IRON DISTRIBUIDORA SC",
  description:
    "Política de privacidade e proteção de dados da IRON DISTRIBUIDORA SC conforme a LGPD.",
};

export default function PoliticaDePrivacidadePage() {
  const lastUpdated = "05 de Janeiro de 2026";

  return (
    <div className="bg-white py-16 dark:bg-slate-900">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Política de Privacidade
        </h1>
        <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
          Última atualização: {lastUpdated}
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p>
            A sua privacidade é importante para nós. Esta Política de Privacidade
            descreve como a IRON DISTRIBUIDORA SC coleta, usa, armazena e protege
            seus dados pessoais, em conformidade com a Lei Geral de Proteção de
            Dados Pessoais (Lei nº 13.709/2018 - LGPD).
          </p>

          <h2>1. Identificação do Controlador</h2>
          <p>
            <strong>Controlador:</strong> IRON DISTRIBUIDORA SC
            <br />
            <strong>Endereço:</strong> Santa Catarina, Brasil
            <br />
            <strong>E-mail de contato:</strong>{" "}
            <a href="mailto:contato@irondistribuidorasc.com.br">
              contato@irondistribuidorasc.com.br
            </a>
            <br />
            <strong>WhatsApp:</strong> (48) 99114-7117
          </p>

          <h3>Encarregado de Proteção de Dados (DPO)</h3>
          <p>
            Para questões relacionadas à proteção de dados pessoais, entre em
            contato com nosso Encarregado:
            <br />
            <strong>E-mail:</strong>{" "}
            <a href="mailto:privacidade@irondistribuidorasc.com.br">
              privacidade@irondistribuidorasc.com.br
            </a>
          </p>

          <h2>2. Dados Pessoais que Coletamos</h2>
          <p>Coletamos os seguintes dados pessoais:</p>
          <ul>
            <li>
              <strong>Dados de identificação:</strong> nome completo, CPF/CNPJ,
              e-mail, telefone
            </li>
            <li>
              <strong>Dados de endereço:</strong> logradouro, número, complemento,
              cidade, estado, CEP
            </li>
            <li>
              <strong>Dados comerciais:</strong> nome da loja/assistência técnica,
              telefone comercial, inscrição estadual/municipal
            </li>
            <li>
              <strong>Dados de navegação:</strong> endereço IP, cookies, dados de
              acesso
            </li>
            <li>
              <strong>Dados de transação:</strong> histórico de pedidos, valores,
              formas de pagamento
            </li>
          </ul>

          <h2>3. Finalidade e Base Legal do Tratamento</h2>
          <p>
            Tratamos seus dados pessoais com base nas seguintes hipóteses legais
            previstas no Art. 7º da LGPD:
          </p>
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left font-semibold">Finalidade</th>
                <th className="text-left font-semibold">Base Legal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cadastro e criação de conta</td>
                <td>Consentimento (Art. 7º, I)</td>
              </tr>
              <tr>
                <td>Processamento de pedidos</td>
                <td>Execução de contrato (Art. 7º, V)</td>
              </tr>
              <tr>
                <td>Comunicação sobre pedidos</td>
                <td>Execução de contrato (Art. 7º, V)</td>
              </tr>
              <tr>
                <td>Emissão de notas fiscais</td>
                <td>Cumprimento de obrigação legal (Art. 7º, II)</td>
              </tr>
              <tr>
                <td>Análise de navegação e melhorias</td>
                <td>Legítimo interesse (Art. 7º, IX)</td>
              </tr>
              <tr>
                <td>Marketing e promoções</td>
                <td>Consentimento (Art. 7º, I)</td>
              </tr>
            </tbody>
          </table>

          <h2>4. Compartilhamento de Dados</h2>
          <p>
            Seus dados pessoais podem ser compartilhados com os seguintes
            terceiros, exclusivamente para as finalidades descritas:
          </p>
          <ul>
            <li>
              <strong>Supabase Inc.</strong> - Armazenamento seguro de dados
              (infraestrutura)
            </li>
            <li>
              <strong>Vercel Inc.</strong> - Hospedagem do site e analytics
            </li>
            <li>
              <strong>Resend</strong> - Envio de e-mails transacionais
            </li>
            <li>
              <strong>Autoridades competentes</strong> - Quando exigido por lei ou
              ordem judicial
            </li>
          </ul>
          <p>
            Não vendemos, alugamos ou compartilhamos seus dados pessoais para
            fins de marketing de terceiros.
          </p>

          <h2>5. Tempo de Retenção dos Dados</h2>
          <p>Mantemos seus dados pessoais pelos seguintes períodos:</p>
          <ul>
            <li>
              <strong>Dados de conta:</strong> Enquanto a conta estiver ativa ou
              até solicitação de exclusão
            </li>
            <li>
              <strong>Dados de pedidos:</strong> 5 anos após a última transação
              (obrigação fiscal)
            </li>
            <li>
              <strong>Notas fiscais:</strong> 5 anos (obrigação legal)
            </li>
            <li>
              <strong>Dados de navegação:</strong> 12 meses
            </li>
          </ul>

          <h2>6. Seus Direitos (Art. 18 da LGPD)</h2>
          <p>
            Como titular dos dados, você tem os seguintes direitos garantidos
            pela LGPD:
          </p>
          <ul>
            <li>
              <strong>Confirmação e acesso:</strong> Confirmar se tratamos seus
              dados e acessá-los
            </li>
            <li>
              <strong>Correção:</strong> Solicitar a correção de dados
              incompletos, inexatos ou desatualizados
            </li>
            <li>
              <strong>Anonimização, bloqueio ou eliminação:</strong> Solicitar a
              anonimização ou exclusão de dados desnecessários
            </li>
            <li>
              <strong>Portabilidade:</strong> Receber seus dados em formato
              estruturado para transferência
            </li>
            <li>
              <strong>Eliminação:</strong> Solicitar a exclusão dos dados
              tratados com base no consentimento
            </li>
            <li>
              <strong>Revogação do consentimento:</strong> Revogar o
              consentimento a qualquer momento
            </li>
            <li>
              <strong>Oposição:</strong> Opor-se ao tratamento em caso de
              descumprimento da LGPD
            </li>
          </ul>

          <h3>Como Exercer Seus Direitos</h3>
          <p>
            Você pode exercer seus direitos de duas formas:
          </p>
          <ol>
            <li>
              <strong>Pela plataforma:</strong> Acesse{" "}
              <Link href="/minha-conta" className="text-primary hover:underline">
                Minha Conta
              </Link>{" "}
              para exportar ou excluir seus dados
            </li>
            <li>
              <strong>Por e-mail:</strong> Envie sua solicitação para{" "}
              <a href="mailto:privacidade@irondistribuidorasc.com.br">
                privacidade@irondistribuidorasc.com.br
              </a>
            </li>
          </ol>
          <p>
            Responderemos sua solicitação em até 15 dias, conforme previsto na
            LGPD.
          </p>

          <h2>7. Cookies e Tecnologias de Rastreamento</h2>
          <p>Utilizamos cookies para:</p>
          <ul>
            <li>
              <strong>Cookies essenciais:</strong> Necessários para o
              funcionamento do site (autenticação, carrinho)
            </li>
            <li>
              <strong>Cookies de analytics:</strong> Para entender como você usa
              o site e melhorar sua experiência
            </li>
          </ul>
          <p>
            Ao acessar nosso site pela primeira vez, você será solicitado a
            consentir com o uso de cookies. Você pode gerenciar suas
            preferências de cookies a qualquer momento nas configurações do seu
            navegador.
          </p>

          <h2>8. Segurança dos Dados</h2>
          <p>
            Implementamos medidas técnicas e organizacionais para proteger seus
            dados pessoais, incluindo:
          </p>
          <ul>
            <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
            <li>Criptografia de senhas (bcrypt)</li>
            <li>Controle de acesso baseado em funções</li>
            <li>Monitoramento de segurança</li>
            <li>Backups regulares</li>
            <li>Rate limiting para proteção contra ataques</li>
          </ul>

          <h2>9. Transferência Internacional de Dados</h2>
          <p>
            Alguns de nossos prestadores de serviços estão localizados fora do
            Brasil (Estados Unidos). Garantimos que essas transferências são
            realizadas com salvaguardas adequadas, conforme exigido pela LGPD.
          </p>

          <h2>10. Menores de Idade</h2>
          <p>
            Nossos serviços são destinados a pessoas maiores de 18 anos. Não
            coletamos intencionalmente dados de menores. Se identificarmos que
            coletamos dados de um menor sem autorização dos pais ou
            responsáveis, excluiremos esses dados imediatamente.
          </p>

          <h2>11. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta Política de Privacidade periodicamente.
            Notificaremos você sobre alterações significativas por e-mail ou
            por aviso em nosso site. Recomendamos que você revise esta política
            regularmente.
          </p>

          <h2>12. Contato e Reclamações</h2>
          <p>
            Se você tiver dúvidas sobre esta Política de Privacidade ou quiser
            exercer seus direitos, entre em contato:
          </p>
          <ul>
            <li>
              <strong>E-mail:</strong>{" "}
              <a href="mailto:privacidade@irondistribuidorasc.com.br">
                privacidade@irondistribuidorasc.com.br
              </a>
            </li>
            <li>
              <strong>WhatsApp:</strong> (48) 99114-7117
            </li>
          </ul>
          <p>
            Se você não estiver satisfeito com nossa resposta, você tem o
            direito de apresentar uma reclamação à Autoridade Nacional de
            Proteção de Dados (ANPD):
            <br />
            <a
              href="https://www.gov.br/anpd"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.gov.br/anpd
            </a>
          </p>

          <hr className="my-8" />

          <p className="text-sm text-slate-500">
            Esta Política de Privacidade foi elaborada em conformidade com a Lei
            Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018) e entra em
            vigor a partir da data de sua publicação.
          </p>
        </div>
      </div>
    </div>
  );
}
