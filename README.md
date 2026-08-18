# MV-front
Ficarão hosperdados aqui as interfaces desktop, mobile e desktop do PDV aqui

# V0001 - Alterações iniciais e início da plataforma.
- A plataforma foi criada com a perspectiva de consumir todas as funcionalidades do backend, o MV-back. Essas funcionalidades levarão um processo para serem integradas. Tanto na questão do frontend, quanto na questão do backend e nas ideias que vão sendo criadas ao longo do tempo em perspectiva do projeto.

- A motivação imediata do início do desenvolvimento do aplicativo desktop, com ênfase no perfil administrativo da loja, foi de ter tido a maioria das funcionalidades de operações no backend já finalizadas. As operações são todas as funcionalidades que não estão nos conjuntos de analise de dados e automações. Então todas as funcionlidades que estou/estarei integrando nas primeiras versões, são todas focadas em operações.

- Para eu começar a fazer as operações de fato no frontend, temos que começar a falando dos requisitos não funcionais da plataforma que é a base para construir e expandir as funcionalidades. 

- Eu estou desenvolvendo esse projeto em Vue 3, por motívos óbvios do Vue 2 estar obsoleto a libs novas, que são mais fáceis de integrar, e ferramentas mais modernas que deixam as aplicações fluidas e mais simples de serem expandidas e refatoradas em função do tempo.

- Utilizei o pinia para fazer o gerenciamento de estado do usuário e local storage para persistência de dados na aplicação. Utilizo o meta para nas rotas privadas com a flag de autenticação, protegendo as telas que são da plataforma de um usuário não logado. 

- Sobre as funcionalidades, eu integrei grande parte dos formulários de cadastro, associação, as funções de buscas com tebelas com inputs de search e filters. Nas buscas faltam apenas funcionalidades como editar e excluir, o que será relativamente simples de implementar. 

- Uma pendência que deixarei em produtos por enquanto, MAS VOLTAREI DEPOIS, é tudo referente ao lote. Estava dando uma olhada em algumas documentações de outras plataformas, e você pode optar por fazer controle por lote ou não... Tem outras flags também, mas como estamos falando do lote, essa é uma delas. Eles usam o FIFO como lógica nos sistemas, lotes novos? Vão pro final. Lotes mais antigos? Vem pra frente... O primeiro produto a chegar é o primeiro a sair... Eu posso implementar o QR code, mas não obrigar o cliente a usar essa solução... Ela pode ser escalável para comércios pequenos... Mas um grande atacarejo não iria colocar QR code por QR code em cada produto... Então tenho que ser mais flexível nesse ponto.

- Vou optar pelo First-In First-Out, e o QR code de modo híbrido. Se o usuário quiser colocar o QR code, simplesmente as requisições de saída do estoque e venda vão ser OBJETIVAS. Vai sair diretamente no lote que está no QR code. Se ele optar por FIFO, então, o produto que ele tirar do estoque, o sistema irá pressupor que é o lote mais antigo, ou seja, o que chegou primeiro. 

- Na próxima versão irei fazer alterações mais simples, depois voltarei quando estiver integrando com o usuário de estoque.


# V0002 - Alterações sobre a loja. Novas funcionalidades e integrações

- Nessa etapa eu fiz diversas integrações com o microserviço da loja, diversas funções de consultas tanto da loja, quanto dos produtos, vendas, PDVs, foram implementadas com sucesso. A rota de listar produtos que estão vigentes na loja, ou seja, que ainda não foram vendidos, eu tive que criar no backend pq não havia...

- Junto com a etapa de integração de formulários e consultas da loja, eu implementei a funcionalidade de loading no sistema. Toda vez que o sistema inicializava, seja pelo reload, force reload ou mesmo o login do sistema, aparecia as letras com icons tudo bugados pq ainda não tinha puxado do repositório da nuvem. Ou seja, o cliente veria quebrando... Adicionei o loading para inibir isso.

- Adicionei as funcionalidades do estoque, como cadastrar o próprio estoque e fazer as consultas das operações padrão do estoque. O sistema fechou o ciclo completo de consultas desde mostrar a entrada, até a saída, produtos vencidos, como data de validade próxima e etc... 

- Agora estou iniciando o processo de cotação, porém, farei essas alterações em outro commit para não misturar com as features do estoque.


# V0003 - Cotação com Operações concluídas

- Cosntrui a integração dos processos de cotações no sistema. Além de integrar a cotação, também alterei o visual das tabelas do meu software... Optei por deixar um design mais clean e com cara mais de SaaS, baseando nos recursos oferecidos pelo Prime Vue.

- A cotação tem o seu ciclo completo, está pronto para aprimorar para as automações. 

- Houve uma dificuldade para integrar o processo de selecionar ofertas, tive que mudar a lógica até no banco de dados, backend e frontend. Pq não levei em consideração, por falta de atenção, o dono ter a opção de escolher ou a 1°, ou a 2° opção da oferta, ou as duas... Eu colocava que o dono da loja escolheria a oferta, qual das duas eu não tinha estabelecido. Raciocinei, e vi o problema que eu estava criando e corrigi. Agora está operando corretamente.

- Tive que fazer algumas gambiarras em algumas páginas que to passando como parametro da função route algumas querys para colocar alguns valores nos componeentes que eu faço requisição ao backend... Por exemplo, estou fazendo requisição para pegar o id da cotação, e tenho que repasssar isso para outros componentes e to fazendo isso através de querys... Porém, parece que dá um delay fixo para ler, e o mounted chega antes que esse dado é inserido, e aí ele lê um null da query... Adicionei alguns timeouts em alguns mounteds...

- Alterações finais para as telas do colaborador de estoque foram realizadas... Criei a tela do colaborador de estoque, adicionei as funcinoalidades de entrada e saída, e as outras relacionadas à manipulação dos dados de produtos... Existe uma pendencia que é a impressão de etiquetas para colocar nos produtos em promoção. Os demais produtos devem ser tratados na ordem para funcionar corretamente o sistema. 

- Agora estarei focando nas telas para o PDV... Vai ser uma lógica bem diferente do que estou fazendo para o usuário dono e estoque e PDV.

# V0004 - Arquitetura do PDV

- Nesse commit fiz a arquitetura do sistema de PDV, estruturei comunicação via IPC para realizar processos de requisições, controle de estado da aplicação, e possibilidades de crescimento futuras para sincronização de bancos de dados e outras aplicações. 

- Estruturei o IPC com o foco de pegar informações de estados, como turnos, o id do computador que sincronizará com o servidor, informações do usuário e do terminal, salvando token para poder fazer requisições seguras ao backend, criei uma infraestrutura de autenticação híbrida, recebendo os dados e persistindo eles na store do electron. Toda essa arquitetura interface-electron, permite que eu salve de forma persistente informações no futuro, como sincronizar bancos de dados e outros. 

- Fiz o design das telas de login e do dashboard do operador. Nesse dashboard tem as ferramentas necessárias para ele operar o PDV, ainda está faltando a comunicação com a impresssora, mas essa será a última etapa de calibração. 

- Calibrei o controle de turnos, obrigando um supervisor ou dono da loja, com controle via servidor autenticar e monitorar se aquele usuário é um supervisor apto para permitir que o operador encerre o seu turno.

- Além de finalizar a calibração dos turnos, eu deixei espaço agora para criar o banco de dados local da máquina que irá operar o PDV, esse banco de dados local irá salvar as seguintes informações: produtos na loja e histórico de vendas. 

- Os produtos na loja serão sincronizados a cada 5 minutos com o servidor, PDVs enviarão constantemente requisições ao finalizar suas vendas, porém, caso tiver sem internet, o PDV sincronizará para enviar tudo de uma vez depois. Para eu saber se tem promoção em um lote de produtos, ou em um produto específico, ou se aquele produto está na loja de fato, a sincronização me permitirá isso. Dessa forma, o sistema continuará mandando informações em tempo real sem cair ou quebrar para o cliente presente na loja também. 

- Fiz a primeira sincronização com o banco de dados, foi a de produtos na loja. Verifico os estados de conexão com a rede, se tudo estiver ok, e eu receber todos os produtos, eu insiro eles nas tabelas,

- O próximo passo é desenvolver no backend a adição de produtos por lote e por código de barras na relação com os produtos da loja. Pq para eu desenvolver a tela de passagem de produtos, eu vou precisar dessa relação de promoções por código de barras e lote bem estabelecida.

- Para evitar o conflito de vendas por código de barras no sistema, tenho que integrar à lógica de sincronização do lado do servidor, o "organizador de conflitos". Se caso acontecer de haver dois produtos com o mesmo código de barras, porém datas de validades diferentes na loja, e dois ou PDVs darem baixa no produto com código de barras mais próximo. Quando for enviar a sincronização ao servidor e der o conflito, pq aquela venda com com código de barras e mesma validade foi enviada anteriormente, o servidor deve selecionar o outro produto com data de validade mais próxima. Não haverá conflito de dois PDVS venderem um produto, pq se de fato só existe um produto na loja, não passará em dois PDVs.

 - Aqui tenho que fazer a lógica de pegar todos as vendas com sync 0 agrupar as vendas com mesmo ID, estruturar o payload que nem o do postman depois enviar, se der certo dou o update com sync 1, e bora para uma  nova requisição.


- No back, eu tenho que tirar os produtos sem lote na ordem de data de  validade mais próxima como prioridade. Se saiu 2 produtos, eu tiro os 2 com data de validade mais próximas.

- Feito isso é importante estruturar produtos com Lote, simulando a leitura do QRcode

- Fechando essa malha eu consigo finalizar controle por lote e por codigo de barras

- Depois preciso fechar a malha com promocao por lote, e isso DEVE renderizar corretamento no caixa


# V0004 - Sincronização e calibração com servidor, funcionalidades extras

- Ao realizar a venda do produto, o fluxo está sendo o seguinte:

- Os dados saem da interface, vão até o backend do electron, via IPC, passo para uma func que dá um redirect para o service de db que armazena com SYNC 0, ou seja, dado ainda não sincronizado. 

- Imediatamente quando o sistema observa uma venda, ele já tenta sincronizar com o servidor. Ao sincronizar vendas sem lote e data de validade especificada, ele pega o produto com data de validade mais próxima. Mantendo o princípio do FIFO. Se caso houver especifico a data de validade e o lote do produto (lido por QR code), o produto em específico é removido do DB.

- Mantive a lógica do caixa operarar sem mouse.

- Alterei o card de "Cadastro de produtos" no PDV. Isso deve estar no backside do sistema, com o usuário de estoque ou o dono da loja. No lugar, coloquei um "Consultar Produto". Se um cliente perguntar o preço ao PDV, para ele não abrir uma nova venda, ele usa essa ferramenta.

- Ciclo de abertura, revisão e fechamento de turnos estão funcionando.

- Falta ainda calibrar a parte de troco em dinheiro com abertura de gaveta, suprimento e sangrias. (Preciso da impressora para calibrar)

# V0005 - Estrutura de diretórios inicial com primeiro start do Ionic para app mobile.

- Ionic é uma arquitetura que permite você rodar tecnologia web para a construção de aplicativos mobile. Por consequência, frameworks como Vue, React e outros, rodam por cima do Ionic, possibilitando a construção de apps mobiles com ferramentas e facilidade maior. 

# V0006 - Estrutura do Software mobile

-  sudo socat TCP4-LISTEN:30443,fork,reuseaddr TCP4:192.168.49.2:30443 
- Acima é o comando linux para testes em dispositivos externos
- Ao utilizar esse comando, redirecionar o IP também para o do PC não o interno do minikube

{
  "hasContent": true,
  "chartData": {
    "labels": ["01 Jan", "02 Jan", "03 Jan", "04 Jan", "05 Jan", "06 Jan", "07 Jan"],
    "values": [12, 18, 15, 25, 30, 22, 40]
  },
  "cards": [
    { 
      "label": "Cotações Concluídas", 
      "value": "20", 
      "percent": "- 4,2%", 
      "icon": "payments", 
      "trendUp": false, 
      "color": "#f97316", 
      "bgColor": "#ffedd5" 
    },
    { 
      "label": "Cotações Participadas", 
      "value": "35", 
      "percent": "+ 3,1%", 
      "icon": "person", 
      "trendUp": true, 
      "color": "#10b981", 
      "bgColor": "#d1fae5" 
    },
    { 
      "label": "Avaliação Média", 
      "value": "18%", 
      "percent": "+ 3,1%", 
      "icon": "equalizer", 
      "trendUp": true, 
      "color": "#6366f1", 
      "bgColor": "#e0e7ff" 
    },
    { 
      "label": "Velocidade de Resposta", 
      "value": "10 min.", 
      "percent": "+ 3,1%", 
      "icon": "schedule", 
      "trendUp": true, 
      "color": "#8b5cf6", 
      "bgColor": "#ede9fe" 
    }
  ],
  "recentQuotes": [
    {
      "id": 1,
      "nome": "Cotação de Verão",
      "loja": "Loja Centro SP",
      "data": "14/03 15:00h",
      "status": "Aberta"
    },
    {
      "id": 2,
      "nome": "Reposição de Estoque",
      "loja": "Supermercado XYZ",
      "data": "15/03 10:00h",
      "status": "Fechada"
    }
  ]
}

Estrutura de payload que devo retornar do backend


# V0007 O dashboard e as cotações

- O dashboard do mobile já está integrado com o servidor. Operando em casos de lentidão de internet, requisição incompleta e etc... Na página de cotação, adicionei a consulta de TODAS as lojas que o vendedor tem associado, ele tem filtros, busca e vários recursos.

# V0008 Sincronização de produtos e estoque em caso de falta de internet: Solução ->

- O problema: Estou pensando em um problema de sincronização. Meu PDV, ele sincroniza com o servidor do comércio no login, e a cada 30 segundos. Se caso cair a internet, ele irá operar normalmente, com o último registro de sincronização com os produtos que ele fez. Porém, existe um problema. Digamos, que enquanto estava online, o PDV receber a informação que existe apenas uma única unidade de um determinado produto. De repente, ficou offline... Esse produto passou em um PDV, e foi retirado mais produtos do estoque para a loja, que serão também sincronizados quando voltar o Wi-Fi. Nesse momento, gera um gargalo que, o produto passado no outro PDV, ainda será identificado para o PDV atual. E o PDV atual e o outro, irá constar que acabou os produtos, e não permitirá passar no caixa, isso pq n sincronizou com o Wi-Fi. Nesse caso, o que eu faço?

- A solução: Se tem um único produto na loja, esse é passado para um PDV, e durante o período offlnie vem mais três do estoque, e passa três em outro PDV. Mesmo que o outro produto tenha passado, o servidor, na sincronização, vai pegar o mais antigo. Mesmo o que saiu do estoque. ENtão, não vai dar problema de conflito de produto. Se está offline, o PDV não pode ser bloqueado de passar um produto. Ele deve passar esse produto normalmente, e quando sincronizar a internet, ele irá retirar tudo o que tem na ljoa. Pq sincronizará o que saiu do estoque para a loja. E sincronizará o que saiu da loja para a venda. Nisso, descontará o valor da mesma forma. 

- É necessário se atentar em NÃO DEIXAR O PDV BLOQUEAR EM OFFLINE, e VERIFICAR SE A SOLICITAÇÃO DE ITENS VENDIDOS É MAIOR QUE O QUE TEM NA LOJA. SE NÃO FOR, RECUSA, PQ AINDA NÃO SINCRONIZOU O ESTOQUE. 

- Criei a funcionalidade de cadastro e consulta de clientes de forma assincroniza. O PDV cadastra um cliente, quando houver internet, ele irá enviar todos os 
clientes cadastrados no período offline. Ou durante o período online ele irá registrando normalmente no servidor da loja.

- A consulta de clientes funciona para sincronização entre o banco de dados local do computador PDV e o banco de dados do servidor. Quando o PDV abrir o computador e fizer o login, junto com todas as outras sincronizações, o PDV também irá receber o dado de todos os clientes cadastrados, seja pelo PDV dele ou outros PDVs da loja.

- Fix da sincronização das vendas da loja: Nas versões anteriores, se o PDV retirava a quantidade a mais do que tinha na loja, no backend eu recusava essa requisição. Porém, o PDV não pode ser bloquado, principalmente pq pode acabar saindo um produto do estoque e indo para a loja durante o período que está offline. E o PDV deve operar normalmente. Essa venda será registrada indicando que o produto tinha divergencia, em sua quantidade sobre o que tinha na loja, mas não irá bloquear ou deixar de rastrear essa venda. 

- Nessa versão fiz a sincronização de movimentações. Se caso o PDV movimentar, através de sangrias e suprimentos, isso é rastreado e enviado ao servidor assim que a conexão entra. 

- Também adicionei as funcionalidades de busca de lojas quando um vendedor está procurando para adicionar

- Adicionei mais funcionalidades ao vendedor, tanto sobre buscas nas lojas, como solicitações de parceria e etc...

- Alterei fontes, estilizações, aplique a lógica de desconto proporcional para quando for integrar com NFC-e


# V0009 Polindo o app do vendedor
- Melhorei as nomenclaturas das labels e deixei visualmente mais agradável a sessão de cotação. Porém, tenho que arrumar no backend a etapa do comerciante adicionar q quantiadade do produto, se é unidade/caixa/fardo, isso ele tem que ver. Favor, não esquecer...

- Não permitir oferta ser enviada sem informação mínima

- Foi arrumado do lado doo backend e no frontend todas as alterações referente ao comerciante adicionar as informações do produto que ele deseja. E o vendedor só irá passar a o valor unitário do produto. Agora o vendedor não adiciona quantidade em caixa fardo, se é unitário, caixa ou fardo, e coisas do tipo, ele só passsa especificações do produto equivalente. O produto solicitado pelo cliente já foi adicionado as especificações.

- Fechei o fluxo do cadastro do vendedor. Ele adiciona todas as suas especificações, e tem a integração com o cloudinary para integrar a gestão das fotos de perfil dos usuários. Essa implementação foi feita do lado do backend, e o frontend somente irá enviar no formato form data a imagem selecionada. 

- O fluxo de cadastro foi finalizado.

- Foi fechado o fluxo de editar perfil.

minikube service mvorganizer-service --url
sudo KUBECONFIG=$HOME/.kube/config kubectl port-forward --address 0.0.0.0 service/mvorganizer-service 8080:8082

kubectl port-forward --address 0.0.0.0 service/mvorganizer-service 30443:443

kubectl port-forward service/mvorganizer-service 8080:443
ngrok http 8080
chrome://inspect
ionic build 
npx cap sync 
npx cap run android

sempre que for rodar android build depuramento

# V0010 Fluxo finalizado do app do vendedor

- O fluxo de ajustes nos problemas de cotação no aplicativo do vendedor foi finalizado, talvez ajustes pontuais de perfurmaria para a produção
- O sistema de cotação está funcional e as estatísticas estão funcionando corretamente.
- O PDV e o fluxo de sistema de cotação estão finalizados, o PDV falta finalizar a estilização customizada do dono da loja com a marca da empresa
- Praticamente o PDV e o aplicativo do vendedor já estão com o fluxo finalizado
- Agora preciso fazer o fix de sincronização de estoque com o servidor, tenho que arrumar uma técnica para caso o servidor tenha sincronizado a venda e não o aplicativo do estoque. Por exemplo, ficou sem internet na loja, a internet voltou, sincronizou todas as vendas no servidor, porém o estoque ainda não tinha sincronzado, um esquema de quantidade negativa é valido, pq o estoque vai recuperar esse valor negativo depois. Se caso o valor ficar negativo, 
significa que vendeu um produto a mais do que tinha na loja e o estoque retirou seria por exemplo, de tal período a tal período que ficou sem internet, pegar a quantidade que tinha na loja inicialmente, a quantidade de vendas nesse período. Se caso a quantidade inicial - a quantidade de vendas + o que saiu do estoque der um valor menor do que estava na loja, significa que nesse momento houve uma quebra, deve ser registrada uma nova tabela de quebras de produto, e ser registrado nessa tabela produto, loja, contexto (loja), codigo de barras, período do ocorrido, quantidade de quebras, funcionário do estoque no momento. Devo implementar uma função, provavelmente um job que a cada 24h verifica se a quantidade que de produtos na loja - quantidade que vendeu + saiu do estoque, é igual a quantidade atual, sempre que houver uma quebra em qualquer produto em quantidade da loja, deve colocar na tabela de quebras. No estoque deve ser registrado a quantidade de XML ou entradas - quantidade de saídas do estoque de todos os produtos e ver se é equivalente a quantidade atual.


- Sobre a mensagen de erro, no aplicativo do vendedor não aparece todos os códigos de erro, isso impacta e bem forte na manutenção futura. 
- Verificar CNPJ no cadastro de fabricantes

Codigo de barras para pesquisa profunda: 7500435106634

Me retorne em JSON, na seguinte estrutura:

{
"nome": "",
"codigo_barra", 
"busca_rapida", 
"ncm":"",
"cest": "",
}

Consulte este código de barras nas bases de dados brasileiras. Se houver divergência entre o NCM e a descrição real do produto, não retorne o JSON. Retorne apenas se encontrar o registro exato no cadastro de produtos.

## V0012 Interfaces melhoradas

- Corrigi alguns UX tanto da consulta de produtos no estoque, entrada e saída de estoque e produtos cadastrados
- Arrumei as funcionalidades de editar e remover produtos já cadastrados no sistema
- Melhorei um pouco a interface de cadastro de produtos indicando os produtos opcionais

## V0013 Funcionalidades bidirecionais arrumadas
- Melhorar a UX de tudo em questão de texto, todos os textos precisam estar auto indicativos com uma UI auto indicativa também... Depois vou integrar modais e tutoriais e fica mais fácil na UX do usuário - OK

- Consultar produtos: Criar o editar e deletar produtos.  - OK

- Criar a função no consultar associados para editar ou remover um produto associado aquele produto - OK

- No cadastrar fabricante, deixar o usuário colocar só o cnpj e o sistema já identifica e coloca os dados do fabricante para n ficar zoado para o cara colocar - OK

## V0014 Controle por lote e desativado

- O controle por lote entre o PDV e o estoque estão alinhados na primeira versão, se eu adiciono a flag controle por lote no produto, no PDV ou vai digitar o lote do produto especificado, ou vai passar o QR code que o estoque colocou no produto e está na loja. Porém, o cara do estoque pode deixar sem lote o produto que é obrigatório a retirada no lote, e isso impacta em um bug no pdv, pq o produto está sem lote, e está exigindo lote. 

- A solução é o estoque no momento da saída verificar se aquele produto está disponível e correto para saída.

- No produto desativado já foi integrado também, o PDV não consegue passar um produto desativado.

# V0015 Sincronização no estoque

- Iniciar a sincronização do estoque, entradas, saídas e itens no estoque, bem como atualizações nos itens devem ser mapeadas para quando o backend sincronizar, o motor de sync pegar todas as infos armazenadas em SQLite e enviar ao backend. Após isso o estoque finaliza e podemos automatizar a interface do dono. Tenho que voltar no estoque para integrar o leitor EAN e o QRcode depois. 

- No PDV eu tenho que voltar para resolver o B.O dos inputs que do nada não se tornam mais clicáveis, e devo também abrir na configuração do dono, a personalização do PDV. Vou integrar cloudnary para adicionar e recuperar imagens do logo no pdv. 

- No dono preciso fazer um mockup de itens de análises de dados, preciso mapear automações e ajustes nas operações diárias do sistema do dono da loja.

# V016 Estoque concluido e Dash modelado

- Conclui as funcionalidades de sincronização entre as telas de estoque e servidor. Todas as frentes do estoque possuem sincronização, menos o fornecedor, chamado de industria em frentes de atualizar e deletar. Mas todo o restante funciona tudo normalmente. O estoque está com seu ciclo fechado, faltando apenas a impressão de etiquetas QRcode para colocar em produtos com promoção lote. 

- Preciso ainda integrar a lógica de detectação de produtos vendidos e em falta. Por exemplo, se caso ficar offline a loja, e nesse período o caixa passou produtos sem ter retirado do estoque, no servidor isso deve ficar negativo. Pq não estava na loja, e foi passado no caixa. Ou seja, não passou pelo estoque.

- Dashboard do dono foi integrado com sucesso, com o detalhe que não foi integrado com o backend. Mas a interface está completa.

## V017 Novas telas - refinamento de funcionlaidades

- Criei as novas telas para apresentação ao primeiro cliente que irá visualizar o funcionamento de modo geral do sistema. As novas telas contemplam com dashboards extremamente detalhados, KPIs importantes, e telas mais funcionais. 

- Criei o dashboard de relatórios. Esse dashboard de relatórios irá conter os dados do dashboard main, com a diferença que você tem um header de seleção de período de visualização de dados. Ou seja, você pode tanto visualizar os dados em função do tempo para N datas e períodos possíveis, como exportar cada área detalhada por PDF como relatório.

- Agora temos o console do estoque, que é um dashboard que monitora as atividades e KPIs com gráficos e cards sobre as atividades do estoque, as KPIs ainda estão mocadas, mas é possível mediante aos dados que tenho no sistema. Estou plotando dados que possibilitarão o cliente ter uma previsiblidade de compra e se interessar nesse novo padrão.

- Implementei a tela de cotação, agora o cliente terá um console de cotação para monitorar tudo em uma única tela, isso vai facilitar o processo, além de ter criado a automação para selecionar os produtos automaticamente pelo menor custo possível. e enviar essa cotação concluída ao vendedor.

- Implementei a tela de suporte, com a nova integração à API do gmail e o sistema de notificações para o vendedor.

- Implementei a tela de minha conta, e falta integrar com "atualizar perfil" que em breve estará no backend

- Exclui a aba estatísticas, já que temos as análises no Dashboard e em relatórios... Porém, o microserviço se mantém.


# V018 - Integração no app do vendedor de empresa representante

- Agora a empresa que o venedor representa ao passar o pedido é enviada na oferta. Dessa forma, vai dar pra fazer o controle de compra e de recebimento, estimando o estoque mínimo melhor

# V019 - Integrando App Vendedor com Servidor Produção
npx capacitor-assets generate - Gerar assets
ionic build  - Build da dist ionic
npx cap sync android - sincronizar com android studio
npx cap open android - abrir android studio


# V1009 - Estabilizando o front produção
 - O frontend foi deployado a primeira vez há alguns dias, e as alterações foram de supetão e intensas, não houve tempo de documentar. Mas aqui vai uma breve documentação do que foi feito nos dias anteriores.
 - Alterei a forma como o vendedor preenche a cotação. Ele tinha que clicar no produto, expandir, passar o preço e após isso enviar oferta. Isso era feito a cada produto, agr salva automaticamente e em breve vai otimizar para exportar excel, preencher por lá e dps enviar para a interface novamente. 
 - Estou alterando continuamente o console de cotação, antigamente a consulta para encontrar um produto era somente por cod barra, agr é por descrição do produto, com um motor de rankeamento de busca otimizado no banco. 
 - Alterei a forma como visualiza ofertass, não existe mais essa aba, agr é somente produtos ou verificar pedido. Em produtos vc consegue ver as ofertas específicas daquele produto e em verificar pedido vc vê o que cada vendedor ganhou na cotação. 
 - Além dessas houveram alterações pontuais na interface

 # V213 - Adicionando modal de detalhes e melhorando a responsividade da tela de cotação. 

 - Eu estava sem liberdade e com uma grande limitação ao exibir os dados do produto, principalmente pq na tabela não cabe tudo o que eu preciso. Adicionei um modal de detalhes para o usuário conseguir ver mais dados sobre o produto, como origem da última compra, data da ultima compra, etc... 

 - Preciso replicar essas alterações de cotações, e deixar uma tela mais funcional na aplicação web, bem como replicar a estrutura visual em pedido direto, pra ficar o mesmo padrão e ajudar o usuário.

 # V215 - Novas atualizações

- Atualização da quantidade de boletos: permite informar e atualizar a quantidade de boletos disponível na cotação.
- Prazo de boletos: possibilita definir e visualizar o prazo para pagamento dos boletos.
- Observações: inclusão de observações adicionais na cotação para fornecer informações importantes aos participantes.
- Visibilidade para o vendedor: o vendedor consegue visualizar quando está participando de uma cotação e acompanhar novas informações e atualizações disponibilizadas sobre ela.
