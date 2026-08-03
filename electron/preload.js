const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  consultarProdutoBD          : (produto       ) => ipcRenderer.invoke('get-produto-banco'        , (produto)) , 
  setToken                    : (token         ) => ipcRenderer.send(  'set-token'                , (token))   , 
  setIDloja                   : (IDloja        ) => ipcRenderer.send(  'set-idloja'               , (IDloja))  , 
  setEntrada                  : (produtos      ) => ipcRenderer.invoke('set-entrada'              , (produtos)), 
  getStatusRede               : (              ) => ipcRenderer.invoke('get-status-rede')         , 
  setSaida                    : (produtos      ) => ipcRenderer.invoke('set-saida'                , (produtos)), 
  setCadastroProduto          : (produtos      ) => ipcRenderer.invoke('set-cadastro-produto'     , (produtos)), 
  getProdutosCadastrados      : (              ) => ipcRenderer.invoke('get-produtos-cadastrados'), 
  setCadastroFornecedores     : (fornecedores  ) => ipcRenderer.invoke('set-cadastro-fornecedor'  , (fornecedores)), 
  getFornecedoresCadastrados  : (              ) => ipcRenderer.invoke('get-fornecedores-cadastrados'), 
  getTodosItensEstoque        : (              ) => ipcRenderer.invoke('get-itens-estoque'), 
  getVencidos                 : (              ) => ipcRenderer.invoke('get-vencidos'), 
  getProximos                 : (              ) => ipcRenderer.invoke('get-proximos'),
  setProdutoComp              : (produtoComp   ) => ipcRenderer.invoke('set-cadastro-composicao', (produtoComp)),
  getComposicoes              : (              ) => ipcRenderer.invoke('get-produto-composicao'),
  atualizarProdComp           : (produtoComp   ) => ipcRenderer.invoke('set-atualizar-prod-comp', (produtoComp)),
  atualizarProdCadastro       : (prodCadastro  ) => ipcRenderer.invoke('set-atualizar-prod-cadastro', (prodCadastro)),
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close')
})


/************************************************************/
/*  ADICIONE ESTE TRECHO AO SEU preload.js JÁ EXISTENTE      */
/*                                                            */
/*  Se seu preload.js já usa contextBridge.exposeInMainWorld  */
/*  para outra API (ex: window.api), apenas acrescente as      */
/*  chaves "update" dentro do objeto que você já expõe — não   */
/*  crie uma segunda chamada a exposeInMainWorld com o mesmo    */
/*  nome, pois a segunda sobrescreve a primeira.                */
/************************************************************/
contextBridge.exposeInMainWorld('update', {
  // Dispara uma checagem manual (ex: botão "Verificar atualizações")
  checkNow: () => ipcRenderer.invoke('update:check-now'),

  // Reinicia o app para aplicar a atualização já baixada
  restartNow: () => ipcRenderer.invoke('update:restart-now'),

  // Versão atual do app (para tela "Sobre")
  getVersion: () => ipcRenderer.invoke('update:get-version'),

  // Assinaturas de eventos — cada uma retorna uma função de "unsubscribe",
  // então no React/Vue você pode limpar no useEffect/onUnmounted.
  onChecking: (cb) => {
    const listener = () => cb()
    ipcRenderer.on('update:checking', listener)
    return () => ipcRenderer.removeListener('update:checking', listener)
  },

  onAvailable: (cb) => {
    const listener = (_e, data) => cb(data) // { version }
    ipcRenderer.on('update:available', listener)
    return () => ipcRenderer.removeListener('update:available', listener)
  },

  onNotAvailable: (cb) => {
    const listener = (_e, data) => cb(data) // { version }
    ipcRenderer.on('update:not-available', listener)
    return () => ipcRenderer.removeListener('update:not-available', listener)
  },

  onProgress: (cb) => {
    const listener = (_e, data) => cb(data) // { percent, bytesPerSecond, transferred, total }
    ipcRenderer.on('update:progress', listener)
    return () => ipcRenderer.removeListener('update:progress', listener)
  },

  onDownloaded: (cb) => {
    const listener = (_e, data) => cb(data) // { version }
    ipcRenderer.on('update:downloaded', listener)
    return () => ipcRenderer.removeListener('update:downloaded', listener)
  },

  onError: (cb) => {
    const listener = (_e, data) => cb(data) // { message }
    ipcRenderer.on('update:error', listener)
    return () => ipcRenderer.removeListener('update:error', listener)
  }
})

/****************************************************************/
/*  EXEMPLO DE USO NO FRONTEND (React)                          */
/*                                                              */
/*  useEffect(() => {                                           */
/*    const offAvailable = window.update.onAvailable((d) => {   */
/*      console.log('Nova versão encontrada:', d.version)       */
/*    })                                                        */
/*    const offDownloaded = window.update.onDownloaded((d) => { */
/*      // Mostre um toast/modal: "Atualização pronta.          */
/*      // Reiniciar agora?" com um botão que chama:            */
/*      // window.update.restartNow()                           */
/*    })                                                        */
/*    return () => { offAvailable(); offDownloaded() }          */
/*  }, [])                                                      */
/****************************************************************/