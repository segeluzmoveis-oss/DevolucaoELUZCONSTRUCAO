Sistema de Devolução e Troca | Lojas Eluz
Formulário web para solicitação de devoluções e trocas, desenvolvido para as Lojas Eluz Móveis. O site pode ser publicado pelo GitHub Pages e utiliza Google Apps Script como intermediário para registrar solicitações no Google Sheets e armazenar resumos de venda em PDF no Google Drive.
Uso interno: o formulário deve ser utilizado conforme os procedimentos e autorizações da empresa. A página web não substitui o processo de análise e aprovação de devoluções.

Funcionalidades
- Formulário responsivo com identidade visual das Lojas Eluz.
- Campos obrigatórios para descrever a solicitação.
- Anexo de um arquivo PDF de até 10 MB.
- Envio das informações para uma planilha Google Sheets.
- Armazenamento do PDF em uma pasta do Google Drive.
- Protocolo técnico para identificar e evitar registros duplicados.
- Verificação do status do recebimento antes de abrir a página de confirmação.
Dados coletados
1. Motivo da devolução.
2. Nome do vendedor.
3. Filial solicitante.
4. Produto foi entregue? (Sim/Não).
5. Operação da venda.
6. Cancelamento ou troca.
7. Onde o produto está.
8. Para onde o produto vai.
9. Resumo da venda em PDF.
A planilha recebe ainda a data do envio, o link do PDF no Drive e uma coluna técnica Protocolo (oculta na configuração inicial). São 10 colunas visíveis de registro + 1 coluna técnica.
Tecnologias utilizadas
- HTML5: estrutura do formulário e página de confirmação.
- CSS3: estilo e layout adaptável a celulares e computadores.
- JavaScript: validação, leitura do PDF e comunicação com o Apps Script.
- Google Apps Script: validação e registro no Sheets e no Drive.
- GitHub Pages: publicação estática do site.
Estrutura do projeto
projeto-eluz/
├── index.html                  # Página principal
├── sucesso.html                # Confirmação do envio
├── styles.css                  # Estilos do site
├── script.js                   # Formulário e integração
├── logo-eluz-3d.png            # Logotipo
├── fundo-eluz-azul.png         # Imagem de fundo
└── README.md                   # Esta documentação
O Code.gs é configurado no editor do Google Apps Script de uma nova planilha. Não é necessário publicá-lo no GitHub Pages.
Como configurar uma nova conexão Google
A recomendação é criar uma planilha, pasta e implantação separadas para esta versão, sem modificar as integrações antigas.
1. Criar a planilha
1. Acesse Google Sheets.
2. Crie uma planilha vazia, por exemplo, ELUZ - Devoluções e Trocas.
3. Na nova planilha, abra Extensões → Apps Script.
4. Cole o código do arquivo APPS_SCRIPT/Code.gs fornecido no pacote completo do projeto.
5. Salve o projeto.
2. Inicializar o Apps Script
Na versão Nova Conexão do Zero deste projeto:
1. Selecione configurarSistema na lista de funções e clique em Executar.
2. Autorize o acesso ao Google Sheets e ao Google Drive.
3. Confira o Registro de execução; a configuração cria a aba Respostas e uma nova pasta para PDFs.
4. Selecione testarConfiguracao e execute. Confirme as mensagens OK no registro.
Atenção: se configurarSistema não aparecer na lista, você provavelmente está usando outro Code.gs. Não siga estas etapas automaticamente: confira qual código está no editor. Em versões anteriores, testarConfiguracao pode existir sem configurarSistema.

3. Publicar o Apps Script
1. No editor, selecione Implantar → Nova implantação.
2. Em tipo de implantação, selecione Aplicativo da Web.
3. Em Executar como, selecione Eu (a conta com acesso à planilha e à pasta).
4. Em Quem tem acesso, selecione Qualquer pessoa somente se a política da empresa permitir o acesso sem autenticação. Essa opção é geralmente necessária para envio público a partir de um GitHub Pages estático.
5. Clique em Implantar e copie a URL terminada em /exec.
Use a URL /exec da implantação nova, não a URL /dev nem a implantação do formulário antigo.
4. Conectar o site
Abra script.js e localize:
const GOOGLE_SCRIPT_URL = "COLE_AQUI_A_NOVA_URL_DO_APPS_SCRIPT";
Substitua o texto entre aspas pela URL /exec copiada no passo anterior. Mantenha as aspas e o ponto e vírgula.
5. Publicar no GitHub Pages
1. Crie ou abra o repositório do site no GitHub.
2. Envie os seis arquivos do site (index.html, sucesso.html, styles.css, script.js e as duas imagens) para a raiz do repositório. Adicione também este README.md.
3. Acesse Settings → Pages.
4. Em Build and deployment, escolha Deploy from a branch.
5. Selecione a branch main e a pasta /(root); clique em Save.
6. Abra a URL do Pages exibida pelo GitHub e teste o formulário.
O GitHub Pages publica os arquivos do site, mas não executa o Apps Script. A integração depende de uma implantação Google autorizada e funcionando.

Como testar
1. Teste do Apps Script: abra a URL /exec no navegador. Na versão Nova Conexão do Zero, a resposta esperada é ELUZ NOVA CONEXAO ATIVA - 10 campos + protocolo.
2. Teste do site: preencha todos os campos e anexe um PDF pequeno e válido.
3. Clique em Enviar e aguarde a checagem de recebimento.
4. Confirme que uma nova linha apareceu na aba Respostas e que o PDF foi salvo na nova pasta do Drive.
5. Confirme que a página sucesso.html só foi aberta após o registro.
O script.js utiliza no-cors no envio, por isso a resposta direta do POST não é acessível ao navegador. A confirmação é feita por consulta de status ao Apps Script, usando o protocolo. Uma mensagem de envio, isoladamente, não comprova que os dados foram gravados; valide na planilha e no Drive.
Problemas comuns
Problema	O que verificar
Não aparece configurarSistema	O Code.gs no editor pode ser uma versão anterior ou diferente.
O site abre, mas não registra nada	URL /exec no script.js, acesso à implantação, configuração e Execuções do Apps Script.
A URL /exec abre, mas mostra mensagem de configuração pendente	Execute configurarSistema na nova planilha e autorize as permissões.
Alterei Code.gs, mas nada mudou	Faça Implantar → Gerenciar implantações → Editar → Nova versão → Implantar. Salvar o código não atualiza automaticamente a versão publicada.
PDF não aparece no Drive	Verifique as permissões da conta executora, a pasta configurada, o tamanho e a validade do arquivo.
Mensagem de envio sem confirmação	Consulte Apps Script → Execuções e confirme o registro na planilha. Não crie registros manuais duplicados.
Imagens ou estilos não aparecem	Confira os nomes exatos dos arquivos (inclusive maiúsculas/minúsculas) e se foram publicados na raiz.
A versão antiga parou após alterações	Evite alterar a implantação antiga; use o novo projeto e a nova URL /exec.


Segurança e privacidade
- Não publique PDFs enviados, planilhas, dados de clientes, credenciais ou informações internas no repositório.
- Se a implantação estiver acessível a qualquer pessoa, terceiros que descubram a URL poderão tentar enviar solicitações. A validação dos campos e o protocolo não substituem autenticação ou proteção contra abuso.
- As permissões dos PDFs no Drive devem ser administradas pela empresa; um link no Sheets não torna o arquivo público automaticamente.
- Para uso com informações sensíveis, considere controle de acesso, regras de retenção, políticas internas e adequação à LGPD antes de liberar o formulário externamente.
Personalização para outras empresas
É possível reutilizar a mesma estrutura em outra empresa desde que os campos e o formato de envio sejam compatíveis. Crie uma nova planilha e uma nova implantação, personalize as imagens e os textos e substitua GOOGLE_SCRIPT_URL pela nova URL. Se as perguntas ou colunas mudarem, ajuste também o HTML, o JavaScript e o Apps Script.
Autoria
Daniel Soares — Automações
Projeto de formulário web para as Lojas Eluz Móveis.

Status: estrutura preparada para GitHub Pages e integração Google. O funcionamento na conta real deve ser confirmado com um envio de teste.
