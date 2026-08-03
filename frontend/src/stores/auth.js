import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import { api } from '@/services/api'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  persist: true,

  state: () => ({
    token: localStorage.getItem('token') || null,

    user: localStorage.getItem('token')
      ? jwtDecode(localStorage.getItem('token'))
      : null,

    iDloja: Number(localStorage.getItem('eimrd')) || null,

    // NOVO
    modulos: JSON.parse(localStorage.getItem('modulos')) || [],
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,

    usuario: (state) => state.user,

    id_usuario: (state) => state.user ? state.user.id_usuario : null,

    id_loja: (state) => state.iDloja,

    menuPermitido: (state) => {

      const menus = [
        {
          nome_modulo: 'dashboard',
          name: "Dashboard",
          icon: "pi pi-home",
          route: "/dashboard",
          outlined: true,
          roles: [1],
        },
        {
          nome_modulo: 'produto',
          name: "Produtos",
          icon: "box",
          route: "/produtos",
          outlined: true,
          roles: [1, 4],
          children: [
            { name: 'Cadastro produtos', route: '/cadastro-produtos', roles: [1, 4] },
            { name: 'Relacionar produtos', route: '/associar-produtos', roles: [1, 4] },
            { name: 'Consultar', route: '/consultar-produtos', roles: [1, 4] },
            { name: 'Industrias', route: '/fornecedores', roles: [1, 4] },
            { name: 'Promoções', route: '/promocoes', roles: [1] },
          ],
        },
        {
          nome_modulo: 'estatistica',
          name: "Estatística",
          icon: "bar_chart",
          route: "/estatistica",
          outlined: true,
          roles: [99],
        },
        {
          nome_modulo: 'fiscal',
          name: "Fiscal",
          icon: "attach_money",
          route: "/fiscal",
          outlined: true,
          roles: [1],
          children: [
            { name: 'Dashboard Fiscal', route: '/dashboard-fiscal', roles: [1] },
            { name: 'Emissão Fiscal', route: '/emissao-fiscal', roles: [1] },
            { name: 'Gestão XML', route: '/gestao-xml', roles: [1] },
            { name: 'Certificado Digital', route: '/certificado-digital', roles: [1] },
          ],
        },
        {
          nome_modulo: 'relatorio',
          name: "Relatórios",
          icon: "article",
          route: "/relatorios",
          outlined: true,
          roles: [1],
        },
        {
          nome_modulo: 'loja',
          name: "Loja",
          icon: "local_mall",
          route: "/loja",
          outlined: true,
          roles: [1],
          children: [
            { name: 'Minha loja', route: '/minha-loja', roles: [1] },
            { name: 'Vendas', route: '/vendas', roles: [1] },
            { name: 'Produtos na loja', route: '/itens-loja', roles: [1] },
            { name: 'PDVs', route: '/pdvs', roles: [1] },
          ],
        },
        {
          nome_modulo: 'estoque',
          name: "Estoque",
          icon: "inventory_2",
          route: "/estoque",
          outlined: true,
          roles: [1, 4],
          children: [
            { name: 'Cadastrar Estoque', route: '/cadastrar-estoque', roles: [1] },
            { name: 'Consultar', route: '/consultar-estoque', roles: [1, 4] },
            { name: 'Operações', route: '/consultar-operacoes', roles: [4] },
          ],
        },

        ////////////////////////////////////////////////////////////
        //Ao adquirir o módulo de cotação, vem com esse pacote junto
        {
          nome_modulo: 'cotacao',
          name: "Produtos",
          icon: "box",
          route: "/produtos",
          outlined: true,
          roles: [1, 4, 6, 7],
          children: [
            { name: 'Cadastro produtos', route: '/cadastro-produtos-cotacao', roles: [1, 6, 7] },
            { name: 'Relacionar produtos', route: '/associar-produtos', roles: [1, 6] },
            { name: 'Consultar', route: '/consultar-produtos', roles: [1, 6] },
            { name: 'Industrias', route: '/fornecedores', roles: [1, 6] },
          ],
        },

        
        {
          nome_modulo: 'cotacao',
          name: "Cotação",
          icon: "payments",
          route: "/cotacao",
          outlined: true,
          roles: [1, 6, 7],
          children: [
            { name: 'Dashboard', route: '/dashboard-cotacao', roles: [1, 6] },
            { name: 'Operações', route: '/operacoes', roles: [1, 6, 7] },
          ],
        },

        {
          nome_modulo: 'cotacao',
          name_front: 'Pedido direto',
          name: "Pedido Direto",
          icon: "move_group",
          route: "/cons-pedido-direto",
          roles: [1, 6],
        },

        {
          nome_modulo: 'cotacao',
          name_front: 'Marviz Trends',
          name: "Marviz Trends",
          icon: "view_in_ar",
          route: "/marviz-trends-var",
          roles: [1, 6],
        },

        {
          nome_modulo: 'vendedor',
          name: "Vendedores",
          icon: "person",
          route: "/vendedores",
          outlined: true,
          roles: [1],
          children: [
            { name: 'Gestão', route: '/gestao-vendedores', roles: [1] },
          ],
        },
        ////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////

        {
          nome_modulo: 'colaborador',
          name: "Colaboradores",
          icon: "person_book",
          route: "/colaboradores-home",
          outlined: true,
          roles: [1, 6],
        },
        {
          nome_modulo: 'configuracao',
          name: "Configurações",
          icon: "settings",
          route: "/configuracoes",
          outlined: true,
          roles: [99],
        },
        {
          nome_modulo: 'suporte',
          name: "Suporte",
          icon: "help",
          route: "/suporte",
          outlined: true,
          roles: [1, 6],
        },
      ]

      if (!state.user) return []

      // Se não tiver módulos, não mostra menu
      if (!state.modulos || state.modulos.length === 0) {
        return []
      }

      const userNivel = state.user.nivel

      console.log(state.modulos)

      const idsModulosPermitidos = state.modulos.map(
        modulo => modulo.codigo
      )

      return menus
        .filter(menu =>
          menu.roles.includes(userNivel) &&
          idsModulosPermitidos.includes(menu.nome_modulo)
        )
        .map(menu => {
          if (menu.children) {
            return {
              ...menu,
              children: menu.children.filter(child =>
                child.roles.includes(userNivel)
              )
            }
          }

          return menu
        })
    },
  },

  actions: {

    async login(payload) {

      const { data } = await api.post('/mvpu/usuario/loginSis', payload)

      this.token = data.data.token

      localStorage.setItem('token', this.token)

      this.decodeToken()

      // LIMPA módulos antigos
      this.modulos = []
      localStorage.removeItem('modulos')


      console.log(this.user, "AAA")

      if (this.user.nivel == 4 || this.user.nivel == 3) {

        //Não posso permitir isso agora, principalmente pq estou calibrando no cliente 
        //somente o módulo de cotação, ent a função vai parar no if acima
        // ESTOQUE
        if (this.user.nivel == 4) {

          localStorage.setItem('eimrd', this.user.id_loja)

          this.iDloja = this.user.id_loja

          // módulos vindos do login
          this.modulos = data.data.modulos || []

          localStorage.setItem(
            'modulos',
            JSON.stringify(this.modulos)
          )

          window.electronAPI.setIDloja(this.iDloja)
          window.electronAPI.setToken(this.token)

          router.push({ name: 'consoleEstoque' })

        } else if (this.user.nivel == 3) {

          console.log('operador de caixa')

        }

      } else {


        if(this.user.nivel != 6 && this.user.nivel != 7 && this.user.nivel != 1){
          throw new Error('Usuário não autorizado');
          return 
        }

        const lojas = await api.get('/mvpu/usuario/consultarLojas')

        console.log(lojas, 'lojas')

        if (lojas.data.data.length == 0) {

          router.push('/intro')

        } else if (lojas.data.data.length == 1) {

          const id_loja = lojas.data.data[0].id_loja

          // busca módulos da loja
          const modulos_loja = await api.get(
            `/mvpu/usuario/selecionarLoja/${id_loja}`
          )

          
          this.modulos = modulos_loja.data.data || []
          this.modulos.push({codigo:'suporte'})

          console.log('modulos', this.modulos)

          localStorage.setItem(
            'modulos',
            JSON.stringify(this.modulos)
          )

          localStorage.setItem('eimrd', id_loja)

          this.iDloja = id_loja

          window.electronAPI.setIDloja(this.iDloja)
          window.electronAPI.setToken(this.token)

          router.push({ name: 'DashboardCotacao' })

        } else if (lojas.data.data.length > 1) {

          router.push({ name: 'EscolherLoja' })

        }

      }
    },

    async escolherLoja(id_loja) {

      // retorna loja + módulos
      const modulos_loja = await api.get(
        `/mvpu/usuario/selecionarLoja/${id_loja}`
      )

      this.modulos = modulos_loja.data.data || []

      console.log(this.modulos, "MODULOS MEUS")
      console.log(modulos_loja, "AAAAA MOD")

      this.modulos.push({codigo:'suporte'})

      localStorage.setItem(
        'modulos',
        JSON.stringify(this.modulos)
      )

      localStorage.setItem('eimrd', id_loja)

      this.iDloja = id_loja

      window.electronAPI.setIDloja(id_loja)

      if(modulos_loja.data.data.length){
        router.push({ name: 'DashboardCotacao' })
      }else{
        router.push({ name: 'Suporte' })
      }

    },

    hydrate() {

      const loja = localStorage.getItem('eimrd')

      if (loja) {
        this.iDloja = Number(loja)
      }

      const modulos = localStorage.getItem('modulos')

      if (modulos) {
        this.modulos = JSON.parse(modulos)
      }
    },

    decodeToken() {

      if (!this.token) return

      try {

        this.user = jwtDecode(this.token)

      } catch {

        this.logout()

      }
    },

    /**
     * Seleciona uma loja: busca os módulos dela, persiste tudo no
     * localStorage e atualiza o estado reativo do store.
     * Após isso, quem chamar deve executar window.location.reload().
     */
    async setLoja(loja) {
      // Busca módulos da loja selecionada
      const modulos_loja = await api.get(
        `/mvpu/usuario/selecionarLoja/${loja.id_loja}`
      )

      this.modulos = modulos_loja.data.data || []
      this.modulos.push({ codigo: 'suporte' })

      localStorage.setItem('modulos', JSON.stringify(this.modulos))
      localStorage.setItem('eimrd', loja.id_loja)

      this.iDloja = loja.id_loja

      if (window.electronAPI) {
        window.electronAPI.setIDloja(loja.id_loja)
      }
    },

    logout() {

      this.token = null
      this.user = null
      this.iDloja = null
      this.modulos = []

      localStorage.removeItem('token')
      localStorage.removeItem('eimrd')
      localStorage.removeItem('modulos')

      router.push('/login')
    }
  }
})