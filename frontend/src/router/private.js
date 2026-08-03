import PlataformaView from '@/layouts/PlataformaView.vue'
import PublicView from '@/layouts/PublicView.vue'

const private_routes = [
  {
    path: '/intro',
    component: PublicView,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Intro',
        component: () =>
          import('../views/app/IntroPage.vue'),
        meta: {
          title: 'Introdução',
          subtitle: 'Bem-vindo à plataforma'
        }
      },
      {
        path: '/escolher-loja',
        name: 'EscolherLoja',
        component: () =>
          import('../views/app/Dono/EscolherLoja.vue'),
      },
    ]
  },

  {
    path: '/plataforma',
    component: PlataformaView,
    meta: { requiresAuth: true },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () =>
          import('../views/app/Dono/DashMain.vue'),
        meta: {
          title: 'Dashboard',
          subtitle: 'Visão geral do negócio'
        }
      },

      /* ================= PRODUTOS ================= */
      {
        path: '/cadastro-produtos',
        name: 'CadastroProdutos',
        component: () =>
          import('../views/app/Dono/Produtos/CadastroProdutos.vue'),
        meta: {
          title: 'Cadastro de Produtos',
          subtitle: 'Cadastre novos produtos'
        }
      },
      
      {
        path: '/cadastro-produtos-cotacao',
        name: 'CadastroProdutos',
        component: () =>
          import('../views/app/Dono/Produtos/CadastroProdutosCotacao.vue'),
        meta: {
          title: 'Cadastro de Produtos',
          subtitle: 'Cadastre novos produtos'
        }
      },

      {
        path: '/associar-produtos',
        name: 'AssociarProdutos',
        component: () =>
          import('../views/app/Dono/Produtos/AssociarProdutos.vue'),
        meta: {
          title: 'Associar Produtos',
          subtitle: 'Vincule produtos a embalagens (caixas, fardos ou pallets)'
        }
      },
      {
        path: '/consultar-produtos',
        name: 'ConsultarProdutos',
        component: () =>
          import('../views/app/Dono/Produtos/ConsultarProdutos.vue'),
        meta: {
          title: 'Consultar Produtos',
          subtitle: 'Pesquise produtos cadastrados'
        },
      },
      {
        path: '/produtos',
        name: 'ProdutosConsulta',
        component: () =>
          import('../views/app/Dono/Produtos/ProdutosConsulta.vue'),
        meta: {
          title: 'Consultar produtos',
          subtitle: 'Consulte cadastros na plataforma'
        }
      },
      {
        path: '/ipca',
        name: 'ipcaConsulta',
        component: () =>
          import('../views/app/Dono/Produtos/IpcaConsulta.vue'),
        meta: {
          title: 'Consultar IPCA',
          subtitle: 'Consulte a correção percentual dos produtos do mercado'
        }
      },
      {
        path: '/associados',
        name: 'AssociadosConsulta',
        component: () =>
          import('../views/app/Dono/Produtos/AssociadosConsulta.vue'),
        meta: {
          title: 'Consultar Associados',
          subtitle: 'Consulte os produtos composição cadastrados'
        }
      },
      {
        path: '/fornecedores',
        name: 'Fornecedores',
        component: () =>
          import('../views/app/Dono/Produtos/Fornecedores.vue'),
        meta: {
          title: 'Industrias',
          subtitle: 'Consulte e cadastre industrias.'
        }
      },
      {
        path: '/cadastro-fornecedores',
        name: 'CadastroFornecedores',
        component: () =>
          import('../views/app/Dono/Produtos/CadastroFornecedores.vue'),
        meta: {
          title: 'Cadastro de industria',
          subtitle: 'Registre uma nova industria, e associe aos produtos no momento de cadastro'
        }
      },
      {
        path: '/consulta-fornecedores',
        name: 'ConsultaFornecedores',
        component: () =>
          import('../views/app/Dono/Produtos/ConsultaFornecedores.vue'),
        meta: {
          title: 'Consulta de industrias',
          subtitle: 'Consulte e realize operações com as industrias cadastradas'
        }
      },
      {
        path: '/promocoes',
        name: 'Promocoes',
        component: () =>
          import('../views/app/Dono/Produtos/Promocoes.vue'),
        meta: {
          title: 'Promoções',
          subtitle: 'Gerencie promoções'
        }
      },
      {
        path: '/promocao-produtos',
        name: 'PromocaoProdutos',
        component: () =>
          import('../views/app/Dono/Produtos/PromocaoProdutos.vue'),
        meta: {
          title: 'Promoção',
          subtitle: 'Adicionar por código de barras'
        }
      },
      {
        path: '/promocao-lote',
        name: 'PromocaoLote',
        component: () =>
          import('../views/app/Dono/Produtos/PromocaoLote.vue'),
        meta: {
          title: 'Promoção',
          subtitle: 'Adicionar por lote'
        }
      },
      {
        path: '/consulta-promocoes',
        name: 'ConsultaPromocoes',
        component: () =>
          import('../views/app/Dono/Produtos/ConsultaPromocoes.vue'),
        meta: {
          title: 'Promoção',
          subtitle: 'Consultas de promoções'
        }
      },

      /* ================= ESTATÍSTICA ================= */
      {
        path: '/estatistica',
        name: 'Estatistica',
        component: () =>
          import('../views/app/Dono/Estatistica.vue'),
        meta: {
          title: 'Estatísticas',
          subtitle: 'Indicadores e métricas'
        }
      },

      /* ================= RELATÓRIOS ================= */
      {
        path: '/relatorios',
        name: 'Relatorios',
        component: () =>
          import('../views/app/Dono/Relatorios.vue'),
        meta: {
          title: 'Relatórios',
          subtitle: 'Relatórios gerenciais'
        }
      },

      /* ================= LOJA ================= */
      {
        path: '/minha-loja',
        name: 'MinhaLoja',
        component: () =>
          import('../views/app/Dono/Loja/MinhaLoja.vue'),
        meta: {
          title: 'Minha Loja',
          subtitle: 'Informações da loja'
        }
      },
      {
        path: '/cadastrar-loja',
        name: 'CadastrarLoja',
        component: () =>
          import('../views/app/Dono/Loja/CadastrarLoja.vue'),
        meta: {
          title: 'Cadastro de loja',
          subtitle: 'Cadastre novas lojas ao sistema'
        }
      },
      {
        path: '/consultar-loja',
        name: 'ConsultarLoja',
        component: () =>
          import('../views/app/Dono/Loja/ConsultarLoja.vue'),
        meta: {
          title: 'Consultar loja',
          subtitle: 'Consulte suas lojas cadastradas'
        }
      },
      {
        path: '/vendas',
        name: 'Vendas',
        component: () =>
          import('../views/app/Dono/Loja/Vendas.vue'),
        meta: {
          title: 'Vendas',
          subtitle: 'Controle de vendas'
        }
      },
      {
        path: '/pdvs',
        name: 'PDVs',
        component: () =>
          import('../views/app/Dono/Loja/PDVs.vue'),
        meta: {
          title: 'PDVs',
          subtitle: 'Pontos de venda'
        }
      },

      {
        path: '/cadastrar-pdv',
        name: 'CadastrarPDV',
        component: () =>
          import('../views/app/Dono/Loja/CadastrarPDV.vue'),
        meta: {
          title: 'Cadastro de PDV',
          subtitle: 'Cadastre novos Pontos de Venda na loja'
        }
      },

      {
        path: '/consultar-pdv',
        name: 'ConsultarPDV',
        component: () =>
          import('../views/app/Dono/Loja/ConsultarPDV.vue'),
        meta: {
          title: 'Consulta de PDV',
          subtitle: 'Consulte seus PDVs'
        }
      },

      {
        path: '/consultar-turnos',
        name: 'ConsultarTurnos',
        component: () =>
          import('../views/app/Dono/Loja/ConsultarTurnos.vue'),
        meta: {
          title: 'Consulta de turnos',
          subtitle: 'Consulte seus turnos de trabalho nos PDVs'
        }
      },

      {
        path: '/consultar-turnos/hoje',
        name: 'ConsultarTurnosHoje',
        component: () =>
          import('../views/app/Dono/Loja/ConsultarTurnosHoje.vue'),
        meta: {
          title: 'Turnos de hoje',
          subtitle: 'Consulte todos os turnos do dia atual'
        }
      },

      {
        path: '/consultar-turnos/abertos',
        name: 'ConsultarTurnosAbertos',
        component: () =>
          import('../views/app/Dono/Loja/ConsultarTurnosAbertos.vue'),
        meta: {
          title: 'Turnos abertos',
          subtitle: 'Consulte todos os turnos que estão abertos no momento'
        }
      },

      {
        path: '/consultar-turnos/fechados',
        name: 'ConsultarTurnosFechados',
        component: () =>
          import('../views/app/Dono/Loja/ConsultarTurnosFechados.vue'),
        meta: {
          title: 'Turnos fechados',
          subtitle: 'Consulte todos os turnos já encerrados'
        }
      },

      {
        path: '/consultar-turnos/revisao',
        name: 'ConsultarTurnosRevisao',
        component: () =>
          import('../views/app/Dono/Loja/ConsultarTurnosRevisao.vue'),
        meta: {
          title: 'Turnos em revisão',
          subtitle: 'Consulte turnos que estão em análise ou aguardando validação'
        }
      },

      {
        path: '/consultar-turnos/todos',
        name: 'ConsultarTodosTurnos',
        component: () =>
          import('../views/app/Dono/Loja/ConsultarTodosTurnos.vue'),
        meta: {
          title: 'Todos os turnos',
          subtitle: 'Visualize todos os turnos registrados no sistema'
        }
      },

      {
        path: '/itens-loja',
        name: 'ItensLoja',
        component: () =>
          import('../views/app/Dono/Loja/ConsultarItensLoja.vue'),
        meta: {
          title: 'Produtos na loja',
          subtitle: 'Consulte todos os produtos da sua loja'
        }
      },



      /* ================= ESTOQUE ================= */
      {
        path: '/cadastrar-estoque',
        name: 'CadastrarEstoque',
        component: () =>
          import('../views/app/Dono/Estoque/CadastrarEstoque.vue'),
        meta: {
          title: 'Cadastrar Estoque',
          subtitle: 'Entrada de produtos'
        }
      },
      {
        path: '/consultar-estoque',
        name: 'ConsultarEstoque',
        component: () =>
          import('../views/app/Dono/Estoque/ConsultarEstoque.vue'),
        meta: {
          title: 'Consultar Estoque',
          subtitle: 'Visualize o estoque'
        }
      },
      {
        path: '/estoque/entradas',
        name: 'ConsultarEntradas',
        component: () => import('../views/app/Dono/Estoque/ConsultarEntradas.vue'),
        meta: {
          title: 'Consultar Entradas',
          subtitle: 'Consulte as entradas no estoque'
        }
      },
      {
        path: '/estoque/saidas',
        name: 'ConsultarSaidas',
        component: () => import('../views/app/Dono/Estoque/ConsultarSaidas.vue'),
        meta: {
          title: 'Consultar Saídas',
          subtitle: 'Consulte as saídas do estoque'
        }
      },
      {
        path: '/estoque/produtos',
        name: 'ConsultarProdutosEstoque',
        component: () => import('../views/app/Dono/Estoque/ConsultarProdutosEstoque.vue'),
        meta: {
          title: 'Consultar Produtos',
          subtitle: 'Consulte produtos em estoque'
        }
      },
      {
        path: '/estoque/produtos-vencidos',
        name: 'ProdutosVencidos',
        component: () => import('../views/app/Dono/Estoque/ProdutosVencidos.vue'),
        meta: {
          title: 'Produtos Vencidos',
          subtitle: 'Consulte todos os produtos já vencidos'
        }
      },
      {
        path: '/estoque/produtos-proximos-alerta',
        name: 'ProdutosProximosAlertas',
        component: () => import('../views/app/Dono/Estoque/ProdutosProximosAlertas.vue'),
        meta: {
          title: 'Produtos Próximos de Vencer',
          subtitle: 'Consulte produtos que estão próximos da data de validade'
        }
      },
      {
        path: '/estoque/proximos-vencidos',
        name: 'ProdutosProximosVencimento',
        component: () => import('../views/app/Dono/Estoque/ProdutosProximosVencimento.vue'),
        meta: {
          title: 'Próximos e Vencidos',
          subtitle: 'Consulte produtos próximo de vencer e vencidos'
        }
      },
      {
        path: '/estoque/localizar',
        name: 'LocalizarProduto',
        component: () => import('../views/app/Dono/Estoque/LocalizarProduto.vue'),
        meta: {
          title: 'Localizar Produto',
          subtitle: 'Localize um produto na loja'
        }
      },
      {
        path: '/consultar-operacoes',
        name: 'ConsultarOperacoes',
        component: () =>
          import('../views/app/Estoquista/Estoque/ConsultarOperacoes.vue'),
        meta: {
          title: 'Estoque',
          subtitle: 'Consulte as operações possíveis de você fazer no estoque'
        }
      },

      {
        path: '/entrada-estoque',
        name: 'EntradaEstoque',
        component: () =>
          import('../views/app/Estoquista/Estoque/EntradaEstoque.vue'),
        meta: {
          title: 'Estoque',
          subtitle: 'Registre entradas no estoque'
        }
      },

      {
        path: '/saida-estoque',
        name: 'SaidaEstoque',
        component: () =>
          import('../views/app/Estoquista/Estoque/SaidaEstoque.vue'),
        meta: {
          title: 'Estoque',
          subtitle: 'Registre saídas no estoque'
        }
      },

      {
        path: '/entrada-manual-estoque',
        name: 'EntradaManual',
        component: () =>
          import('../views/app/Estoquista/Estoque/EntradaManual.vue'),
        meta: {
          title: 'Estoque',
          subtitle: 'Registre entradas no estoque'
        }
      },

      {
        path: '/entrada-xml-estoque',
        name: 'EntradaXML',
        component: () =>
          import('../views/app/Estoquista/Estoque/EntradaXML.vue'),
        meta: {
          title: 'Estoque',
          subtitle: 'Registre entradas automáticas com XML no estoque'
        }
      },

      {
        path: '/console-estoque',
        name: 'consoleEstoque',
        component: () =>
          import('../views/app/Dono/Estoque/consoleEstoque.vue'),
        meta: {
          title: 'Estoque',
          subtitle: 'Registre entradas no estoque'
        }
      },

      {
        path: '/imprimir-etiqueta',
        name: 'ImprimirEtiqueta',
        component: () =>
          import('../views/app/Estoquista/Estoque/ImprimirEtiqueta.vue'),
        meta: {
          title: 'Estoque',
          subtitle: 'Imprima a sua etiqueta para controlar saída de lote'
        }
      },


      

      /* ================= COLABORADORES ================= */

      {
        path: '/colaboradores-home',
        name: 'ColaboradoresHome',
        component: () => import('../views/app/Dono/Colaboradores/ColaboradoresHome.vue'),
        meta: {
          title: 'Colaboradores',
          subtitle: 'Registre e consulte colaboradores nessa loja.'
        }
      },

      {
        path: '/colaboradores-cadastro',
        name: 'CadastrarColaborador',
        component: () => import('../views/app/Dono/Colaboradores/CadastrarColaborador.vue'),
        meta: {
          title: 'Colaboradores',
          subtitle: 'Cadastre um novo colaborador nessa loja.'
        }
      },

      {
        path: '/colaboradores-consulta',
        name: 'ConsultarColaborador',
        component: () => import('../views/app/Dono/Colaboradores/ConsultarColaborador.vue'),
        meta: {
          title: 'Colaboradores',
          subtitle: 'Consulte seus colaboradores nessa loja.'
        }
      },

      /* ================= VENDEDORES ================= */
      {
        path: '/gestao-vendedores',
        name: 'GestaoVendedores',
        component: () =>
          import('../views/app/Dono/Vendedores/Gestao.vue'),
        meta: {
          title: 'Vendedores',
          subtitle: 'Gestão de vendedores'
        }
      },
      {
        path: '/consultar-vendedores',
        name: 'VendedoresConsulta',
        component: () =>
          import('../views/app/Dono/Vendedores/Consultar.vue'),
        meta: {
          title: 'Consultar Vendedores',
          subtitle: 'Consultar vendedores cadastrados na MarketVizium'
        }
      },
      {
        path: '/meus-vendedores',
        name: 'MeusVendedores',
        component: () =>
          import('../views/app/Dono/Vendedores/MeusVendedores.vue'),
        meta: {
          title: 'Associar Vendedor',
          subtitle: 'Associe vendedores a sua loja'
        }
      },
      /* ================= CONFIGURAÇÕES ================= */
      {
        path: '/configuracoes',
        name: 'Configuracoes',
        component: () =>
          import('../views/app/Dono/Configuracoes.vue'),
        meta: {
          title: 'Configurações',
          subtitle: 'Preferências do sistema'
        }
      },

      /* ================= COTAÇÃO ================= */
      {
        path: '/operacoes',
        name: 'OperacoesCotacao',
        component: () =>
          import('../views/app/Dono/Cotacao/Operacoes.vue'),
        meta: {
          title: 'Operações',
          subtitle: 'Operações de cotação'
        }
      },
      {
        path: '/dashboard-cotacao',
        name: 'DashboardCotacao',
        component: () =>
          import('../views/app/Dono/Cotacao/DashboardCotacao.vue'),
        meta: {
          title: 'Dashboard cotação',
          subtitle: 'Analise as operações e estatísticas da sua cotação'
        }
      },
      {
        path: '/consultas',
        name: 'ConsultasCotacao',
        component: () =>
          import('../views/app/Dono/Cotacao/Consultas.vue'),
        meta: {
          title: 'Consultas',
          subtitle: 'Consultas de cotações'
        }
      },
      {
        path: '/cotacao/registrar',
        name: 'RegistrarCotacao',
        component: () =>
          import('../views/app/Dono/Cotacao/RegistrarCotacao.vue'),
        meta: {
          title: 'Registrar Cotação',
          subtitle: 'Crie uma nova cotação'
        }
      },
      {
        path: '/cotacao/adicionar-produto',
        name: 'AdicionarProdutoCotacao',
        component: () =>
          import('../views/app/Dono/Cotacao/AdicionarProduto.vue'),
        meta: {
          title: 'Selecione sua cotação para adicionar produtos',
          subtitle: 'Selecione a cotação, e insira os produtos à sua cotação.'
        }
      },
      {
        path: '/cotacao/selecionar-ofertas',
        name: 'SelecionarOfertasCotacao',
        component: () =>
          import('../views/app/Dono/Cotacao/SelecionarOfertas.vue'),
        meta: {
          title: 'Selecionar Ofertas',
          subtitle: 'Selecionar ofertas da cotação'
        }
      },
      {
        path: '/cotacao/adicionar-itens',
        name: 'AdicionarItensCotacao',
        component: () =>
          import('../views/app/Dono/Cotacao/AdicionarItensCotacao.vue'),
        meta: {
          title: 'Adicione à cotação',
          subtitle: 'Adicione seus produtos cadastrados à cotação'
        }
      },
      {
        path: '/cotacao/itens',
        name: 'ConsultarItensCotacao',
        component: () => import('@/views/app/Dono/Cotacao/ConsultarItens.vue'),
        meta: {
          title: 'Consultar itens',
          subtitle: 'Consultar itens adicionados à cotação'
        }
      },
      {
        path: '/cotacao/ofertas',
        name: 'ConsultarOfertasCotacao',
        component: () => import('@/views/app/Dono/Cotacao/ConsultarOfertas.vue'),
        meta: {
          title: 'Consultar ofertas',
          subtitle: 'Consulte todas as ofertas de sua cotação'
        }
      },
      {
        path: '/cotacao/ofertas-principal',
        name: 'ConsultaOfertasMain',
        component: () => import('@/views/app/Dono/Cotacao/ConsultaOfertasMain.vue'),
        meta: {
          title: 'Consultar ofertas',
          subtitle: 'Consulte todas as ofertas de sua cotação'
        }
      },
      {
        path: '/cotacao/historico',
        name: 'ConsultarHistoricoCotacao',
        component: () => import('@/views/app/Dono/Cotacao/ConsultarHistorico.vue'),
        meta: {
          title: 'Consultar histórico',
          subtitle: 'Consulte o histórico da cotação'
        }
      },
      {
        path: '/cotacao/historico-principal',
        name: 'ConsultarHistoricoMain',
        component: () => import('@/views/app/Dono/Cotacao/ConsultarHistoricoMain.vue'),
        meta: {
          title: 'Consultar histórico',
          subtitle: 'Consulte o histórico da cotação'
        }
      },
      {
        path: '/cotacao/consulta-itens-home',
        name: 'ConsultaItensmain',
        component: () => import('@/views/app/Dono/Cotacao/ConsultaItensmain.vue'),
        meta: {
          title: 'Consultar Produtos na Cotação',
          subtitle: 'Consulte produtos adicionados à cotação'
        }
      },
      {
        path: '/cotacao/consulta-cotacoes-console',
        name: 'ConsultarCotacoesConsole',
        component: () => import('@/views/app/Dono/Cotacao/consultarCotacoesConsole.vue'),
        meta: {
          title: 'Consultar cotações para acessar console',
          subtitle: 'Consulte as cotações, e acesse o console referente a ela para realizar as operações'
        }
      },
      {
        path: '/cotacao/console',
        name: 'consoleCotacao',
        component: () => import('@/views/app/Dono/Cotacao/consoleCotacao.vue'),
        meta: {
          title: 'Console',
          subtitle: 'Monitore e opere sua cotação'
        }
      },

      {
        path: '/marviz-trends-var',
        name: 'TrendsVarejor',
        component: () => import('@/views/app/Dono/Cotacao/TrendsVarejo.vue'),
        meta: {
            title: 'Participe do Marviz Trends',
            subtitle: 'Encontre as melhores ofertas de vendedores e adicione em seus pedidos ou cotações.'
        }
      },

      {
        path: '/cons-pedido-direto',
        name: 'ConsPedidosDiretos',
        component: () => import('@/views/app/Dono/Cotacao/ConsPedidosDiretos.vue'),
        meta: {
            title: 'Consulte seus pedidos diretos',
            subtitle: 'Faça seus pedidos sem precisar de cotação'
        }
      },

      {
      path: '/criar-pedido-direto',
      name: 'CriarPedidoDireto',
      component: () => import('@/views/app/Dono/Cotacao/criarPedidoDireto.vue'),
      meta: {
          title: 'Cadastre seu pedido direto',
          subtitle: 'Cadastre um novo pedido direto para enviar demandas sem precisar de cotação'
      }
    },

    {
      path: '/pedido-direto',
      name: 'PedidoDireto',
      component: () => import('@/views/app/Dono/Cotacao/PedidoDireto.vue'),
      meta: {
          title: 'Pedido direto',
          subtitle: 'Adicione produtos cadastrados ou não cadastrados e faça seus pedidos sem precisar de cotação.'
      }
    },


      /* ================= SUPORTE ================= */
      {
        path: '/suporte',
        name: 'Suporte',
        component: () =>
          import('../views/app/Dono/Suporte.vue'),
        meta: {
          title: 'Suporte',
          subtitle: 'Central de ajuda'
        }
      },

      /* ================= USUÁRIO =================== */

      {
        path: '/minha-conta',
        name: 'minhaConta',
        component: () => import('@/views/app/Dono/minhaConta.vue'),
        meta: {
          title: 'Minha Conta',
          subtitle: 'Consulte e edite os dados do seu perfil'
        }
      },


      /* ================= FISCAL =================== */

      {
        path: '/dashboard-fiscal',
        name: 'fiscalMain',
        component: () => import('@/views/app/Dono/Fiscal/FiscalMain.vue'),
        meta: {
          title: 'Dashboard Fiscal',
          subtitle: 'Consulte e monitores atividades fiscais'
        }
      },

      {
        path: '/emissao-fiscal',
        name: 'emissaoFiscal',
        component: () => import('@/views/app/Dono/Fiscal/EmissaoFiscal.vue'),
        meta: {
          title: 'Emissão fiscal',
          subtitle: 'Realize operações com NF-e e NFC-e'
        }
      },

      {
        path: '/gestao-xml',
        name: 'GestaoXML',
        component: () => import('@/views/app/Dono/Fiscal/GestaoXML.vue'),
        meta: {
          title: 'Gestão XML',
          subtitle: 'Realize operações com os XMLs da loja'
        }
      },

      {
        path: '/certificado-digital',
        name: 'certificadoDigital',
        component: () => import('@/views/app/Dono/Fiscal/CertificadoDigital.vue'),
        meta: {
          title: 'Certificado Digital',
          subtitle: 'Consulte ou configura o seu certificado digital para integração com sistema SEFAZ'
        }
      },

      {
        path: '/monitor-fiscal',
        name: 'monitorFiscal',
        component: () => import('@/views/app/Dono/Fiscal/MonitorFiscal.vue'),
        meta: {
          title: 'Monitor Fiscal',
          subtitle: 'Consulte envios e devolutivas para a SEFAZ e seus respectivos resultados'
        }
      },
      

    ]
  }
]

export default private_routes
