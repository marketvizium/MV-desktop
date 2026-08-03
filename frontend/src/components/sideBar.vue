<template>
  <aside :class="{'Menu1': expandindo, 'Menu2': !expandindo}">
        <div style="margin: 0; padding: 0;">
            
            <div class="header-user-top" v-if="expandindo">
                <div class="logo-rect">
                    <img src="../assets/img/retangulo-logo.png" alt="">
                </div>

                <div class="user-info">
                    <span style="color: #222; padding: 0; font-weight: 700;">
                        Market <span style="color: #ff8049;">Vizium</span>
                    </span>
                    <span class="role" v-if="nivel == 1">Administrador</span>
                    <span class="role" v-if="nivel == 4">Estoquista</span>
                </div>
            </div>
            <div v-else style="display: flex; justify-content: center; align-items: center; padding: 10px; padding-top: 20px;">
                <div class="logo-rect">
                    <img src="../assets/img/retangulo-logo.png" alt="">
                </div>
            </div>
        </div>
        
        <div style="padding-left: 5px; padding-right: 5px; width: 100%;" v-if="expandindo">
            <button class="dashboard-button" v-if="dashButtonData.name" @click="handleItemClick(dashButtonData, 0)">
                <div style="display: flex; align-items: center; padding-left: 5px; font-size: 19px;">
                    <i class="material-symbols-outlined botaoIcone">
                        dashboard
                    </i>
                            
                    <div style="padding-left: 10px; font-size: 14px;">
                        {{ dashButtonData.name }}
                    </div>
                    <div class="novo-estilo">
                        Novo
                    </div>
                </div>   
            </button>
        </div>
        <div style="padding-left: 5px; padding-right: 5px; width: 100%;" v-else >
            <button class="dashboard-button" v-if="dashButtonData.name" @click="handleItemClick(dashButtonData, 0)">
                <div style="display: flex; align-items: center; font-size: 19px; justify-content: center;">
                    <i class="material-symbols-outlined botaoIcone">
                        dashboard
                    </i>
                </div>   
            </button>
        </div>
        
        <div class="itens-section">
            <div :class="{'ItensMenu1': expandindo, 'ItensMenu2': !expandindo}">
                
                <div
                v-for="(item, index) in itens"
                :key="index"
                class="menu-item-wrapper"
                >
                <!-- BOTÃO PAI -->
                <button
                    :class="{'itens-style': expandindo, 'itens-style2': !expandindo}"
                    @click="handleItemClick(item, index)"
                >
                    
                    <div style="display: flex; align-items: center; padding-left: 5px; font-size: 19px;">
                        <i class="material-symbols-outlined botaoIcone">
                        {{ item.icon }}
                        </i>
                        
                        <div style="padding-left: 10px; font-size: 14px;" v-if="expandindo" >
                            {{ item.name }}
                        </div>
                    </div>
                    
                    <div
                        v-show="expandindo"
                        class="poppins-regular menu-label"
                        >
                            <!-- seta dropdown -->
                            <i
                                v-if="item.children"
                                class="material-symbols-outlined arrow"
                                :class="{ open: openMenuIndex === index }"
                            >
                                expand_more
                            </i>
                    </div>
                </button>

                <!-- DROPDOWN -->
                <div
                    v-show="openMenuIndex === index && expandindo"
                    class="submenu"
                >
                    <button
                    v-for="(child, cIndex) in item.children"
                    :key="cIndex"
                    class="submenu-item"
                    @click="goToChild(child.route)"
                    >
                    {{ child.name }}
                    </button>
                </div>

                </div>

            </div>
        </div>


        <div style="color: #222;" v-if="expandindo">
            <div class="header-user">
                <div class="logo-rect" style="cursor: pointer;">
                    <img v-if="foto_perfil" :src="foto_perfil" alt="Profile" @click="goTo('minhaConta')" style="border-radius: 10px; margin-top: 5px;" width="40" height="40"/>
                    <img v-else src="../assets/img/personagem.png" alt="Profile" @click="goTo('minhaConta')" style="border-radius: 10px; margin-top: 5px;" width="40" height="40"/>
                </div>

                <div class="user-info">
                    <span class="nome-user-negrito poppins-extrabold"><b>{{nome}}</b></span>
                    <span class="nome-user">{{email}}</span>
                </div>
            </div>
        </div>
        <div v-else style="display: flex; justify-content: center; align-items: center; padding: 10px; padding-bottom: 20px;">
            <div class="logo-rect" style="cursor: pointer;">
                <img v-if="foto_perfil" :src="foto_perfil" alt="Profile" @click="goTo('minhaConta')" style="border-radius: 10px; margin-top: 5px;" width="40" height="40"/>
              <img v-else src="../assets/img/personagem.png" alt="Profile" @click="goTo('minhaConta')" style="border-radius: 10px; margin-top: 5px;" width="40" height="40"/>
            </div>
        </div>

  </aside>
</template>

<script>

import { useAuthStore } from '@/stores/auth';

export default {
    name: 'SideBar',

    props:{
        stts_expandindo:{
            type: Boolean
        }
    },


    data(){
        return{
            expandindo: true,
            auth : null,
            dashButtonData: {},
            nome: null,
            email:null,
            usuario: null,
            nivel: null,
            foto_perfil: null,
            openMenuIndex: null,
            itens:[] //Vem do pinia baseado no nivel de acesso do user
        }
    },
    components: {
        
    },
    methods:{
        expandir_diminuir(){
            this.expandindo = !this.expandindo
        },

        redirect(rota){
            if(this.$router.currentRoute.name != rota){
                this.$router.push({name:rota})
            }
        },

        goTo(routeName){
            this.$router.push({name: routeName})
        },

        handleItemClick(item, index) {

            if(!this.expandindo) this.expandindo = !this.expandindo

            if (item.children && item.children.length) {
                // toggle do dropdown
                this.openMenuIndex =
                this.openMenuIndex === index ? null : index
            } else {
                this.$router.push(item.route)
            }
        },

        goToChild(route) {
            this.$router.push(route)
        }

    },

    watch:{
        stts_expandindo(novo, antigo){
            this.expandindo = novo
        }
    },

    mounted(){
        this.auth    = useAuthStore()
        this.usuario = this.auth.usuario
        let arrayItens = []

        this.auth.menuPermitido.forEach((item, index)=>{

            if(item.name=='Dashboard'){
                this.dashButtonData = item      
            }else arrayItens.push(item)

            if(item.children){

                item.children.forEach(itemC=>{

                    console.log("CCC", itemC.name, this.dashButtonData)

                    if(itemC.name=='Dashboard'){
                        console.log("OPA")
                        this.dashButtonData = itemC
                    }
                })

            }
        })

        this.itens  = arrayItens
        this.nivel  = this.usuario.nivel
        this.nome   = this.usuario.nome
        this.email  = this.usuario.email
        this.foto_perfil  = this.usuario.foto
    }
}

</script>

<style scoped>

.Menu1 {
    width: 198px;
    height: calc(100vh - 50px);
    background-color: #fff;
    border-right: solid 1px #f0f0f0;
    color: #FFF;
    transition: 0.3s;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

@media (max-width: 768px) {
    .Menu1{
        position: fixed;
        z-index: 4;
    }
}

.Menu2{
    width: 80px;
    height: calc(100vh - 50px);
    background-color: #FFFF;
    border-right: solid 1px #f0f0f0;
    color: #FFF;
    transition: 0.3s;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
}

.header-user {
    padding: 10px;
    display: flex;
    align-items: flex-start; 
}

.header-user-top{
    padding: 10px;
    padding-top: 20px;
    display: flex;
    align-items: flex-start; 
}

.logo-rect img {
    margin-top: 2px;
    display: block;
}

.user-info {
    padding-left: 10px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    justify-content: flex-start;
    scrollbar-width: 0;
}

.user-info img {
    display: block;
}

.role {
    margin-top: 0px;
    font-size: 14px;
    color: #888888;
}

.itens-section{
    height: 100%;
    overflow-y: auto;
}

.nome-user{
    margin: 0;
    font-size: 14px;
    width: 110px;
    scrollbar-width: 0;
    white-space: nowrap;      /* não quebra linha */
    overflow: hidden;         /* esconde o excesso */
    text-overflow: ellipsis;  /* adiciona ... */
}

.nome-user-negrito{
    margin: 0;
    font-size: 16px;
    width: 115px;
    scrollbar-width: 0;
    white-space: nowrap;      /* não quebra linha */
    overflow: hidden;         /* esconde o excesso */
    text-overflow: ellipsis;  /* adiciona ... */
}

.loja-name{
    padding: 0px;
    overflow: hidden;
}

/* SESSAO DOS ITENS */

.menu-item-wrapper {
  display: flex;
  flex-direction: column;
}

/* seta */
.arrow {
  margin-left: auto;
  transition: transform 0.3s;
}

.arrow.open {
  transform: rotate(180deg);
}

/* submenu */
.submenu {
  padding-left: 48px;
  display: flex;
  flex-direction: column;
}

.submenu-item {
  background: transparent;
  border: none;
  color: #666;
  text-align: left;
  padding: 6px 0;
  cursor: pointer;
  font-size: 14px;
}

.submenu-item:hover {
  color: #FF8049;
}

.itens-style{
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: transparent;
    border: none;
    cursor: pointer;
    height: 40px;
}


.itens-style:hover{
    border-right: solid 5px #FF8049;
    background-color: #e5e5e5;
    transition: 0.2s;
}

.itens-style2{
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    cursor: pointer;
    height: 40px;
}

.itens-style2:hover{
    border-right: solid 5px #FF8049;
    background-color: #e5e5e5;
    transition: 0.2s;
}

.dashboard-button{
    width: 100%;
    height: 40px;
    margin-top: 20px;
    margin-bottom: 20px;
    background: linear-gradient(to right, #0D129E, #6D197C);
    color: #FFF;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.5s;
}

.dashboard-button:hover{
    transform: translateY(-5px);
    transition: 0.5s;
}


.novo-estilo{
    color: #FFF;
    font-size: 12px;
    background-color: #DD0000;
    border-radius: 2px;
    padding-left: 2px;
    padding-right: 2px;
    margin-left: 5px;
}

</style>
