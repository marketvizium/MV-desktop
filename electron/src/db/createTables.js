const { app } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

const dbPath = path.join(app.getPath('userData'), 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Erro ao abrir base de dados:', err.message);
});

function initDatabase() {
    db.serialize(() => {

        function logFornecedores() {
    const sql = `SELECT * FROM fornecedor_cadastrado ORDER BY nome_fornecedor ASC`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Erro ao consultar fornecedores:", err.message);
            return;
        }

        if (rows.length === 0) {
            console.log("Nenhum fornecedor encontrado na tabela.");
        } else {
            console.log(`Exibindo ${rows.length} fornecedores:`);
            // console.table cria uma visualização em formato de tabela no console
            console.table(rows);
        }
    });
}

// Chamada da função
logFornecedores()

        db.run(`DELETE FROM produto_cadastrado WHERE status_interno IN ('atualizar', 'deletar')`, [], (err, rows) => {
            if (err) {
                console.error("PRODUTOS DELETADOS", err.message);
                return;
            }else {
                console.log(`Funcionou`, rows);
                // Exibe os dados em formato de tabela no console para facilitar a leitura
            }
        });

        // Feita para ser auxiliar do item loja caso acabar a internet
        
        // Feita para ser auxiliar do item loja caso acabar a internet
        db.run(`CREATE TABLE IF NOT EXISTS produto_cadastrado (
            id_item INTEGER PRIMARY KEY,
            id_produto INTEGER,
            id_loja INTEGER,
            quantidade INTEGER,
            lote TEXT,
            data_validade INTEGER, -- Big Integer (timestamp)
            responsavel TEXT,
            status TEXT,
            id_fornecedor INTEGER,
            nome TEXT,
            codigo_barra TEXT,
            categoria TEXT,
            cnpj TEXT,
            nome_fornecedor TEXT,
            ncm TEXT,
            status_interno TEXT,
            busca_rapida TEXT,
            preco_custo REAL,      -- Float/Double
            margem REAL,
            preco_venda REAL,
            porcentagem_promo REAL,
            desativado INTEGER,    -- Usado como boolean (0 ou 1)
            ultimo_reajuste TEXT,
            gondula_estoque TEXT,
            gondula_loja TEXT,
            inicio_promo INTEGER,  -- Big Integer
            fim_promo INTEGER,     -- Big Integer
            ajuste_automatico INTEGER, -- Bool (0 ou 1)
            controle_lote INTEGER      -- Bool (0 ou 1)
        )`, (err) => {
            if (err) console.error("Erro ao criar tabela:", err.message);
            else console.log("Tabela 'produto_cadastrado' pronta!");
        })

         // Feita para ser auxiliar do item loja caso acabar a internet
        db.run(`CREATE TABLE IF NOT EXISTS novos_produtos_cadastro (
            id_item INTEGER PRIMARY KEY,
            id_loja INTEGER,
            responsavel TEXT,
            status TEXT,
            nome TEXT,
            codigo_barra TEXT,
            categoria TEXT,
            ncm TEXT,
            cnpj TEXT,
            nome_fornecedor TEXT,
            busca_rapida TEXT,
            preco_custo REAL,      -- Float/Double
            margem REAL,
            preco_venda REAL,
            desativado INTEGER,    -- Usado como boolean (0 ou 1)
            gondula_estoque TEXT,
            gondula_loja TEXT,
            ajuste_automatico INTEGER,  -- Bool (0 ou 1)
            controle_lote INTEGER,      -- Bool (0 ou 1)
            sync INTEGER                -- Bool (0 ou 1)
        )`, (err) => {
            if (err) console.error("Erro ao criar tabela:", err.message);
            else console.log("Tabela 'novos_produtos_cadastro' pronta!");
        })

        db.run(`CREATE TABLE IF NOT EXISTS produto_comp (
            id_item INTEGER PRIMARY KEY,
            id_loja INTEGER,
            status_interno TEXT,
            quantidade INTEGER,
            codigo_barra_comp TEXT,
            codigo_barra_prod TEXT,
            nome_composicao TEXT,
            desativado INTEGER         -- É int pq armazena a data, não booleano. Isso representa a data de desativação do produto. 
        )`, (err) => {
            if (err) console.error("Erro ao criar tabela:", err.message);
            else console.log("Tabela 'produto_comp' pronta!");
        })

        db.run(`CREATE TABLE IF NOT EXISTS novos_produtos_comp (
            id_item INTEGER PRIMARY KEY,
            id_loja INTEGER,
            quantidade INTEGER,
            codigo_barra_comp TEXT,
            codigo_barra_prod TEXT,
            nome_composicao TEXT,
            desativado INTEGER,         -- É int pq armazena a data, não booleano. Isso representa a data de desativação do produto. 
            sync INTEGER                -- Bool (0 ou 1)
        )`, (err) => {
            if (err) console.error("Erro ao criar tabela:", err.message);
            else console.log("Tabela 'novos_produtos_comp' pronta!");
        })

        db.run(`CREATE TABLE IF NOT EXISTS fornecedor (
            id_item INTEGER PRIMARY KEY,
            id_fornecedor INTEGER,
            id_loja INTEGER,
            nome_fornecedor TEXT,
            razao_social TEXT,
            status_interno TEXT,
            nome_fantasia TEXT,
            cnpj TEXT,
            status TEXT,
            email_principal TEXT,
            telefone_principal TEXT,
            criado_em TEXT,
            sync INTEGER
        )`, (err) => {
            if (err) console.error("Erro ao criar tabela:", err.message);
            else console.log("Tabela 'fornecedor' pronta!");
        })

        db.run(`CREATE TABLE IF NOT EXISTS fornecedor_cadastrado (
            id_item INTEGER PRIMARY KEY,
            nome_fornecedor TEXT,
            id_loja INTEGER,
            razao_social TEXT,
            nome_fantasia TEXT,
            cnpj TEXT,
            status TEXT,
            email_principal TEXT,
            telefone_principal TEXT,
            sync INTEGER
        )`, (err) => {
            if (err) console.error("Erro ao criar tabela:", err.message);
            else console.log("Tabela 'fornecedor_cadastrado' pronta!");
        })


        db.run(`CREATE TABLE IF NOT EXISTS entrada_estoque (
            id_entrada INTEGER PRIMARY KEY,
            quantidade INTEGER,
            lote TEXT,
            data_validade BIGINT,
            codigo_barra TEXT,
            id_loja INTEGER,
            responsavel TEXT,
            preco_custo FLOAT,
            cnpj TEXT,
            nome_fornecedor TEXT,
            sync INTEGER
        )`, (err) => {
            if (err) console.error("Erro ao criar tabela:", err.message);
            else console.log("Tabela 'entrada_estoque' pronta!");
        })

        db.run(`CREATE TABLE IF NOT EXISTS saida_estoque (
            id_entrada INTEGER PRIMARY KEY,
            quantidade INTEGER,
            lote TEXT,
            data_validade BIGINT,
            codigo_barra TEXT,
            responsavel TEXT,
            sync INTEGER
        )`, (err) => {
            if (err) console.error("Erro ao criar tabela:", err.message);
            else console.log("Tabela 'saida_estoque' pronta!");
        })

        db.run(`CREATE TABLE IF NOT EXISTS item_estoque (
            id_entrada INTEGER PRIMARY KEY,
            id_loja INTEGER
            quantidade INTEGER,
            id_estoque INTEGER,
            id_produto INTEGER,
            lote TEXT,
            data_validade BIGINT,
            codigo_barra TEXT,
            status_interno TEXT,
            responsavel TEXT,
            status TEXT,
            sync INTEGER
        )`, (err) => {
            if (err) console.error("Erro ao criar tabela:", err.message);
            else console.log("Tabela 'item_estoque' pronta!");
        })

    });
}


function verificarTabelas() {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
        if (err) {
            console.error("Erro ao listar tabelas:", err);
            return;
        }
        console.log("Tabelas encontradas no banco local:");
        console.table(rows); // Mostra uma tabelinha bonitinha no console
    });
}


verificarTabelas()

module.exports = { db, initDatabase };