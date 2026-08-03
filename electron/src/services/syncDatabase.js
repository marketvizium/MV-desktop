const { api }                                        = require('../../api')           //Fazer requisições 
const Store                                          = require('electron-store')      //Chama a classe store para persistencia de dados
const { db }                                         = require('../db/createTables')  //Pego a instancia do banco de dados no sistema
const { VARIAVEIS_GLOBAIS_SISTEMA }                  = require('../../global')        //Pega todas as variáveis globais do sistema
const { jwtDecode }                                  = require('jwt-decode')          //Função que decriptografa o token e pega os dados do usuário
const TRINTA_SEGUNDOS                                = 1000 * 30
const DOIS_SEGUNDOS                                  = 1000 * 2
const CINCO_MINUTOS                                  = 1000 * 60 * 5
const store                                          = new Store()                    //Instância da Sotre para persistencia de dados
const { salvarProdutosCadastro }                     = require('../db/queries')       //Utilizado para inserir produtos cadastrados no db
const { salvarItensEstoque }                         = require('../db/queries')       //Utilizado para inserir itens no estoque no db
const { buscarEntradasNaoSincronizados }             = require('../db/queries')       //Utilizado para buscar entradas não snicronizadas
const { buscarSaidasNaoSincronizados }               = require('../db/queries')       //Utilizado para buscar saídas nao sincronizadas
const { salvarItensEstoqueLocal }                    = require('../db/queries')       //Dá a entrada no estoque
const { marcarEntradasComoSincronizadas }            = require('../db/queries')       //Marca as entradas como sincronizadas no servidor
const { marcarSaidasComoSincronizadas }              = require('../db/queries')       //Utilizado para marcar saidas como sincronizadas
const { atualizarEstoqueAposSaida }                  = require('../db/queries')       //Utilizado para marcar saidas como sincronizadas
const { GetProdutosPendentesSyncGeral }              = require('../db/queries')       //Pega os produtos que tem sync 0
const { MarcarProdutosComoSincronizados }            = require('../db/queries')       //Pega os produtos que tem sync 0
const { salvarFornecedores }                         = require('../db/queries')       //Sincroniza os fornecedor
const { GetFornecedoresPendentes }                   = require('../db/queries')       //Consulta fornecedores não sincronizados
const { ConfirmarSincronizacaoLote }                 = require('../db/queries')       //Faz o sync de fornecedors
const { GetProdutosCompPendentes }                   = require('../db/queries')       //Pega os produtos não sincronizados
const { ConfirmarSincronizacaoLoteComp }             = require('../db/queries')       //Sincroniza os novos produtos
const { salvarProdutosComposicao }                   = require('../db/queries')       //Sincroniza os novos produtos
const { ConfirmarEdicaoDelecaoLote }                 = require('../db/queries')       //Atualiza o status para sincronizado de deletar ou atualizar
const { GetProdutosCompAlteradosOuDeletados }        = require('../db/queries')       //Consulta todos os produtos pronto pra sincronizar atualizar/deletar
const { GetProdutosCadastradosAlteradosOuDeletados } = require('../db/queries')       //Consulta todos os produtos pronto pra sincronizar atualizar/deletar
const { ConfirmarEdicaoDelecaoProdutoLote }          = require('../db/queries')       //Atualiza o status para sincronizado de deletar ou atualizar
//Aqui eu chamo todas as funções de sincronização periódicamente
//As outras funções são escravas dessa
async function syncMestre(){


    //Primeiro Sync ao Iniciar
    await syncGetProductsCadastrados()
    await syncGetProdutosNoEstoque()
    await synGetFornecedores()
    await syncGetProdutosComposicao()


    setInterval(async () => {
        if(!VARIAVEIS_GLOBAIS_SISTEMA.FLAG_SISTEMA_ONLINE) return
        await syncGetProductsCadastrados()
    }, TRINTA_SEGUNDOS)

    setInterval(async () => {
        if(!VARIAVEIS_GLOBAIS_SISTEMA.FLAG_SISTEMA_ONLINE) return
        await syncGetProdutosNoEstoque()
    }, TRINTA_SEGUNDOS)

    setInterval(async () => {
        if(!VARIAVEIS_GLOBAIS_SISTEMA.FLAG_SISTEMA_ONLINE) return
        await syncSetProdutosNoEstoque()
    }, TRINTA_SEGUNDOS)

    setInterval(async () => {
        if(!VARIAVEIS_GLOBAIS_SISTEMA.FLAG_SISTEMA_ONLINE) return
        await syncSetFornecedores()
    }, DOIS_SEGUNDOS)

    setInterval(async () => {
        if(!VARIAVEIS_GLOBAIS_SISTEMA.FLAG_SISTEMA_ONLINE) return
        await syncSetProdutosCadastrados()
    }, DOIS_SEGUNDOS)

    setInterval(async () => {
        if(!VARIAVEIS_GLOBAIS_SISTEMA.FLAG_SISTEMA_ONLINE) return
        await syncSetProdutosComposicao()
    }, DOIS_SEGUNDOS)

    setInterval(async () => {
        if(!VARIAVEIS_GLOBAIS_SISTEMA.FLAG_SISTEMA_ONLINE) return
        await syncUpdateDeleteProdutosComposicao()
    }, DOIS_SEGUNDOS)

    setInterval(async () => {
        if(!VARIAVEIS_GLOBAIS_SISTEMA.FLAG_SISTEMA_ONLINE) return
        await syncUpdateDeleteProdutosCadastrados()
    }, DOIS_SEGUNDOS)

    setInterval(async () => {
        if(!VARIAVEIS_GLOBAIS_SISTEMA.FLAG_SISTEMA_ONLINE) return
        await synGetFornecedores()
    }, TRINTA_SEGUNDOS)

    setInterval(async () => {
        if(!VARIAVEIS_GLOBAIS_SISTEMA.FLAG_SISTEMA_ONLINE) return
        await syncGetProdutosComposicao()
    }, TRINTA_SEGUNDOS)
}


//AAAAAAAAAAAAAAAAAAAAAAAAA - COntinuar depois a sincronização e atualização, o delete funciona, mas a atualização não envia, fica pendente,
//e quando sincronizo vem o antigo pq n atualizar somado com o pendente, e fica duplicado, fica o meu cadastrado no banco local somado com o 
//do servidor.


//Faço o get dos produtos cadastrados. Esses serão os auxiliares se caso o estoque der
//entrada do produto na loja, e estiver sem internet nesse período. Se caso um produto não
//houver em estoque, estiver offline e aquele produto não foi sincronizado, eu consulto em 
//produtos cadastrados para dar a baixa do produto no caixa, e não parar por falta de internet.
//
//Ou seja, esse db serve para sincronizar com o banco principal de cadastrados. Dessa forma o PDV
//nunca vai parar.
async function syncGetProductsCadastrados(){

    //Só vou aceitar a requisição se já estiver com um id da loja e um id do terminal
    //configurado.
    const loja = store.get('loja')
    if(!loja.id_loja) return

    try{
        const dados = await api.get(`/mvpu/produto/consultarProdutos/${loja.id_loja}`)

        const produtos = dados.data.data

        if (produtos && produtos.length > 0) {
            await salvarProdutosCadastro(produtos);
            console.log("Sincronização concluída com sucesso!");
        }

    }catch(e){
        //console.log("Erro requisição", e)
    }
}

async function syncSetProdutosNoEstoque(){
    const loja = store.get('loja')
    if(!loja.id_loja) return

    setTimeout(async () => {
        try{
    
            const entradasNaoSync = await buscarEntradasNaoSincronizados()
            const saidasNaoSync   = await buscarSaidasNaoSincronizados()
    
            if(!entradasNaoSync.length && !saidasNaoSync.length){
                console.log("Sem entradas e saídas para sincronizar")
                return
            }
    
            //sincroniza o estoque (estoque não sincroniza via cliente->servidor, eu só recebo o estoque do servidor)

            if(entradasNaoSync.length){

                //sincroniza as entradas (A entrada atualiza no servidor e altera lá nas quantidades)
                //ao final atualiza as entradas sincronizadas
    
                const arrayPayload = entradasNaoSync.map(prod =>{
                    let obj = {
                        codigo_barra    : prod.codigo_barra,
                        id_loja         : prod.id_loja,
                        lote            : prod.lote,
                        quantidade      : prod.quantidade,
                        preco_custo     : prod.preco_custo,
                        data_validade   : prod.data_validade,
                        responsavel     : prod.responsavel,
                        cnpj            : prod.cnpj,
                        nome_fornecedor : prod.nome_fornecedor,
                    }
    
                    return obj
                })
    
                const payloadEntrada = {
                    arrayEntrada: arrayPayload
                }
              
                await api.post(`/mvpu/estoque/entradaManualProduto`, payloadEntrada);
    
                await marcarEntradasComoSincronizadas(entradasNaoSync)
                await salvarItensEstoqueLocal(entradasNaoSync)
            }
    
            if(saidasNaoSync.length){
                //sincroniza as saídas (A saída atualiza no servidor e altera lá as quantidades)
                //ao final atualiza as saídas sincronizadas

                const loja = store.get('loja')
                if(!loja.id_loja)
                    return

                const arrayPayloadSaida = saidasNaoSync.map(prod=>{
                    let obj = {
                        codigo_barra: prod.codigo_barra,
                        lote        : prod.lote,
                        quantidade  : prod.quantidade,
                        responsavel : prod.responsavel,
                    }

                    return obj
                })

                const payloadSaida = {
                    Arraysaidas: arrayPayloadSaida
                }

                await api.post(`/mvpu/estoque/saidaEstoque/${loja.id_loja}`, payloadSaida);
                await marcarSaidasComoSincronizadas(saidasNaoSync)
                await atualizarEstoqueAposSaida(saidasNaoSync)
            }
            
    
        }catch(e){
            console.log("Erro requisição", e)
        }
    }, 500);
}

async function syncGetProdutosNoEstoque(){
    const loja = store.get('loja')
    if(!loja.id_loja) return

    try{

        const entradasNaoSync = await buscarEntradasNaoSincronizados()
        const saidasNaoSync   = await buscarSaidasNaoSincronizados()
        

        if(entradasNaoSync.length || saidasNaoSync.length){
            console.log("Existe entradas ou saídas não sincronizadas")
            syncSetProdutosNoEstoque()
            return
        }

        const dados = await api.get(`/mvpu/estoque/consultarEstoque/${loja.id_loja}`)
        const produtos = dados.data.data


        if (produtos && produtos.length > 0) {
            await salvarItensEstoque(produtos);
            console.log("Sincronização estoque concluída com sucesso!");
        }

    }catch(e){
        console.log("Erro requisição", e)
    }
}

//PROVISORIO: CADASTRO POR ARRAY
async function syncSetProdutosCadastrados(){
    try{
        let produtosNotSync = await GetProdutosPendentesSyncGeral()
        
        let quantidade_p = produtosNotSync.total_pendente
        produtosNotSync  = produtosNotSync.dados
        
        console.log(produtosNotSync, "NOT SYNC AÍ")
        
        if(quantidade_p>0){
            const objProdOnline = {
                nome              : produtosNotSync[0].nome,
                nome_fornecedor   : produtosNotSync[0].nome_fornecedor,
                cnpj              : produtosNotSync[0].cnpj,
                codigo_barra      : produtosNotSync[0].codigo_barra,
                preco_custo       : produtosNotSync[0].preco_custo,
                ajuste_automatico : produtosNotSync[0].ajuste_automatico,
                controle_lote     : produtosNotSync[0].controle_lote,
                preco_venda       : produtosNotSync[0].preco_venda,
                ncm               : produtosNotSync[0].ncm,
                margem            : produtosNotSync[0].margem,
                categoria         : produtosNotSync[0].categoria,
                busca_rapida      : produtosNotSync[0].busca_rapida,
                gondula_estoque   : produtosNotSync[0].gondula_estoque,
                gondula_loja      : produtosNotSync[0].gondula_loja,
                id_loja           : produtosNotSync[0].id_loja,
            } 

            const objProdSyncLocal = {
                id_item           : produtosNotSync[0].id_item, //a diferença ta aqui
                nome              : produtosNotSync[0].nome,
                nome_fornecedor   : produtosNotSync[0].nome_fornecedor,
                cnpj              : produtosNotSync[0].cnpj,
                codigo_barra      : produtosNotSync[0].codigo_barra,
                preco_custo       : produtosNotSync[0].preco_custo,
                ajuste_automatico : produtosNotSync[0].ajuste_automatico,
                controle_lote     : produtosNotSync[0].controle_lote,
                preco_venda       : produtosNotSync[0].preco_venda,
                ncm               : produtosNotSync[0].ncm,
                margem            : produtosNotSync[0].margem,
                categoria         : produtosNotSync[0].categoria,
                busca_rapida      : produtosNotSync[0].busca_rapida,
                gondula_estoque   : produtosNotSync[0].gondula_estoque,
                gondula_loja      : produtosNotSync[0].gondula_loja,
                id_loja           : produtosNotSync[0].id_loja,
            } 
            
            const retorno = await api.post('/mvpu/produto/cadastro', objProdOnline)
            console.log("SYNC DATABASE", retorno)

            MarcarProdutosComoSincronizados([objProdSyncLocal])

        }


    }catch(e){
        console.log(e)
    }
}

async function synGetFornecedores(){
    try{

        const loja = store.get('loja')
        if(!loja.id_loja) return

        const produtos = await api.get(`/mvpu/produto/consultarFornecedores/${loja.id_loja}`)
        const listaFornecedores = produtos.data.data;

        if(!listaFornecedores.length){
            console.log("Sem fornecedores para sincronizar")
            return
        }

        // Correção do Loop: Adicionando a flag sync em cada objeto
        const fornecedoresParaSalvar = listaFornecedores.map(f => ({
            ...f,
            id_loja: loja.id_loja,
            sync: 1 // Garante que tudo que vem da nuvem está marcado como sincronizado
        }))

        console.log(fornecedoresParaSalvar)
        
        await salvarFornecedores(fornecedoresParaSalvar)
        console.log("Fornecedores salvos e sincronizados")

    }catch(e){
        console.log(e)
    }
}

//VC NAO INTEGROU NADA NA INTERFACE, AGORA COMECE A INTEGRRAR

//PROVISORIO: CADASTRO POR ARRAY
async function syncSetFornecedores(){
    try{

        const fornecedoresNotSync = await GetFornecedoresPendentes()

        if(fornecedoresNotSync.length){

            const obj = {
                nome_fornecedor : fornecedoresNotSync[0].nome_fornecedor,
                razao_social : fornecedoresNotSync[0].razao_social,
                nome_fantasia : fornecedoresNotSync[0].nome_fantasia,
                cnpj : fornecedoresNotSync[0].cnpj,
                status : fornecedoresNotSync[0].status,
                email_principal : fornecedoresNotSync[0].email_principal,
                telefone_principal : fornecedoresNotSync[0].telefone_principal,
            }

            const objLocal = {
                id_item : fornecedoresNotSync[0].id_item,
                cnpj : fornecedoresNotSync[0].cnpj,
            }

            console.log(objLocal)
            const loja = store.get('loja')
            if(!loja.id_loja) return

            console.log("AAAAAAAAAAAAAAA", obj)
            await api.post(`/mvpu/produto/cadastrarFornecedor/${loja.id_loja}`, obj)
            console.log("SINCRONIZOU")
            await ConfirmarSincronizacaoLote([objLocal])
            console.log("ATUALIZOU")
            
        }        

    }catch(e){
        console.log(e)
    }
}

async function syncSetProdutosComposicao() {
    const loja = store.get('loja');
    if (!loja.id_loja) return;

    try {
        // 1. Busca todos os produtos de composição que estão com sync = 0
        const composicoesPendentes = await GetProdutosCompPendentes();

        // 2. Se não houver nada para sincronizar, encerra a função
        if (!composicoesPendentes || composicoesPendentes.length === 0) {
            console.log("Nenhuma composição pendente de sincronização.");
            return;
        }

        // 3. Pega o primeiro valor do array (index 0) para enviar um por um
        const itemParaSync = composicoesPendentes[0];

        // 4. Monta o payload conforme a estrutura da sua rota
        const payload = {
            id_loja: loja.id_loja,
            codigo_barra_prod: itemParaSync.codigo_barra_prod,
            codigo_barra_comp: itemParaSync.codigo_barra_comp,
            nome_composicao: itemParaSync.nome_composicao,
            quantidade: itemParaSync.quantidade
        };

        console.log("Sincronizando composição:", itemParaSync.nome_composicao);

        // 5. Envia para o backend
        const response = await api.post('/mvpu/produto/cadastroAssociado', payload);

        // 6. Se o servidor responder com sucesso, atualizamos o banco local
        if (response.status === 200 || response.data.sucesso) {
            console.log("✅ Enviado ao servidor com sucesso!");

            // Chamamos a função de confirmação de lote passando o item dentro de um Array [ ]
            await ConfirmarSincronizacaoLoteComp([itemParaSync]);
            
            console.log("✅ Status local atualizado para 'sync'.");
        }

    } catch (error) {
        console.log(error)
        console.log("❌ Erro na sincronização de composição:", error.message);
        // Opcional: Adicionar um retry ou log de erro específico aqui
    }
}

async function syncGetProdutosComposicao() {
    // 1. Só aceita a requisição se a loja estiver configurada
    const loja = store.get('loja');
    if (!loja || !loja.id_loja) return;

    try {
        console.log("Iniciando consulta de composições no servidor...");

        // 2. Realiza a chamada para a rota específica (passando o id da loja)
        const response = await api.get(`/mvpu/produto/consultarComposicao/${loja.id_loja}`);

        // 3. Extrai o array de dados conforme a estrutura do seu payload
        const produtosAPI = response.data.data;

        if (produtosAPI && produtosAPI.length > 0) {
            // 4. Mapeia os elementos para complementar com o id_loja antes de salvar
            const produtosFormatados = produtosAPI.map(produtoComp => {
                return {
                    ...produtoComp,
                    id_loja: loja.id_loja,
                    status_interno: 'sync' // Já marca como sincronizado pois veio da API
                };
            });

            // 5. Envia a lista completa para a função de salvamento local
            await salvarProdutosComposicao(produtosFormatados);
            
            console.log("Sincronização de composições concluída com sucesso!");
        } else {
            console.log("Nenhuma composição encontrada no servidor para esta loja.");
        }

    } catch (e) {
        console.error("Erro ao sincronizar composições do servidor:", e.message);
        // Opcional: tratar erros específicos de conexão aqui
    }
}

async function syncGetProdutosComposicao() {
    // 1. Só aceita a requisição se a loja estiver configurada
    const loja = store.get('loja');
    if (!loja || !loja.id_loja) return;

    try {
        console.log("Iniciando consulta de composições no servidor...");

        // 2. Realiza a chamada para a rota específica (passando o id da loja)
        const response = await api.get(`/mvpu/produto/consultarComposicao/${loja.id_loja}`);

        // 3. Extrai o array de dados conforme a estrutura do seu payload
        const produtosAPI = response.data.data;

        if (produtosAPI && produtosAPI.length > 0) {
            // 4. Mapeia os elementos para complementar com o id_loja antes de salvar
            const produtosFormatados = produtosAPI.map(produtoComp => {
                return {
                    ...produtoComp,
                    id_loja: loja.id_loja,
                    status_interno: 'sync' // Já marca como sincronizado pois veio da API
                };
            });

            // 5. Envia a lista completa para a função de salvamento local
            await salvarProdutosComposicao(produtosFormatados);
            
            console.log("Sincronização de composições concluída com sucesso!");
        } else {
            console.log("Nenhuma composição encontrada no servidor para esta loja.");
        }

    } catch (e) {
        console.error("Erro ao sincronizar composições do servidor:", e.message);
        // Opcional: tratar erros específicos de conexão aqui
    }
}

async function syncUpdateDeleteProdutosComposicao() {
    const loja = store.get('loja');
    if (!loja || !loja.id_loja) return;

    try {
        // 1. Busca os itens que foram editados (2) ou deletados (3)
        const pendentes = await GetProdutosCompAlteradosOuDeletados(loja.id_loja);

        // 2. Se a fila estiver vazia, encerra
        if (!pendentes || pendentes.length === 0) {
            console.log("Nenhuma alteração ou exclusão pendente.");
            return;
        }

        // 3. Pega o primeiro da fila para processar
        const itemParaSync = pendentes[0];
        
        // Garantimos que o id_loja do payload seja o atual da store
        itemParaSync.id_loja = loja.id_loja;

        let response;

        // 4. Decide a rota e o método baseado no valor de 'sync'
        if (itemParaSync.status_interno === 'deletar') {
            // CASO: DELEÇÃO
            console.log(`Sincronizando DELEÇÃO: ${itemParaSync.nome_composicao}`);
            // Na rota delete, enviamos o objeto dentro da propriedade 'data' conforme seu exemplo
            response = await api.delete(`/mvpu/produto/deletarAssociado/${loja.id_loja}`, { 
                data: itemParaSync 
            });
        } 
        else if (itemParaSync.status_interno === 'atualizar') {
            // CASO: EDIÇÃO
            console.log(`Sincronizando EDIÇÃO: ${itemParaSync.nome_composicao}`);
            response = await api.put(`/mvpu/produto/editarAssociado/${loja.id_loja}`, itemParaSync);
        }

        // 5. Se o servidor responder com sucesso (200 ou flag de sucesso)
        if (response && (response.status === 200 || response.data.sucesso)) {
            console.log(`✅ Servidor processou ${itemParaSync.status_interno === 'deletar' ? 'deleção' : 'edição'} com sucesso.`);

            // 6. Atualiza o banco local: novos_produtos_comp (sync=1) e produto_comp (status='sync')
            await ConfirmarEdicaoDelecaoLote([itemParaSync]);

            console.log("✅ Banco local atualizado.");
        }

    } catch (error) {
        console.error("❌ Erro na sincronização de Update/Delete:", error.message);
        // Em caso de erro 404 ou 400 (erro lógico), você pode decidir se pula o item 
        // ou se para a sincronização aqui.
    }
}

async function syncUpdateDeleteProdutosCadastrados() {
    const loja = store.get('loja');
    if (!loja || !loja.id_loja) return;

    try {
        const pendentes = await GetProdutosCadastradosAlteradosOuDeletados(loja.id_loja);

        if (!pendentes || pendentes.length === 0) {
            console.log("Nenhuma alteração ou exclusão de produto pendente.");
            return;
        }

        const itemParaSync = pendentes[0];
        let response;
        let itensProcessados = []; 

        if (itemParaSync.status_interno === 'deletar') {
            const produtosParaDeletar = pendentes.filter(p => p.status_interno === 'deletar');
            const array_deletar = produtosParaDeletar.map(p => ({ codigo_barra: p.codigo_barra }));

            console.log(`Sincronizando DELEÇÃO em lote: ${array_deletar.length} itens.`);

            response = await api.delete(`/mvpu/produto/deletarProduto/${loja.id_loja}`, { 
                data: { itens_deletados: array_deletar } 
            });

            itensProcessados = produtosParaDeletar;
        } 
        else if (itemParaSync.status_interno === 'atualizar') {
            console.log(`Sincronizando EDIÇÃO de Produto: ${itemParaSync.nome}`);
            
            // --- CORREÇÃO AQUI: CLONAR O OBJETO ---
            // Usamos o Spread Operator (...) para criar um novo objeto na memória
            const productForAPI = { ...itemParaSync };
            productForAPI.id_loja = loja.id_loja;

            const payloadForAPI = {
                id_produto: productForAPI.id_produto,
                id_loja: productForAPI.id_loja,
                id_fornecedor: productForAPI.id_fornecedor,
                nome: productForAPI.nome,
                codigo_barra: productForAPI.codigo_barra,
                categoria: productForAPI.categoria,
                ncm: productForAPI.ncm,
                busca_rapida: productForAPI.busca_rapida,
                preco_custo: productForAPI.preco_custo,
                margem: productForAPI.margem,
                preco_venda: productForAPI.preco_venda,
                porcentagem_promo: productForAPI.porcentagem_promo,
                ultimo_reajuste: productForAPI.ultimo_reajuste,
                gondula_estoque: productForAPI.gondula_estoque,
                gondula_loja: productForAPI.gondula_loja,
                inicio_promo: productForAPI.inicio_promo,
                fim_promo: productForAPI.fim_promo,
                ajuste_automatico: productForAPI.ajuste_automatico,
                controle_lote: productForAPI.controle_lote0
            }

            console.log(productForAPI, "ADSADASD")

            response = await api.put(`/mvpu/produto/editarProduto`, payloadForAPI);
            
            // O itensProcessados mantém o itemParaSync original (com id_item e status_interno)
            itensProcessados = [itemParaSync];
        }

        if (response && (response.status === 200 || response.data.sucesso)) {
            console.log(`✅ Servidor processou com sucesso.`);
            
            // Agora o ConfirmarEdicaoDelecaoProdutoLote terá o id_item e id_loja necessários
            await ConfirmarEdicaoDelecaoProdutoLote(itensProcessados);

            console.log(`✅ ${itensProcessados.length} item(ns) atualizado(s) localmente para 'sync'.`);
        }

    } catch (error) {
        console.error("❌ Erro na sincronização de Produtos:", error.message);
    }
}

module.exports = { 
    syncMestre,
}