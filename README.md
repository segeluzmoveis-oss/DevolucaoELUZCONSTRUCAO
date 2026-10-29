# Lojas Eluz — Devolução e Troca (GitHub Pages + Apps Script)

## Instalação obrigatória
1. Abra a planilha Google Sheets que receberá os dados. A aba será `Respostas`.
2. Em Extensões > Apps Script, substitua o conteúdo de `Code.gs` pelo arquivo fornecido. Se o script for independente, preencha `SPREADSHEET_ID` com o ID da planilha. Se estiver vinculado à planilha, deixe vazio.
3. Confira o `FOLDER_ID` do Google Drive e as permissões da conta proprietária.
4. Execute `testarConfiguracao` no editor do Apps Script e autorize Sheets e Drive. Verifique o log.
5. Em Implantar > Nova implantação > Aplicativo da Web, escolha **Executar como: Eu** e **Quem tem acesso: Qualquer pessoa** (se a política da organização permitir). Copie a URL terminada em `/exec`.
6. No `script.js`, substitua `GOOGLE_SCRIPT_URL` pela URL dessa implantação. Ao atualizar o Apps Script, use Gerenciar implantações > Editar > Nova versão.
7. Envie para a raiz do repositório GitHub todos os arquivos de site: `index.html`, `sucesso.html`, `styles.css`, `script.js`, `logo-eluz-3d.png`, `fundo-eluz-azul.png`.
8. No GitHub: Settings > Pages > Deploy from a branch > main > /(root) > Save.
9. Abra a URL do GitHub Pages, preencha o formulário com um PDF pequeno e confira a aba `Respostas` (10 colunas) e a pasta Drive. Se falhar, confira **Execuções** no editor Apps Script.

## Observações
- `Code.gs` e `google-apps-script.js` **não** devem ser publicados no GitHub Pages; são códigos do servidor.
- O envio usa `no-cors`, mas a confirmação real é consultada pelo identificador único via `doGet` JSONP. Somente o status é exposto nessa consulta.
- Caso o Google Apps Script não permita servir a resposta JSONP no ambiente, o formulário avisará que não conseguiu confirmar; confira a planilha antes de reenviar.
- PDF máximo 10 MB; o limite real do Apps Script e da rede pode ser menor. Teste inicialmente com um PDF pequeno.
- Este formulário público não autentica gerentes. Para restringir envios a pessoas autorizadas, será necessário acrescentar autenticação no servidor.
