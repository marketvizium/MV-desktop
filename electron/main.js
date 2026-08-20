const { app, BrowserWindow, nativeImage, ipcMain  } = require('electron')                    //Imports default do electron
const Store                                         = require('electron-store')              //Chama a classe store para persistencia de dados
const store                                         = new Store()                            //Instância da Sotre para persistencia de dados
const path                                          = require('path')                        //Acessar diretórios
const {initDatabase}                                = require('./src/db/createTables')       //Função que incializa as tabelas do banco  
const { VARIAVEIS_GLOBAIS_SISTEMA                 } = require('./global')                    //Variaveis globais do sistema que não precisam de persistencia
const { buscarProdutoPorCodigo                    } = require('./src/db/queries')            //Consultar Produto no Banco
const { buscarProdutoCadastradoPorCodigo          } = require('./src/db/queries')            //Busca produtos cadastrados no banco auxiliares
const { setEntradaEstoque                         } = require('./src/db/queries')            //Entrada nos produtos no estoque
const { SetSaidaEstoque                           } = require('./src/db/queries')            //Saída de produtos no estoque
const { SetCadastroProduto                        } = require('./src/db/queries')            //Cadastro de produto no db
const { GetProdutosComStatusSync                  } = require('./src/db/queries')            //Cadastro de produto no db
const { GetFornecedoresCadastrados                } = require('./src/db/queries')            //Consultar todos os fornecedores
const { SalvarNovoFornecedor                      } = require('./src/db/queries')            //Cadastrar um novo fornecedor
const { GetTodosItensEstoque                      } = require('./src/db/queries')            //Consulta todos os produtos do estoque
const { GetProdutosVencidos                       } = require('./src/db/queries')            //Consulta produtos vencidos
const { GetProdutosProximosVencimento             } = require('./src/db/queries')            //Consulta produtos próximo da data de vencimento
const { setProdutoComposicao                      } = require('./src/db/queries')            //Cadastro de produtos associados
const { getAllProdutosComposicao                  } = require('./src/db/queries')            //Consulta todos os produtos composição
const { updateProdutoComp                         } = require('./src/db/queries')            //Atualiza o cadastro do produtoComp
const { updateProdutoCadastrado                   } = require('./src/db/queries')            //Atualiza o cadastro de produto cadastrado
const { syncMestre                                } = require('./src/services/syncDatabase') //Importação da função periódica de Sync
const { api                                       } = require('./api')                       //Fazer requisições
const { nativeTheme                               } = require('electron')
const fs = require('fs')
const os = require('os')
const axios = require('axios')

/************************************************************/
/*      NOVO SISTEMA DE ATUALIZAÇÃO — electron-updater       */
/*                                                            */
/*  Substitui por completo o sistema antigo (download de     */
/*  .zip via axios + extração com unzipper + cópia manual de */
/*  pastas). Esse sistema antigo era a causa raiz da          */
/*  inconsistência entre Windows: cópia de diretório é        */
/*  sensível a permissão de arquivo, AV bloqueando o          */
/*  unzipper, arquivos em uso (EBUSY) e symlink exigindo       */
/*  privilégio de admin no Windows 11.                         */
/*                                                            */
/*  electron-updater resolve tudo isso de forma nativa:       */
/*  - No Windows usa NSIS, que já sabe lidar com arquivo em    */
/*    uso, cria um instalador diferencial (.blockmap) e troca  */
/*    o app inteiro de forma atômica.                          */
/*  - Verifica integridade do pacote (hash) antes de instalar. */
/*  - Não depende de zip/unzip escrito à mão.                  */
/************************************************************/
const { autoUpdater } = require('electron-updater')
const log             = require('electron-log')

// Redireciona os logs do autoUpdater para o electron-log (grava em arquivo,
// essencial para debugar em produção — você não tem console.log no cliente).
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'
log.info('[UPDATE] App iniciado. Versão atual:', app.getVersion())

// Não baixa automaticamente assim que encontra uma atualização — deixamos
// explícito no fluxo abaixo (checkForUpdates -> downloadUpdate) para termos
// controle total sobre quando avisar o usuário e quando reiniciar.
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

// Referência à janela principal, usada para enviar eventos de progresso
// de atualização para o renderer (barra de progresso, avisos, etc).
let mainWindow = null


/************************************************************/
/*                          IPC AREA                        */
/************************************************************/
ipcMain.handle('get-produto-banco', async (event, produto) => {
  try {
    // Passamos o código e o lote (se houver) para a função do SQLite
    const produtos = await buscarProd(produto);

    let desativado_base = false

    produtos.forEach((prod)=>{
      if(prod.desativado){
        desativado_base = true
      }
    })
    

    // Retornamos um objeto de sucesso com os dados
    return {
      success: true,
      desativado: desativado_base,
      data: desativado_base ? [] : produtos // Isso será um Array []
    };
  } catch (e) {
    console.error("Erro no IPC get-produto-banco:", e);
    return {
      success: false,
      message: e.message
    };
  }
})

ipcMain.on('set-token', (event, token) =>{
  setTokenLogin(token)
})

ipcMain.handle('set-entrada', async (event, produtos) =>{
  try{
    const retornoEntrada = await setEntrada(produtos)
    return retornoEntrada
  }catch(e){
    console.log(e)
  }
})

ipcMain.on('set-idloja', (event, IDloja) =>{
  setIDloja(IDloja)
})

ipcMain.handle('get-status-rede', (event) =>{
  return VARIAVEIS_GLOBAIS_SISTEMA.FLAG_SISTEMA_ONLINE
})


ipcMain.handle('set-saida', async (event, produtos) =>{
  try{

    const retornoSaida = await setSaida(produtos)
    return retornoSaida
  }catch(e){
    console.log(e)
  }
})


ipcMain.handle('set-cadastro-produto', async (event, produtos) =>{
  try{

    const retornoCadastroProduto = await setCadastroProduto(produtos)
    return retornoCadastroProduto
  }catch(e){
    console.log(e)
  }
})

ipcMain.handle('get-produtos-cadastrados', async (event) =>{
  try{

    const retornoGetProdutosCadastrados = await getProdutosCadastrados()
    return retornoGetProdutosCadastrados
  }catch(e){
    console.log(e)
  }
})

ipcMain.handle('get-fornecedores-cadastrados', async (event) =>{
  try{

    const retornoGetFornecedoresCadastrados = await getFornecedores()
    return retornoGetFornecedoresCadastrados
  }catch(e){
    console.log(e)
  }
})

ipcMain.handle('set-cadastro-fornecedor', async (event, fornecedor) =>{
  try{

    const retornoSetFornecedoresCadastrados = await setFornecedor(fornecedor)
    return retornoSetFornecedoresCadastrados
  }catch(e){
    console.log(e)
  }
})


ipcMain.handle('get-itens-estoque', async (event, ) =>{
  try{
    const retornoGetItensEstoque = await getTodosEstoque()
    return retornoGetItensEstoque
  }catch(e){
    console.log(e)
  }
})


ipcMain.handle('get-vencidos', async (event, ) =>{
  try{

    const retornoProdutosVencidos = await getVencidos()
    return retornoProdutosVencidos
  }catch(e){
    console.log(e)
  }
})

ipcMain.handle('get-proximos', async (event, ) =>{
  try{

    const retornoProdutosProximos = await getProximos()
    return retornoProdutosProximos
  }catch(e){
    console.log(e)
  }
})


ipcMain.handle('set-cadastro-composicao', async (event, produtoComp) =>{
  try{

    const retornoSetCadastroComposicao = await setProdutoComp(produtoComp)
    return retornoSetCadastroComposicao
  }catch(e){
    console.log(e)
  }
})

ipcMain.handle('get-produto-composicao', async (event, ) =>{
  try{

    const retornoGetProdutosComposicao = await getProdutosComposicao()
    return retornoGetProdutosComposicao
  }catch(e){
    console.log(e)
  }
})

ipcMain.handle('set-atualizar-prod-comp', async (event, produtoComp) =>{
  try{

    const retornoSetProdutosComposicao = await setAtualizarProdComp(produtoComp)
    return retornoSetProdutosComposicao
  }catch(e){
    console.log(e)
  }
})

ipcMain.handle('set-atualizar-prod-cadastro', async (event, produtoComp) =>{
  try{
    const retornoSetProdutosCadastro = await setAtualizarProdCadastrado(produtoComp)
    return retornoSetProdutosCadastro
  }catch(e){
    console.log(e)
  }
})

/************************************************************/

/************************************************************/
/*     EVENTOS DO AUTOUPDATER (ciclo de vida da atualização)  */
/*                                                              */
/*  Cada evento abaixo é emitido automaticamente pelo           */
/*  electron-updater durante o ciclo de checagem/download/      */
/*  instalação. Aqui nós só: (1) logamos, (2) repassamos o      */
/*  status para o renderer via IPC, para você poder mostrar     */
/*  uma barra de progresso ou aviso "Nova versão disponível".   */
/************************************************************/

function sendStatusToWindow(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload)
  }
}

// Iniciou a checagem de atualização no servidor de update
autoUpdater.on('checking-for-update', () => {
  log.info('[UPDATE] Verificando atualizações...')
  sendStatusToWindow('update:checking')
})

// Existe uma versão mais nova do que app.getVersion() disponível no feed.
// Como autoDownload = false, o download só começa quando chamamos
// autoUpdater.downloadUpdate() explicitamente (feito logo abaixo).
autoUpdater.on('update-available', (info) => {
  log.info('[UPDATE] Atualização disponível:', info.version)
  sendStatusToWindow('update:available', { version: info.version })

  // Baixa automaticamente em background assim que detecta a nova versão.
  // Se preferir perguntar ao usuário antes, remova esta linha e dispare
  // o download a partir de um botão no renderer (canal 'update:start-download').
  autoUpdater.downloadUpdate().catch(err => {
    log.error('[UPDATE] Erro ao iniciar download:', err)
  })
})

// Já está na última versão — nada a fazer.
autoUpdater.on('update-not-available', (info) => {
  log.info('[UPDATE] Nenhuma atualização disponível. Versão atual:', info.version)
  sendStatusToWindow('update:not-available', { version: info.version })
})

// Progresso do download (%), útil para uma barra de progresso no renderer.
autoUpdater.on('download-progress', (progress) => {
  sendStatusToWindow('update:progress', {
    percent: Math.round(progress.percent),
    bytesPerSecond: progress.bytesPerSecond,
    transferred: progress.transferred,
    total: progress.total
  })
})

// Download concluído e verificado (hash/assinatura ok). A atualização já
// está pronta em disco — só falta reiniciar o app para aplicá-la.
// autoInstallOnAppQuit = true garante que, mesmo que o usuário feche o
// app manualmente (sem clicar em "reiniciar agora"), a atualização é
// aplicada no próximo fechamento.
autoUpdater.on('update-downloaded', (info) => {
  log.info('[UPDATE] Atualização baixada:', info.version)
  sendStatusToWindow('update:downloaded', { version: info.version })
})

// Qualquer erro no ciclo (rede, feed mal configurado, arquivo corrompido,
// assinatura inválida etc). Nunca trava o app — apenas loga e segue.
autoUpdater.on('error', (err) => {
  log.error('[UPDATE] Erro no processo de atualização:', err)
  sendStatusToWindow('update:error', { message: err?.message || String(err) })
})

/**
 * Dispara a checagem de atualização. Chamado no app.whenReady() e pode
 * também ser chamado periodicamente (ver setInterval no whenReady) ou
 * manualmente pelo renderer (canal 'update:check-now').
 */
async function checkForUpdates() {
  try {
    await autoUpdater.checkForUpdates()
  } catch (err) {
    // checkForUpdates já emite 'error', isso aqui é um catch de segurança
    // extra para não deixar a Promise rejeitada sem tratamento.
    log.error('[UPDATE] Falha inesperada ao checar atualização:', err)
  }
}

app.setName("Market Vizium - Software Varejo")
app.setAppUserModelId("market-vizium")

function getFrontendPath() {
  // O frontend agora vive DENTRO do pacote instalado pelo electron-builder
  // (extraResources/asar), não é mais baixado/copiado manualmente.
  // Isso elimina toda a classe de bug "funciona numa Windows e não em outra":
  // não existe mais cópia de diretório em runtime, só o que o instalador
  // NSIS já colocou no disco de forma atômica.
  return path.join(
    __dirname,
    '../frontend/dist/index.html'
  )
}

function createWindow () {


  const icon = nativeImage.createFromPath(
    path.join(__dirname, "assets/logo.png")
  )
  console.log(icon.isEmpty())

  nativeTheme.themeSource = 'light'

  const win = new BrowserWindow({
    width: 1200,
    height: 800,

    minWidth: 1100,
    minHeight: 720,

    maxWidth: 1920,
    maxHeight: 1080,

    icon: path.join(__dirname, '../build/icon.ico'),

    frame: false,
    //devTools: false, //habilitar prod

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // Guarda a referência global — é para essa janela que os eventos de
  // update (progresso, disponível, baixado etc) são enviados via IPC.
  mainWindow = win

  // Minimizar
  ipcMain.handle('window-minimize', () => {
      win.minimize();
  });

  // Maximizar / Restaurar
  ipcMain.handle('window-maximize', () => {
      if (win.isMaximized()) {
          win.unmaximize();
      } else {
          win.maximize();
      }
  });

  // Fechar
  ipcMain.handle('window-close', () => {
      win.close();
  });

   // Bloqueia atalhos de teclado
    win.webContents.on('before-input-event', (event, input) => {

        // Bloqueia F1-F12
        if (/^F\d+$/.test(input.key)) {
            event.preventDefault();
            return;
        }

        //Bloqueia Ctrl + qualquer tecla
        // Permite apenas alguns atalhos com Ctrl
        const atalhosPermitidos = ['a', 'c', 'v', 'x', 'z'];

        if (input.control) {
            if (atalhosPermitidos.includes(input.key.toLowerCase())) {
                return; // Permite Ctrl+A/C/V/X/Z
            }
            event.preventDefault();
            return;
        }

        // Bloqueia Alt + qualquer tecla
        if (input.alt) {
            event.preventDefault();
            return;
        }

        // Bloqueia Meta (Windows)
        if (input.meta) {
            event.preventDefault();
            return;
        }

        // Bloqueia ESC
        if (input.key === 'Escape') {
            event.preventDefault();
            return;
        }
    });


  console.log("AAAAAA")
  console.log('ELECTRON_DEV =', process.env.ELECTRON_DEV)
  if (process.env.ELECTRON_DEV === 'true') {

      win.loadURL('http://localhost:5173')

  } else {

      win.loadFile(
          getFrontendPath()
      )

  }


  win.webContents.on('console-message', (_, level, message) => {
      console.log('[RENDERER]', message)
  })

  win.webContents.on('did-fail-load', (_, code, desc, url) => {
      console.log('ERRO LOAD:', code, desc, url)
  })
}

app.whenReady().then(async () => {
  // 1. Inicializa banco de dados
  try {
    initDatabase()
    console.log('[DB] Banco de dados inicializado com sucesso.')
  } catch (error) {
    console.error('[DB] Falha ao iniciar o banco de dados:', error)
  }

  // 2. Abre a janela imediatamente — o app nunca fica travado esperando update
  createWindow()

  // 3. Primeira checagem de atualização, alguns segundos após abrir, para não
  //    competir com o carregamento inicial do frontend/banco por I/O e rede.
  setTimeout(() => {
    checkForUpdates()
  }, 5_000)

  // 4. Checagem periódica em background (a cada 30 min). Como autoDownload
  //    é false e só chamamos downloadUpdate() dentro de 'update-available',
  //    isso é seguro: se não houver versão nova, o evento nem dispara download.
  setInterval(() => {
    checkForUpdates()
  }, 30 * 60 * 1000)

});

/************************************************************/
/*        IPC — controle de atualização pelo renderer         */
/*                                                              */
/*  Exponha estes canais no preload.js (ver bloco de           */
/*  instruções no guia) para o renderer poder: checar agora,    */
/*  reiniciar para aplicar update baixado, e saber a versão.    */
/************************************************************/

// Renderer pode forçar uma checagem manual (ex: botão "verificar atualizações")
ipcMain.handle('update:check-now', async () => {
  await checkForUpdates()
})

// Renderer chama isso quando o usuário clica em "Reiniciar agora" após
// receber o evento 'update:downloaded'. Fecha o app e instala a atualização.
ipcMain.handle('update:restart-now', () => {
  autoUpdater.quitAndInstall()
})

// Renderer pode perguntar a versão atual do app (para mostrar em "Sobre")
ipcMain.handle('update:get-version', () => {
  return app.getVersion()
})

app.commandLine.appendSwitch('ignore-certificate-errors')

app.disableHardwareAcceleration()

app.commandLine.appendSwitch('ignore-certificate-errors')

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

async function setIDloja(idLoja){

  const loja = store.get('loja')

  if(!loja){
    store.set('loja')
  }else{

    if(!idLoja){
      const obj = {
        id_loja : loja.id_loja
      }
  
      store.set('loja', obj)
    }else{
      const obj = {
        id_loja : idLoja
      }
  
      store.set('loja', obj)
    }
  }

}

async function verificaServidorOnline(){

  setInterval(async ()=>{

    console.log(VARIAVEIS_GLOBAIS_SISTEMA.FLAG_SISTEMA_ONLINE, "FLAG AÍI")

    try{

      await api.get('/mvpu/estoque/ping')

      VARIAVEIS_GLOBAIS_SISTEMA.FLAG_SISTEMA_ONLINE = true

    }catch(e){

      VARIAVEIS_GLOBAIS_SISTEMA.FLAG_SISTEMA_ONLINE = false
    }
  },3500)
}

//Função para buscar prod por código de barras no beep ou digitação manual
async function buscarProd(produtoConsulta){
  try{

    if(!produtoConsulta.codigo_barra)
      throw new Error("Entrada invalida");
      
      
    const PayloadProduct = {
      codigo_barra: produtoConsulta.codigo_barra,
      lote: produtoConsulta.lote ? produtoConsulta.lote : null
    }
    
    let produto = null

    if(VARIAVEIS_GLOBAIS_SISTEMA.FLAG_SISTEMA_ONLINE){
      produto = await buscarProdutoPorCodigo(PayloadProduct.codigo_barra, PayloadProduct.lote)
      console.log(produto, 'ONLINE')
      return produto
    }else{
      produto = await buscarProdutoCadastradoPorCodigo(PayloadProduct.codigo_barra, PayloadProduct.lote)
      console.log(produto, 'OFFLINE')
      return produto
    }

  }catch(e){
    console.log("Erro ao consultar produto", e)
  }
}

async function setTokenLogin(token){

  console.log(token, "AAAAAA")

  store.set('token', token)

  console.log(store.get('token'))
  console.log(store.get('loja'))

  function initSyncMestre(){
    setTimeout(()=>{
      syncMestre()
    },5000)
  }
  
  setIDloja()
  verificaServidorOnline()
  initSyncMestre()
}

async function setEntrada(produtos){
  const retornoEntrada = await setEntradaEstoque(produtos)
  return retornoEntrada
}

async function setSaida(produtos){

  console.log(produtos)
  const retornoSaida = await SetSaidaEstoque(produtos)
  return retornoSaida
}


//Você precisa sincronizar os cadastros com setInterval mesmo sem refatorar função. Precisa fazer a consulta dos produtos
//cadastrados a partir do local, se possível diferenciando sincronizado e n sincronizado na tabela. 

//A mesma coisa vc precisa fazer pra item em estoque

//Precisa consultar, cadastrar, atualizar e deletar produto composição. 

//Sincronizar fornecedores também

//Cadastro de fornecedores

//Precisa atualizar produto cadastrado

//Aí acabou o estoque e vamos para o dono da loja.
async function setCadastroProduto(payload){
  const retornoCadastro = SetCadastroProduto(payload)
  return retornoCadastro
}

async function getProdutosCadastrados(){
  try{

    const loja = store.get('loja')
    if(!loja.id_loja) return
    
    const produtos_cadastrados = await GetProdutosComStatusSync(loja.id_loja)
    return produtos_cadastrados
  }catch(e){
    console.log(e)
  }
}

async function setFornecedor(payload){
  console.log("AAAA", payload)
  const retornoCadastroFornecedor = SalvarNovoFornecedor(payload)
  return retornoCadastroFornecedor
}

async function getFornecedores(){
  try{
    const loja = store.get('loja')
    if(!loja.id_loja) return

    const fornecedores_cadastrados = await GetFornecedoresCadastrados(loja.id_loja)
    return fornecedores_cadastrados
  }catch(e){
    console.log(e)
  }
}

async function getTodosEstoque(){
  try{
    const loja = store.get('loja')
    if(!loja.id_loja) return

    const produtos_estoque = await GetTodosItensEstoque(loja.id_loja)
    return produtos_estoque
  }catch(e){
    console.log(e)
  }
}

async function getVencidos(){
  try{
    const loja = store.get('loja')
    if(!loja.id_loja) return

    const produtos_vencidos = await GetProdutosVencidos(loja.id_loja)
    return produtos_vencidos
  }catch(e){
    console.log(e)
  }
}

async function getProximos(){
  try{
    const loja = store.get('loja')
    if(!loja.id_loja) return

    const produtos_estoque = await GetProdutosProximosVencimento(loja.id_loja)
    return produtos_estoque
  }catch(e){
    console.log(e)
  }
}


async function setProdutoComp(produtoComp){
  try{
    const loja = store.get('loja')
    if(!loja.id_loja) return

    const objProduto = {
      ...produtoComp,
      id_loja: loja.id_loja
    }


    const cadastrar_produto_comp = await setProdutoComposicao(objProduto)
    return cadastrar_produto_comp
  }catch(e){
    console.log(e)
  }
}

async function getProdutosComposicao(){
  try{
    const loja = store.get('loja')
    if(!loja.id_loja) return

    const retorno_produtos_composicao = await getAllProdutosComposicao(loja.id_loja)
    return retorno_produtos_composicao
  }catch(e){
    console.log(e)
  }
}


async function setAtualizarProdComp(produtoComp){
  try{

    const retorno_produtos_composicao = await updateProdutoComp(produtoComp)
    return retorno_produtos_composicao

  }catch(e){
    console.log(e)
  }
}

async function setAtualizarProdCadastrado(produtoComp){
  try{

    const retorno_produtos_atualizados = await updateProdutoCadastrado(produtoComp)
    return retorno_produtos_atualizados

  }catch(e){
    console.log(e)
  }
}