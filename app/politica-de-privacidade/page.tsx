import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | IRON DISTRIBUIDORA SC",
  description:
    "Política de privacidade e proteção de dados da IRON DISTRIBUIDORA SC.",
};

export default function PoliticaDePrivacidadePage() {
  return (
    <div className="bg-white py-16 dark:bg-slate-900">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Política de Privacidade
        </h1>

        <div className="prose prose-slate dark:prose-invert">
          <p>
            A sua privacidade é importante para nós. É política da IRON
            DISTRIBUIDORA SC respeitar a sua privacidade em relação a qualquer
            informação que possamos coletar no site IRON DISTRIBUIDORA SC, e
            outros sites que possuímos e operamos.
          </p>

          <h3>1. Informações que Coletamos</h3>
          <p>
            Solicitamos informações pessoais apenas quando realmente precisamos
            delas para lhe fornecer um serviço. Fazemo-lo por meios justos e
            legais, com o seu conhecimento e consentimento. Também informamos
            por que estamos coletando e como será usado.
          </p>

          <h3>2. Retenção de Dados</h3>
          <p>
            Apenas retemos as informações coletadas pelo tempo necessário para
            fornecer o serviço solicitado. Quando armazenamos dados, protegemos
            dentro de meios comercialmente aceitáveis para evitar perdas e
            roubos, bem como acesso, divulgação, cópia, uso ou modificação não
            autorizados.
          </p>

          <h3>3. Compartilhamento de Dados</h3>
          <p>
            Não compartilhamos informações de identificação pessoal publicamente
            ou com terceiros, exceto quando exigido por lei.
          </p>

          <h3>4. Links Externos</h3>
          <p>
            O nosso site pode ter links para sites externos que não são operados
            por nós. Esteja ciente de que não temos controle sobre o conteúdo e
            práticas desses sites e não podemos aceitar responsabilidade por
            suas respectivas políticas de privacidade.
          </p>

          <h3>5. Cookies</h3>
          <p>
            Como é prática comum em quase todos os sites profissionais, este
            site usa cookies, que são pequenos arquivos baixados no seu
            computador, para melhorar sua experiência. Você é livre para recusar
            a nossa solicitação de informações pessoais, entendendo que talvez
            não possamos fornecer alguns dos serviços desejados.
          </p>

          <h3>6. Compromisso do Usuário</h3>
          <p>
            O usuário se compromete a fazer uso adequado dos conteúdos e da
            informação que a IRON DISTRIBUIDORA SC oferece no site e com caráter
            enunciativo, mas não limitativo:
          </p>
          <ul>
            <li>
              Não se envolver em atividades que sejam ilegais ou contrárias à
              boa fé a à ordem pública;
            </li>
            <li>
              Não difundir propaganda ou conteúdo de natureza racista,
              xenofóbica, ou azar, qualquer tipo de pornografia ilegal, de
              apologia ao terrorismo ou contra os direitos humanos;
            </li>
            <li>
              Não causar danos aos sistemas físicos (hardwares) e lógicos
              (softwares) da IRON DISTRIBUIDORA SC, de seus fornecedores ou
              terceiros, para introduzir ou disseminar vírus informáticos ou
              quaisquer outros sistemas de hardware ou software que sejam
              capazes de causar danos anteriormente mencionados.
            </li>
          </ul>

          <h3>7. Mais Informações</h3>
          <p>
            Esperamos que esteja esclarecido e, como mencionado anteriormente,
            se houver algo que você não tem certeza se precisa ou não,
            geralmente é mais seguro deixar os cookies ativados, caso interaja
            com um dos recursos que você usa em nosso site.
          </p>
        </div>
      </div>
    </div>
  );
}
