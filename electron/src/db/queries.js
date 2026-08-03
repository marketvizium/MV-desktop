const { db }  = require('./createTables');


/**
 * Remove os dados antigos e salva a nova lista de produtos no SQLite
 */
async function salvarProdutosCadastro(produtosAPI) {
    return new Promise((resolve, reject) => {
        // 1. Buscamos tudo que NÃO é 'sync' (as alterações locais do usuário)
        const sqlPendentes = `
            SELECT * FROM produto_cadastrado 
            WHERE status_interno IN ('notsync', 'atualizar', 'deletar')
        `;

        db.all(sqlPendentes, [], (err, rowsPendentes) => {
            if (err) {
                console.error("Erro ao buscar produtos pendentes:", err);
                return reject(err);
            }

            // Criamos um Set com os IDs dos produtos que estão pendentes para filtro rápido
            const idsPendentes = new Set(rowsPendentes.map(p => p.id_item));

            // 2. Filtramos a lista da API: 
            // Se o produto já existe nos pendentes locais, ignoramos a versão da API
            const produtosFiltradosAPI = produtosAPI.filter(pAPI => !idsPendentes.has(pAPI.id_item));

            // 3. Unificamos as listas
            const listaFinal = [...rowsPendentes, ...produtosFiltradosAPI];

            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                // 4. Limpa a tabela para reconstruir com a união dos dados
                db.run("DELETE FROM produto_cadastrado", (err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        return reject(err);
                    }
                });

                const sqlInsert = `INSERT INTO produto_cadastrado (
                    id_item, id_produto, id_loja, quantidade, lote, data_validade, 
                    responsavel, status, id_fornecedor, nome, nome_fornecedor, cnpj, codigo_barra, 
                    categoria, ncm, status_interno, busca_rapida, preco_custo, margem, 
                    preco_venda, porcentagem_promo, desativado, ultimo_reajuste, 
                    gondula_estoque, gondula_loja, inicio_promo, fim_promo, 
                    ajuste_automatico, controle_lote
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                const stmt = db.prepare(sqlInsert);
                const QTD_DEFAULT_OFF = 99999;

                try {
                    listaFinal.forEach(p => {
                        // Se o produto já tem status_interno (veio do rowsPendentes), mantemos ele.
                        // Se não tem (veio da API), definimos como 'sync'.
                        const statusParaSalvar = p.status_interno || 'sync';

                        stmt.run([
                            p.id_item, 
                            p.id_produto, 
                            p.id_loja, 
                            QTD_DEFAULT_OFF, 
                            p.lote, 
                            p.data_validade,
                            p.responsavel, 
                            p.desativado ? null : "ativo", 
                            p.id_fornecedor, 
                            p.nome, 
                            p.nome_fornecedor, 
                            p.cnpj, 
                            p.codigo_barra,
                            p.categoria, 
                            p.ncm, 
                            statusParaSalvar, // <--- Status dinâmico
                            p.busca_rapida, 
                            p.preco_custo, 
                            p.margem,
                            p.preco_venda, 
                            p.porcentagem_promo, 
                            p.desativado ? 1 : 0, 
                            p.ultimo_reajuste, 
                            p.gondula_estoque, 
                            p.gondula_loja, 
                            p.inicio_promo,
                            p.fim_promo, 
                            p.ajuste_automatico ? 1 : 0, 
                            p.controle_lote ? 1 : 0
                        ]);
                    });
                    stmt.finalize();
                } catch (error) {
                    db.run("ROLLBACK");
                    return reject(error);
                }

                db.run("COMMIT", (err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        reject(err);
                    } else {
                        console.log(`✅ Cadastro atualizado: ${listaFinal.length} itens totais (${rowsPendentes.length} pendentes preservados).`);
                        resolve();
                    }
                });
            });
        });
    });
}

/**
 * Busca um ou mais produtos por código de barras
 */
async function buscarProdutoPorCodigo(codigoBarra, lote) {

    return new Promise((resolve, reject) => {

        lote ? lote = lote : null

        let sql = "SELECT * FROM item_loja WHERE codigo_barra = ?";
        const params = [codigoBarra];

        if (lote) {
            sql += " AND lote = ?";
            params.push(lote);
        }

        sql += " ORDER BY data_validade ASC";

        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error("Erro na busca por código:", err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Busca um ou mais produtos cadastrados por código de barras
 */
async function buscarProdutoCadastradoPorCodigo(codigoBarra, lote = null) {
    return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM produto_cadastrado WHERE codigo_barra = ?";
        const params = [codigoBarra];

        if (lote) {
            sql += " AND lote = ?";
            params.push(lote);
        }

        sql += " ORDER BY data_validade ASC";

        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error("Erro na busca por código:", err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}


/**
 * Todos os produtos que entram nessa função são considerados sincronizados já
 */
async function salvarItensEstoque(itens) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Inicia a transação para garantir integridade e performance
            db.run("BEGIN TRANSACTION");

            console.log(itens.length, "AAAAAAAAA")

            // Limpa a tabela antes de inserir os novos dados
            db.run("DELETE FROM item_estoque", (err) => {
                if (err) {
                    db.run("ROLLBACK");
                    reject(err);
                    return;
                }
            });

            const sql = `INSERT INTO item_estoque (
                id_entrada, id_loja, quantidade, id_estoque, id_produto, 
                lote, data_validade, status_interno, codigo_barra, responsavel, 
                status, sync
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'sync',?, ?, ?, ?)`;

            const stmt = db.prepare(sql);

            try {
                itens.forEach(item => {
                    stmt.run([
                        item.id_entrada,
                        item.id_loja,
                        item.quantidade,
                        item.id_estoque,
                        item.id_produto,
                        item.lote,
                        item.data_validade,
                        item.codigo_barra,
                        item.responsavel,
                        item.status,
                        1 
                    ]);
                });
                stmt.finalize();
            } catch (error) {
                db.run("ROLLBACK");
                reject(error);
                return;
            }

            // Finaliza a transação
            db.run("COMMIT", (err) => {
                if (err) {
                    db.run("ROLLBACK");
                    reject(err);
                } else {
                    console.log(`Tabela estoque atualizada com ${itens.length} itens.`);
                    resolve();
                }
            });
        });
    });
}

async function buscarEntradasNaoSincronizados() {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM entrada_estoque WHERE sync = 0";

        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error("Erro ao buscar itens não sincronizados:", err.message);
                reject(err);
                return;
            }
            
            // Retorna o array de objetos encontrados (ou um array vazio se não houver nenhum)
            resolve(rows);
        });
    });
}

async function buscarSaidasNaoSincronizados() {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM saida_estoque WHERE sync = 0";

        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error("Erro ao buscar itens não sincronizados:", err.message);
                reject(err);
                return;
            }
            
            // Retorna o array de objetos encontrados (ou um array vazio se não houver nenhum)
            resolve(rows);
        });
    });
    
}

async function setEntradaEstoque(produtos) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const verificarProdutoSQL = `SELECT id_item FROM produto_cadastrado WHERE codigo_barra = ? AND id_loja = ? AND desativado = 0`;
            const verificarEntradaSQL = `SELECT * FROM entrada_estoque WHERE codigo_barra = ? AND id_loja = ? AND ((lote IS NULL AND ? IS NULL) OR lote = ?)`;
            const atualizarSQL = `UPDATE entrada_estoque SET quantidade = quantidade + ? WHERE id_entrada = ?`;
            
            // Tabela entrada_estoque NÃO tem status_interno
            const inserirEntradaSQL = `INSERT INTO entrada_estoque (quantidade, lote, data_validade, codigo_barra, id_loja, responsavel, preco_custo, cnpj, nome_fornecedor, sync) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`;
            
            // Tabela item_estoque POSSUI status_interno
            const inserirItemEstoqueSQL = `INSERT INTO item_estoque (id_entrada, quantidade, lote, data_validade, codigo_barra, responsavel, status, status_interno, sync) VALUES (?, ?, ?, ?, ?, ?, 'ativo', 'notsync', 0)`;

            let pendentesValidacao = produtos.length;
            const naoCadastrados = [];

            produtos.forEach(prod => {
                db.get(verificarProdutoSQL, [prod.codigo_barra, prod.id_loja], (err, row) => {
                    if (err) return reject(err);
                    if (!row) naoCadastrados.push(prod.codigo_barra);
                    
                    pendentesValidacao--;
                    if (pendentesValidacao === 0) {
                        if (naoCadastrados.length > 0) {
                            return resolve({ sucesso: false, erro: "PRODUTOS_NAO_CADASTRADOS", naoCadastrados });
                        }

                        db.run("BEGIN TRANSACTION");
                        let pendentesProcessamento = produtos.length;

                        produtos.forEach(prod => {
                            db.get(verificarEntradaSQL, [prod.codigo_barra, prod.id_loja, prod.lote, prod.lote], (err, entrada) => {
                                if (err) { db.run("ROLLBACK"); return reject(err); }

                                const finalizarOperacao = (err) => {
                                    if (err) { db.run("ROLLBACK"); return reject(err); }
                                    pendentesProcessamento--;
                                    if (pendentesProcessamento === 0) {
                                        db.run("COMMIT", (err) => {
                                            if (err) { db.run("ROLLBACK"); return reject(err); }
                                            resolve({ sucesso: true });
                                        });
                                    }
                                };

                                if (entrada) {
                                    db.run(atualizarSQL, [prod.quantidade, entrada.id_entrada], finalizarOperacao);
                                } else {
                                    db.run(inserirEntradaSQL, [
                                        prod.quantidade, prod.lote, prod.data_validade, prod.codigo_barra, 
                                        prod.id_loja, prod.responsavel, prod.preco_custo, prod.cnpj, prod.nome_fornecedor
                                    ], function(err) {
                                        if (err) return finalizarOperacao(err);
                                        const lastId = this.lastID;

                                        db.run(inserirItemEstoqueSQL, [
                                            lastId, prod.quantidade, prod.lote, prod.data_validade, 
                                            prod.codigo_barra, prod.responsavel
                                        ], finalizarOperacao);
                                    });
                                }
                            });
                        });
                    }
                });
            });
        });
    });
}

async function marcarEntradasComoSincronizadas(entradas) {
    if (!entradas || entradas.length === 0) return;

    return new Promise((resolve, reject) => {
        const ids = entradas.map(item => item.id_entrada);
        const placeholders = ids.map(() => "?").join(",");

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            // Entrada: Apenas sync
            const sqlEntrada = `UPDATE entrada_estoque SET sync = 1 WHERE id_entrada IN (${placeholders})`;
            
            // Item: Sync e Status Interno
            const sqlItem = `UPDATE item_estoque SET sync = 1, status_interno = 'sync' WHERE id_entrada IN (${placeholders})`;

            db.run(sqlEntrada, ids, (err) => {
                if (err) { db.run("ROLLBACK"); return reject(err); }

                db.run(sqlItem, ids, function(err) {
                    if (err) { db.run("ROLLBACK"); return reject(err); }
                    
                    db.run("COMMIT", (err) => {
                        if (err) { db.run("ROLLBACK"); reject(err); }
                        else {
                            console.log(`Sucesso: ${this.changes} itens marcados como 'sync'.`);
                            resolve(this.changes);
                        }
                    });
                });
            });
        });
    });
}

async function salvarItensEstoqueLocal(itens) {
    return new Promise((resolve, reject) => {
        if (!itens || itens.length === 0) return resolve(0);

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            // SQL para encontrar o item local e marcar como sincronizado
            const sql = `
                UPDATE item_estoque 
                SET status_interno = 'sync', 
                    sync = 1,
                    id_entrada = ? 
                WHERE codigo_barra = ? 
                AND (
                    (lote IS NULL AND ? IS NULL) 
                    OR lote = ?
                )
            `;

            const stmt = db.prepare(sql);

            try {
                itens.forEach(item => {
                    // Passamos o id_entrada que veio do servidor para atualizar o ID local
                    stmt.run([
                        item.id_entrada,
                        item.codigo_barra,
                        item.lote,
                        item.lote
                    ]);
                });

                stmt.finalize((err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        return reject(err);
                    }

                    db.run("COMMIT", (err) => {
                        if (err) {
                            db.run("ROLLBACK");
                            reject(err);
                        } else {
                            console.log(`Sucesso: ${itens.length} itens confirmados como 'sync' no estoque.`);
                            resolve(itens.length);
                        }
                    });
                });
            } catch (error) {
                db.run("ROLLBACK");
                reject(error);
            }
        });
    });
}

async function SetSaidaEstoque(itens) {
    return new Promise((resolve, reject) => {
        if (!itens || itens.length === 0) {
            resolve({ sucesso: false, erro: "ARRAY_VAZIO" });
            return;
        }

        db.serialize(() => {
            // Busca a soma da quantidade para o código de barras e lote específico
            const verificarEstoqueSQL = `
                SELECT SUM(quantidade) as total_disponivel, codigo_barra, lote
                FROM item_estoque 
                WHERE codigo_barra = ? 
                AND (
                    (lote IS NULL AND ? IS NULL) 
                    OR (lote = ?)
                )
                GROUP BY codigo_barra, lote
            `;

            const inserirSaidaSQL = `
                INSERT INTO saida_estoque (
                    id_entrada, quantidade, lote, data_validade, 
                    codigo_barra, responsavel, sync
                ) VALUES (?, ?, ?, ?, ?, ?, 0)
            `;

            // =====================================
            // 1️⃣ VALIDAR ESTOQUE POR CÓDIGO E LOTE
            // =====================================
            let pendentesValidacao = itens.length;
            const itensSemSaldo = [];
            let erroFatal = false;

            itens.forEach(item => {
                db.get(
                    verificarEstoqueSQL, 
                    [item.codigo_barra, item.lote, item.lote], 
                    (err, row) => {
                        if (err || erroFatal) {
                            erroFatal = true;
                            if (!err) return;
                            reject(err);
                            return;
                        }

                        const disponivel = row ? row.total_disponivel : 0;

                        if (disponivel < item.quantidade) {
                            itensSemSaldo.push({
                                codigo_barra: item.codigo_barra,
                                lote: item.lote || "Sem Lote",
                                solicitado: item.quantidade,
                                disponivel: disponivel
                            });
                        }

                        pendentesValidacao--;

                        if (pendentesValidacao === 0) {
                            if (itensSemSaldo.length > 0) {
                                resolve({
                                    sucesso: false,
                                    erro: "ESTOQUE_INSUFICIENTE",
                                    detalhes: itensSemSaldo
                                });
                                return;
                            }

                            // =====================================
                            // 2️⃣ EXECUTAR SAÍDA (TUDO OK)
                            // =====================================
                            db.run("BEGIN TRANSACTION");

                            let pendentesProcessamento = itens.length;
                            const stmt = db.prepare(inserirSaidaSQL);

                            itens.forEach(item => {
                                stmt.run([
                                    item.id_entrada,
                                    item.quantidade,
                                    item.lote || null,
                                    item.data_validade || null,
                                    item.codigo_barra,
                                    item.responsavel
                                ], (err) => {
                                    if (err) {
                                        db.run("ROLLBACK");
                                        reject(err);
                                        return;
                                    }

                                    pendentesProcessamento--;

                                    if (pendentesProcessamento === 0) {
                                        stmt.finalize();
                                        db.run("COMMIT", (err) => {
                                            if (err) {
                                                db.run("ROLLBACK");
                                                reject(err);
                                            } else {
                                                resolve({ sucesso: true });
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    }
                );
            });
        });
    });
}

async function marcarSaidasComoSincronizadas(itens) {
    if (!itens || itens.length === 0) return 0;

    return new Promise((resolve, reject) => {
        // Extrai os id_entrada do payload recebido
        const ids = itens.map(item => item.id_entrada);
        
        // Cria os placeholders (?, ?, ?) proporcional à quantidade de itens
        const placeholders = ids.map(() => "?").join(",");
        const sql = `UPDATE saida_estoque SET sync = 1 WHERE id_entrada IN (${placeholders})`;

        db.run(sql, ids, function(err) {
            if (err) {
                console.error("Erro ao sincronizar saídas:", err.message);
                reject(err);
                return;
            }
            
            console.log(`Sucesso: ${this.changes} saídas marcadas como sincronizadas.`);
            resolve(this.changes);
        });
    });
}

async function atualizarEstoqueAposSaida(itens) {
    return new Promise((resolve, reject) => {
        if (!itens || itens.length === 0) {
            resolve(0);
            return;
        }

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            // Query para subtrair a quantidade do lote/entrada específica
            const sqlUpdate = `
                UPDATE item_estoque 
                SET quantidade = quantidade - ? 
                WHERE id_entrada = ? 
                AND codigo_barra = ?
            `;

            // Query opcional para remover registros que chegaram a zero
            const sqlDeleteVazios = `
                DELETE FROM item_estoque 
                WHERE quantidade <= 0
            `;

            const stmt = db.prepare(sqlUpdate);

            try {
                itens.forEach(item => {
                    stmt.run([
                        item.quantidade,
                        item.id_entrada,
                        item.codigo_barra
                    ]);
                });

                stmt.finalize();

                // Limpa o estoque de itens que zeraram para não poluir a tabela
                db.run(sqlDeleteVazios);

                db.run("COMMIT", (err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        reject(err);
                    } else {
                        console.log("Estoque local atualizado com sucesso.");
                        resolve(true);
                    }
                });
            } catch (error) {
                db.run("ROLLBACK");
                console.error("Erro ao atualizar estoque local:", error);
                reject(error);
            }
        });
    });
}

async function GetTodosItensEstoque(id_loja) {
    return new Promise((resolve, reject) => {
        // 1. Validação simples do parâmetro
        if (!id_loja) {
            return resolve([]);
        }

        // 2. Query com o filtro WHERE e ordenação pelos mais recentes
        const sql = `
            SELECT * FROM item_estoque 
            WHERE id_loja = ? 
            ORDER BY data_validade DESC
        `;

        // 3. Execução passando o id_loja no array de parâmetros [?]
        db.all(sql, [id_loja], (err, rows) => {
            if (err) {
                console.error(`Erro ao buscar estoque da loja ${id_loja}:`, err.message);
                reject(err);
                return;
            }

            console.log(rows.length, "AAAA")

            // Retorna a lista de itens daquela loja específica
            resolve(rows || []);
        });
    });
}

async function SetCadastroProduto(produto) {
    return new Promise((resolve, reject) => {

        if (!produto || !produto.codigo_barra || !produto.id_loja || !produto.nome || !produto.preco_custo || !produto.margem ||
            !produto.preco_venda || !produto.ncm || !produto.gondula_loja || !produto.gondula_estoque
        ) {
            resolve({
                sucesso: false,
                erro: "DADOS_INVALIDOS"
            });
            return;
        }

        db.serialize(() => {

            const verificarSQL = `SELECT codigo_barra FROM produto_cadastrado WHERE codigo_barra = ? AND id_loja = ? LIMIT 1`;
            const verificarNovosSQL = `SELECT codigo_barra FROM novos_produtos_cadastro WHERE codigo_barra = ? AND id_loja = ? LIMIT 1`;
            const verificarFornecedorSQL = `SELECT cnpj FROM fornecedor WHERE cnpj = ? LIMIT 1`;

            db.get(verificarSQL, [produto.codigo_barra, produto.id_loja], (err, row) => {
                if (err) return reject(err);
                if (row) return resolve({ sucesso: false, erro: "PRODUTO_JA_CADASTRADO" });

                db.get(verificarNovosSQL, [produto.codigo_barra, produto.id_loja], (err, rowNovo) => {
                    if (err) return reject(err);
                    if (rowNovo) return resolve({ sucesso: false, erro: "PRODUTO_JA_CADASTRADO" });

                    db.get(verificarFornecedorSQL, [produto.cnpj], (err, rowFornecedor) => {
                        if (err) return reject(err);
                        if (!rowFornecedor) return resolve({ sucesso: false, erro: "FORNECEDOR_INEXISTENTE" });

                        // 2️⃣ INÍCIO DA TRANSAÇÃO
                        db.run("BEGIN TRANSACTION");

                        // Adicionado status_interno na lista de colunas e um '?' extra no VALUES
                        const insertProdutoSQL = `
                            INSERT INTO produto_cadastrado (
                                id_loja, nome, codigo_barra, categoria, ncm, busca_rapida,
                                preco_custo, nome_fornecedor, cnpj, margem, preco_venda,
                                gondula_estoque, gondula_loja, ajuste_automatico, controle_lote, 
                                status_interno, desativado
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
                        `;

                        const insertNovoSQL = `
                            INSERT INTO novos_produtos_cadastro (
                                id_loja, responsavel, status, nome, codigo_barra, categoria, ncm, busca_rapida,
                                preco_custo, nome_fornecedor, cnpj, margem, preco_venda,
                                gondula_estoque, gondula_loja, ajuste_automatico, controle_lote, desativado, sync
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
                        `;

                        // ---------- EXECUÇÃO INSERT PRINCIPAL ----------
                        db.run(insertProdutoSQL, [
                            produto.id_loja,
                            produto.nome,
                            produto.codigo_barra,
                            produto.categoria,
                            produto.ncm,
                            produto.busca_rapida,
                            Number(produto.preco_custo),
                            produto.nome_fornecedor,
                            produto.cnpj,
                            Number(produto.margem),
                            Number(produto.preco_venda),
                            produto.gondula_estoque,
                            produto.gondula_loja,
                            produto.ajuste_automatico ? 1 : 0,
                            produto.controle_lote ? 1 : 0,
                            'notsync' // <--- Valor para a coluna status_interno
                        ], function (err) {
                            if (err) {
                                db.run("ROLLBACK");
                                return reject(err);
                            }

                            // ---------- EXECUÇÃO INSERT AUXILIAR ----------
                            db.run(insertNovoSQL, [
                                produto.id_loja,
                                produto.responsavel,
                                "NOVO",
                                produto.nome,
                                produto.codigo_barra,
                                produto.categoria,
                                produto.ncm,
                                produto.busca_rapida,
                                Number(produto.preco_custo),
                                produto.nome_fornecedor,
                                produto.cnpj,
                                Number(produto.margem),
                                Number(produto.preco_venda),
                                produto.gondula_estoque,
                                produto.gondula_loja,
                                produto.ajuste_automatico ? 1 : 0,
                                produto.controle_lote ? 1 : 0
                            ], (err) => {
                                if (err) {
                                    db.run("ROLLBACK");
                                    return reject(err);
                                }

                                db.run("COMMIT", (err) => {
                                    if (err) {
                                        db.run("ROLLBACK");
                                        reject(err);
                                    } else {
                                        resolve({ sucesso: true });
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

/**
 * Busca todos os produtos da tabela novos_produtos_cadastro 
 * que ainda não foram sincronizados (sync = 0) de todas as lojas.
 */
async function GetProdutosPendentesSyncGeral() {
    return new Promise((resolve, reject) => {

        const selectSQL = `
            SELECT 
                id_item,
                id_loja,
                responsavel,
                status,
                nome,
                nome_fornecedor,
                cnpj,
                codigo_barra,
                categoria,
                ncm,
                busca_rapida,
                preco_custo,
                margem,
                preco_venda,
                desativado,
                gondula_estoque,
                gondula_loja,
                ajuste_automatico,
                controle_lote,
                sync
            FROM novos_produtos_cadastro
            WHERE sync = 0
        `;

        db.all(selectSQL, [], (err, rows) => {
            if (err) {
                console.error("Erro crítico ao buscar produtos pendentes de sincronização:", err);
                reject(err);
                return;
            }

            // Retorna a lista completa de pendências
            resolve({
                sucesso: true,
                total_pendente: rows.length,
                dados: rows
            });
        });
    });
}

async function MarcarProdutosComoSincronizados(produtos) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            // 1. Update na fila de sincronização
            const updateNovosSQL = `
                UPDATE novos_produtos_cadastro 
                SET sync = 1 
                WHERE id_item = ?
            `;

            // 2. Update na tabela principal de produtos
            const updatePrincipalSQL = `
                UPDATE produto_cadastrado 
                SET status_interno = 'sync' 
                WHERE codigo_barra = ? AND id_loja = ?
            `;

            const stmtNovos = db.prepare(updateNovosSQL);
            const stmtPrincipal = db.prepare(updatePrincipalSQL);
            let erros = 0;

            produtos.forEach((produto) => {
                // Marca como sincronizado na fila (usando o ID único da fila)
                stmtNovos.run(produto.id_item, (err) => {
                    if (err) {
                        console.error(`Erro ao atualizar novos_produtos ID ${produto.id_item}:`, err);
                        erros++;
                    }
                });

                // Atualiza o status na tabela oficial (usando código de barras + loja)
                stmtPrincipal.run([produto.codigo_barra, produto.id_loja], (err) => {
                    if (err) {
                        console.error(`Erro ao atualizar produto_cadastrado CB ${produto.codigo_barra}:`, err);
                        erros++;
                    }
                });
            });

            // Finaliza ambos os statements
            stmtNovos.finalize();
            stmtPrincipal.finalize((err) => {
                if (err || erros > 0) {
                    db.run("ROLLBACK");
                    reject(err || new Error(`Falha ao sincronizar ${erros} operações.`));
                } else {
                    db.run("COMMIT", (errCommit) => {
                        if (errCommit) {
                            db.run("ROLLBACK");
                            reject(errCommit);
                        } else {
                            console.log(`Sucesso: ${produtos.length} produtos marcados como 'sync' em ambas tabelas.`);
                            resolve({ sucesso: true });
                        }
                    });
                }
            });
        });
    });
}

async function GetProdutosComStatusSync(id_loja) {
    return new Promise((resolve, reject) => {
        
        // 1. Validação do parâmetro
        if (!id_loja) {
            return resolve({ sucesso: false, erro: "ID_LOJA_OBRIGATORIO" });
        }

        const selectSQL = `
            SELECT 
                p.id_item,
                p.id_produto,
                p.id_loja,
                p.quantidade,
                p.lote,
                p.data_validade,
                p.responsavel,
                p.status,
                p.id_fornecedor,
                p.nome,
                p.codigo_barra,
                p.status_interno,
                p.categoria,
                p.cnpj,
                p.nome_fornecedor,
                p.ncm,
                p.busca_rapida,
                p.preco_custo,
                p.margem,
                p.preco_venda,
                p.porcentagem_promo,
                p.desativado,
                p.ultimo_reajuste,
                p.gondula_estoque,
                p.gondula_loja,
                p.inicio_promo,
                p.fim_promo,
                p.ajuste_automatico,
                p.controle_lote,
                COALESCE(n.sync, 1) AS sync 
            FROM produto_cadastrado p
            LEFT JOIN novos_produtos_cadastro n 
                ON p.id_loja = n.id_loja 
                AND p.codigo_barra = n.codigo_barra
            WHERE p.id_loja = ? 
            AND p.desativado IS NOT NULL
            ORDER BY p.id_item
        `;

        // 2. Passamos o id_loja no array de parâmetros
        db.all(selectSQL, [id_loja], (err, rows) => {
            if (err) {
                console.error("Erro ao buscar produtos:", err.message);
                reject(err);
                return;
            }

            resolve({
                sucesso: true,
                total: rows ? rows.length : 0,
                dados: rows || []
            });
        });
    });
}


async function salvarFornecedores(fornecedoresVindosDaAPI) {
    return new Promise((resolve, reject) => {
        // 1. Primeiro, buscamos os fornecedores locais que ainda não foram sincronizados
        const sqlPendentes = `SELECT * FROM fornecedor_cadastrado WHERE sync = 0`;

        db.all(sqlPendentes, [], (err, rowsPendentes) => {
            if (err) {
                console.error("Erro ao buscar pendentes locais:", err);
                return reject(err);
            }

            // Unificamos a lista: API + Pendentes Locais
            // Mapeamos os pendentes para o formato da tabela 'fornecedor'
            const pendentesFormatados = rowsPendentes.map(p => ({
                id_fornecedor: null, // Ainda não tem ID do servidor
                nome_fornecedor: p.nome_fornecedor,
                id_loja: p.id_loja,
                razao_social: p.razao_social,
                status_interno: "notsync", // Mantém como pendente visualmente
                nome_fantasia: p.nome_fantasia,
                cnpj: p.cnpj,
                status: p.status,
                email_principal: p.email_principal,
                telefone_principal: p.telefone_principal,
                criado_em: new Date().toISOString(),
                sync: 0
            }));

            // Lista final para inserção
            const listaFinal = [...fornecedoresVindosDaAPI, ...pendentesFormatados];

            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                // Limpa a tabela de fila/cache
                db.run("DELETE FROM fornecedor");

                const sqlInsert = `INSERT INTO fornecedor (
                    id_fornecedor, nome_fornecedor, id_loja, razao_social, status_interno, nome_fantasia, 
                    cnpj, status, email_principal, telefone_principal, criado_em, sync
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                const stmt = db.prepare(sqlInsert);

                listaFinal.forEach((f) => {
                    stmt.run([
                        f.id_fornecedor || null,
                        f.nome_fornecedor,
                        f.id_loja,
                        f.razao_social || null,
                        f.status_interno || "sync", // "sync" para os da API, "notsync" para os locais
                        f.nome_fantasia || null,
                        f.cnpj || null,
                        f.status || "ativo",
                        f.email_principal || null,
                        f.telefone_principal || null,
                        f.criado_em || null,
                        f.sync ?? 1
                    ]);
                });

                stmt.finalize((err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        return reject(err);
                    }

                    db.run("COMMIT", (err) => {
                        if (err) {
                            db.run("ROLLBACK");
                            reject(err);
                        } else {
                            console.log(`Sucesso: ${listaFinal.length} fornecedores processados (${rowsPendentes.length} locais pendentes).`);
                            resolve({ sucesso: true });
                        }
                    });
                });
            });
        });
    });
}

//Faz a consulta dos fornecedores cadastrados (NAO FEITO)
async function GetFornecedoresCadastrados(id_loja) {
    return new Promise((resolve, reject) => {
        // Usamos o '?' como placeholder
        const sql = `SELECT * FROM fornecedor WHERE id_loja = ? ORDER BY nome_fornecedor ASC`;

        db.all(sql, [id_loja], (err, rows) => {
            if (err) {
                console.error("Erro na consulta:", err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

//Salva no banco local os novos fornecedores (NAO FEITO)
async function SalvarNovoFornecedor(fornecedor) {
    return new Promise((resolve, reject) => {
        if (!fornecedor.cnpj || !fornecedor.id_loja) {
            return resolve({ sucesso: false, erro: "DADOS_FALTANTES" });
        }

        db.serialize(() => {
            const checkSQL = `SELECT cnpj FROM fornecedor_cadastrado WHERE cnpj = ? AND id_loja = ? LIMIT 1`;
            
            db.get(checkSQL, [fornecedor.cnpj, fornecedor.id_loja], (err, row) => {
                if (err) return reject(err);
                if (row) return resolve({ sucesso: false, erro: "INDUSTRIA_JA_CADASTRADA" });

                db.run("BEGIN TRANSACTION");

                // CORREÇÃO: Adicionada uma "?" extra para o valor '0' do sync (Total 9 colunas, 9 interrogações)
                const sqlCadastrado = `INSERT INTO fornecedor_cadastrado (
                    nome_fornecedor, id_loja, razao_social, nome_fantasia, 
                    cnpj, status, email_principal, telefone_principal, sync
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                // CORREÇÃO: Adicionada uma "?" extra (Total 11 colunas, 11 interrogações)
                const sqlFila = `INSERT INTO fornecedor (
                    id_fornecedor, nome_fornecedor, razao_social, status_interno, nome_fantasia, 
                    cnpj, status, email_principal, telefone_principal, criado_em, sync
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                db.run(sqlCadastrado, [
                    fornecedor.nome_fornecedor,
                    fornecedor.id_loja,
                    fornecedor.razao_social,
                    fornecedor.nome_fantasia,
                    fornecedor.cnpj,
                    fornecedor.status || 'ATIVO',
                    fornecedor.email_principal,
                    fornecedor.telefone_principal,
                    0 // valor para a 9ª interrogação (sync)
                ], function(err) {
                    if (err) {
                        db.run("ROLLBACK");
                        return reject(err);
                    }

                    db.run(sqlFila, [
                        null,
                        fornecedor.nome_fornecedor,
                        fornecedor.razao_social,
                        'notsync',
                        fornecedor.nome_fantasia,
                        fornecedor.cnpj,
                        fornecedor.status || 'ATIVO',
                        fornecedor.email_principal,
                        fornecedor.telefone_principal,
                        new Date().toISOString(),
                        0 // valor para a 11ª interrogação (sync)
                    ], (err) => {
                        if (err) {
                            db.run("ROLLBACK");
                            return reject(err);
                        }

                        db.run("COMMIT", (err) => {
                            if (err) {
                                db.run("ROLLBACK");
                                reject(err);
                            } else {
                                console.log(`Fornecedor ${fornecedor.nome_fornecedor} salvo.`);
                                resolve({ sucesso: true });
                            }
                        });
                    });
                });
            });
        });
    });
}

//Consulta todos os fornecedores presentes (NAO FEITO)
async function GetFornecedoresPendentes() {
    return new Promise((resolve, reject) => {
        // Seleciona apenas os que estão com sync 0 na tabela de cadastro
        const sql = `SELECT * FROM fornecedor_cadastrado WHERE sync = 0`;
        
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error("Erro ao buscar fornecedores pendentes:", err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

//Confirma a sincronizacao por id item e cnpj (NAO FEITO)
async function ConfirmarSincronizacaoLote(fornecedores) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(fornecedores) || fornecedores.length === 0) {
            return resolve({ sucesso: true, mensagem: "Vazio" });
        }

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            const sqlCadastrado = `UPDATE fornecedor_cadastrado SET sync = 1 WHERE id_item = ?`;
            const sqlFila = `UPDATE fornecedor SET status_interno = 'sync', sync = 1 WHERE cnpj = ?`;

            const stmtCadastrado = db.prepare(sqlCadastrado);
            const stmtFila = db.prepare(sqlFila);

            // Criamos uma lista de promessas para cada execução
            const execucoes = fornecedores.map(f => {
                return new Promise((res, rej) => {
                    // Executa na primeira tabela
                    stmtCadastrado.run([f.id_item], (err) => {
                        if (err) return rej(err);
                        
                        // Executa na segunda tabela (usando o CNPJ exatamente como veio)
                        stmtFila.run([f.cnpj], (err2) => {
                            if (err2) return rej(err2);
                            res();
                        });
                    });
                });
            });

            // O pulo do gato: Esperar todas as execuções terminarem antes de fechar a transação
            Promise.all(execucoes)
                .then(() => {
                    stmtCadastrado.finalize();
                    stmtFila.finalize();
                    
                    db.run("COMMIT", (err) => {
                        if (err) {
                            db.run("ROLLBACK");
                            reject(err);
                        } else {
                            console.log(`✅ ${fornecedores.length} fornecedores sincronizados com sucesso.`);
                            resolve({ sucesso: true });
                        }
                    });
                })
                .catch((err) => {
                    stmtCadastrado.finalize();
                    stmtFila.finalize();
                    db.run("ROLLBACK");
                    console.error("❌ Erro ao sincronizar lote:", err);
                    reject(err);
                });
        });
    });
}

async function GetProdutosVencidos(id_loja) {
    return new Promise((resolve, reject) => {
        if (!id_loja) return resolve([]);

        const agora = Date.now(); // Timestamp atual em ms

        // Compara números (BIGINT) diretamente
        const sql = `
            SELECT * FROM item_estoque 
            WHERE id_loja = ? 
            AND data_validade < ?
            ORDER BY data_validade ASC
        `;

        db.all(sql, [id_loja, agora], (err, rows) => {
            if (err) {
                console.error("Erro ao buscar produtos vencidos:", err.message);
                reject(err);
                return;
            }
            resolve(rows || []);
        });
    });
}

async function GetProdutosProximosVencimento(id_loja, dias = 30) {
    return new Promise((resolve, reject) => {
        if (!id_loja) return resolve([]);

        // 1. Pegamos o timestamp de AGORA (em milissegundos)
        const agora = Date.now();
        
        // 2. Calculamos o limite futuro (hoje + X dias em ms)
        // (dias * 24 horas * 60 minutos * 60 segundos * 1000 milissegundos)
        const margemFutura = agora + (dias * 24 * 60 * 60 * 1000);

        // 3. A query agora compara apenas Números (BIGINT)
        const sql = `
            SELECT * FROM item_estoque 
            WHERE id_loja = ? 
            AND data_validade >= ? 
            AND data_validade <= ?
            AND status = 'ativo'
            ORDER BY data_validade ASC
        `;

        db.all(sql, [id_loja, agora, margemFutura], (err, rows) => {
            if (err) {
                console.error("Erro ao buscar produtos próximos do vencimento:", err.message);
                reject(err);
                return;
            }
            resolve(rows || []);
        });
    });
}

async function salvarProdutosComposicao(produtosVindosDaAPI) {
    return new Promise((resolve, reject) => {
        // 1. Buscamos todas as composições que possuem qualquer alteração local pendente
        const sqlPendentes = `
            SELECT * FROM produto_comp 
            WHERE status_interno IN ('notsync', 'atualizar', 'deletar')
        `;

        db.all(sqlPendentes, [], (err, rowsPendentes) => {
            if (err) {
                console.error("Erro ao buscar composições locais pendentes:", err);
                return reject(err);
            }

            // Criamos um Set com os códigos de barras pendentes para busca rápida (O(1))
            const codigosPendentes = new Set(rowsPendentes.map(p => p.codigo_barra_comp));

            // 2. Filtramos os produtos da API: 
            // Só adicionamos o produto da API se ele NÃO estiver na nossa lista de pendentes locais
            const produtosFiltradosAPI = produtosVindosDaAPI.filter(pAPI => 
                !codigosPendentes.has(pAPI.codigo_barra_comp)
            );

            // 3. Unificamos: Pendentes Locais (com status original) + Novos da API (que não conflitam)
            const listaFinal = [...rowsPendentes, ...produtosFiltradosAPI];

            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                // Limpa a tabela para reconstruir
                db.run("DELETE FROM produto_comp", (err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        return reject(err);
                    }
                });

                const sqlInsert = `INSERT INTO produto_comp (
                    id_loja, status_interno, quantidade, codigo_barra_comp, 
                    codigo_barra_prod, nome_composicao, desativado
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`;

                const stmt = db.prepare(sqlInsert);

                listaFinal.forEach((p) => {
                    // Se o status_interno não existir (item da API puro), definimos como 'sync'
                    // Caso contrário, mantemos o status que já estava (notsync, atualizar ou deletar)
                    const statusParaSalvar = p.status_interno || "sync";

                    stmt.run([
                        p.id_loja,
                        statusParaSalvar,
                        p.quantidade,
                        p.codigo_barra_comp,
                        p.codigo_barra_prod,
                        p.nome_composicao,
                        p.desativado || null
                    ]);
                });

                stmt.finalize((err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        return reject(err);
                    }

                    db.run("COMMIT", (err) => {
                        if (err) {
                            db.run("ROLLBACK");
                            reject(err);
                        } else {
                            console.log(`Sincronização: ${listaFinal.length} totais. ${rowsPendentes.length} pendentes preservados.`);
                            resolve({ sucesso: true });
                        }
                    });
                });
            });
        });
    });
}

async function setProdutoComposicao(produto) {
    return new Promise((resolve, reject) => {
        if (!produto.codigo_barra_comp || !produto.codigo_barra_prod || !produto.nome_composicao || !produto.quantidade) {
            return resolve({ sucesso: false, erro: "DADOS_FALTANTES" });
        }

        db.serialize(() => {
            const checkSQL = `SELECT codigo_barra_comp FROM produto_comp WHERE codigo_barra_comp = ? AND id_loja = ? LIMIT 1`;
            
            db.get(checkSQL, [produto.codigo_barra_comp, produto.id_loja], (err, row) => {
                if (err) return reject(err);
                if (row) return resolve({ sucesso: false, erro: "PRODUTO_COMP_JA_CADASTRADO" });

                const checkSQLprodutoCadastro = `SELECT codigo_barra FROM produto_cadastrado WHERE codigo_barra = ? AND id_loja = ? LIMIT 1`;
            
                db.get(checkSQLprodutoCadastro, [produto.codigo_barra_prod, produto.id_loja], (err, row) => {
                    if (err) return reject(err);

                    console.log("ROW AÍ", row, produto.codigo_barra_prod, produto.id_loja)
                    if (!row) {

                        console.log(row)

                        return resolve({ sucesso: false, erro: "PRODUTO_PROD_NAO_CADASTRADO" });
                    }

                    db.run("BEGIN TRANSACTION");
    
                    // Ajustado para 7 interrogações para bater com as 7 colunas
                    const sqlCadastrado = `INSERT INTO produto_comp (
                        id_loja, codigo_barra_comp, codigo_barra_prod, nome_composicao, 
                        quantidade, status_interno, desativado
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
                    const sqlFila = `INSERT INTO novos_produtos_comp (
                        id_loja, codigo_barra_comp, codigo_barra_prod, nome_composicao, 
                        quantidade, sync, desativado
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
                    db.run(sqlCadastrado, [
                        produto.id_loja,
                        produto.codigo_barra_comp,
                        produto.codigo_barra_prod,
                        produto.nome_composicao,
                        produto.quantidade,
                        'notsync',
                        null // Valor para desativado
                    ], function(err) {
                        if (err) {
                            db.run("ROLLBACK");
                            return reject(err);
                        }
    
                        db.run(sqlFila, [
                            produto.id_loja,
                            produto.codigo_barra_comp,
                            produto.codigo_barra_prod,
                            produto.nome_composicao,
                            produto.quantidade,
                            0,   // sync
                            null // desativado
                        ], (err) => {
                            if (err) {
                                db.run("ROLLBACK");
                                return reject(err);
                            }
    
                            db.run("COMMIT", (err) => {
                                if (err) {
                                    db.run("ROLLBACK");
                                    reject(err);
                                } else {
                                    console.log(`Produto composição ${produto.nome_composicao} salvo.`);
                                    resolve({ sucesso: true });
                                }
                            });
                        });
                    });
                });
            });
        });
    });
}

/* Lembra que como é sincronização, não precisa necessariamente do id_loja. Pq se n só vai sincronizar as coisas se ele entrar
com a loja especifica. Se é uma tabela que irei consultar e exibir especificamente pra minha loja, blz. Mas como é pra sincronizar,
a partir do momento do login, eu sincronizo tudo debaixo dos panos */
async function GetProdutosCompPendentes() {
    return new Promise((resolve, reject) => {
        // Seleciona apenas os registros da tabela de fila com sync 0
        const sql = `SELECT * FROM novos_produtos_comp WHERE sync = 0`;
        
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error("Erro ao buscar produtos de composição pendentes:", err.message);
                reject(err);
            } else {
                // Retorna a lista de pendentes (ou [] se não houver nenhum)
                resolve(rows || []);
            }
        });
    });
}

async function ConfirmarSincronizacaoLoteComp(composicoes) {
    return new Promise((resolve, reject) => {
        // 1. Validação de entrada (garante que é um Array e não está vazio)
        if (!Array.isArray(composicoes) || composicoes.length === 0) {
            return resolve({ sucesso: true, mensagem: "Nenhum item para processar." });
        }

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            // Queries para atualizar ambas as tabelas
            const sqlFila = `UPDATE novos_produtos_comp SET sync = 1 WHERE id_item = ?`;
            const sqlPrincipal = `UPDATE produto_comp SET status_interno = 'sync' WHERE codigo_barra_comp = ? AND id_loja = ?`;

            const stmtFila = db.prepare(sqlFila);
            const stmtPrincipal = db.prepare(sqlPrincipal);

            // Mapeamos cada item para uma Promise de execução no banco
            const execucoes = composicoes.map(c => {
                return new Promise((res, rej) => {
                    // Primeiro atualiza a tabela de fila (novos_produtos_comp) pelo ID
                    stmtFila.run([c.id_item], (err) => {
                        if (err) return rej(err);
                        
                        // Depois atualiza a tabela principal pelo Código de Barras + Loja
                        stmtPrincipal.run([c.codigo_barra_comp, c.id_loja], (err2) => {
                            if (err2) return rej(err2);
                            res();
                        });
                    });
                });
            });

            // Espera todas as atualizações terminarem antes de fechar a transação
            Promise.all(execucoes)
                .then(() => {
                    stmtFila.finalize();
                    stmtPrincipal.finalize();
                    
                    db.run("COMMIT", (err) => {
                        if (err) {
                            db.run("ROLLBACK");
                            reject(err);
                        } else {
                            console.log(`✅ ${composicoes.length} composições marcadas como sincronizadas.`);
                            resolve({ sucesso: true });
                        }
                    });
                })
                .catch((err) => {
                    stmtFila.finalize();
                    stmtPrincipal.finalize();
                    db.run("ROLLBACK");
                    console.error("❌ Erro ao sincronizar lote de composição:", err);
                    reject(err);
                });
        });
    });
}

async function getAllProdutosComposicao(id_loja) {
    return new Promise((resolve, reject) => {
        // 1. Validação do parâmetro obrigatório
        if (!id_loja) {
            console.error("Tentativa de buscar composições sem id_loja");
            return resolve([]);
        }

        // 2. Query para buscar todos os itens (sync e notsync)
        // Ordenamos pelos mais recentes para facilitar a visualização na UI
        const sql = `
            SELECT * FROM produto_comp 
            WHERE id_loja = ?
            AND desativado IS NULL
            ORDER BY id_item DESC
        `;

        // 3. Execução da consulta
        db.all(sql, [id_loja], (err, rows) => {
            if (err) {
                console.error(`Erro ao buscar composições da loja ${id_loja}:`, err.message);
                reject(err);
                return;
            }

            // Retorna o array de resultados (ou vazio caso não existam dados)
            // Cada objeto terá a propriedade 'status_interno' (sync/notsync)
            resolve(rows || []);
        });
    });
}


//A logica desses caras tem que mudar, eu preciso alterar o notsync para atualizar ou deletar no produto_comp. Eu estou tentando atualizar produtos
//em uma tabela que não existe eles, pq só existe os novos cadastrados. Não faz sentido... Eu preciso pegar, mudar esses produtos de notsync para 
//atualizar ou deletar, e quando sincronizar, passar para sync novamente. Não devo ter sync 2 ou 3 mais, ou mexer em novos_produtos_comp, devo mexer
//somente em produtos_comp, não posso sobrescrever na função salvarProdutosComposicao() aqueles que estão pendentes para sincronizar, com atualizar,
//deletar ou notsync. Recebo os novos, mas não sobrescrevo... Não posso perder esse dado.
async function updateProdutoComp(payload) {
    return new Promise((resolve, reject) => {
        if (!payload.id_item || !payload.id_loja || !payload.acao) {
            return resolve({ sucesso: false, erro: "DADOS_INSUFICIENTES" });
        }

        const timestampAtual = Date.now();
        const isDelete = payload.acao === 'deletar';

        // Definimos o novo status baseado na ação
        // Se a ação é deletar, o status é 'deletar'
        // Se a ação é atualizar, o status é 'atualizar'
        const novoStatus = isDelete ? 'deletar' : 'atualizar';
        const desativadoValor = isDelete ? timestampAtual : payload.desativado;

        const sql = `
            UPDATE produto_comp 
            SET quantidade = ?, 
                nome_composicao = ?, 
                status_interno = ?, 
                desativado = ?
            WHERE id_item = ? AND id_loja = ?
        `;

        db.run(sql, [
            payload.quantidade,
            payload.nome_composicao,
            novoStatus,
            desativadoValor,
            payload.id_item,
            payload.id_loja
        ], function(err) {
            if (err) {
                console.error("Erro ao atualizar produto_comp:", err.message);
                return reject(err);
            }
            console.log(`✅ Produto ${payload.id_item} marcado como '${novoStatus}' localmente.`);
            resolve({ sucesso: true });
        });
    });
}

async function GetProdutosCompAlteradosOuDeletados(id_loja) {
    return new Promise((resolve, reject) => {
        // Buscamos tudo que precisa de atenção do servidor (atualizações ou deleções)
        const sql = `
            SELECT * FROM produto_comp 
            WHERE status_interno IN ('atualizar', 'deletar')
        `;

        db.all(sql, (err, rows) => {
            if (err) {
                console.error("Erro ao buscar pendentes em produto_comp:", err.message);
                reject(err);
                return;
            }

            resolve(rows || []);
        });
    });
}

async function ConfirmarEdicaoDelecaoLote(composicoes) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(composicoes) || composicoes.length === 0) {
            return resolve({ sucesso: true });
        }

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            const sql = `UPDATE produto_comp SET status_interno = 'sync' WHERE id_item = ? AND id_loja = ?`;
            const stmt = db.prepare(sql);

            const execucoes = composicoes.map(c => {
                return new Promise((res, rej) => {
                    stmt.run([c.id_item, c.id_loja], (err) => {
                        if (err) return rej(err);
                        res();
                    });
                });
            });

            Promise.all(execucoes)
                .then(() => {
                    stmt.finalize();
                    db.run("COMMIT", (err) => {
                        if (err) {
                            db.run("ROLLBACK");
                            reject(err);
                        } else {
                            console.log(`✅ Sincronização confirmada para ${composicoes.length} itens em produto_comp.`);
                            resolve({ sucesso: true });
                        }
                    });
                })
                .catch((err) => {
                    stmt.finalize();
                    db.run("ROLLBACK");
                    reject(err);
                });
        });
    });
}

async function updateProdutoCadastrado(payload) {
    return new Promise((resolve, reject) => {
        // 1. Validação de segurança
        if (!payload.id_item || !payload.id_loja || !payload.acao) {
            return resolve({ sucesso: false, erro: "DADOS_INSUFICIENTES" });
        }

        const isDelete = payload.acao === 'deletar';
        const novoStatusInterno = isDelete ? 'deletar' : 'atualizar';
        
        // Mapeamento dos valores conforme o Front-end
        // Se desativado for true (checkbox marcado), mandamos 1, senão 0
        const desativadoValor = payload.desativado ? 1 : 0;
        const valorStatusAtivo = payload.desativado ? "desativado" : "ativo";

        // SQL contendo APENAS o que o seu formulário edita
        const sql = `
            UPDATE produto_cadastrado 
            SET 
                nome = ?,
                preco_custo = ?, 
                margem = ?, 
                preco_venda = ?,
                gondula_estoque = ?, 
                gondula_loja = ?, 
                ncm = ?,
                controle_lote = ?,
                ajuste_automatico = ?,
                status = ?, 
                desativado = ?,
                status_interno = ?
            WHERE id_item = ? AND id_loja = ?
        `;

        // ORDEM DOS PARÂMETROS (Deve ser idêntica ao SQL acima)
        const params = [
            payload.nome,                           // nome = ?
            payload.preco_custo,                    // preco_custo = ?
            payload.margem,                         // margem = ?
            payload.preco_venda,                    // preco_venda = ?
            payload.gondula_estoque,                // gondula_estoque = ?
            payload.gondula_loja,                   // gondula_loja = ?
            payload.ncm || null,                    // ncm = ?
            payload.controle_lote ? 1 : 0,          // controle_lote = ?
            payload.ajuste_automatico ? 1 : 0,      // ajuste_automatico = ?
            valorStatusAtivo,                       // status = ?
            desativadoValor,                        // desativado = ?
            novoStatusInterno,                      // status_interno = ?
            payload.id_item,                        // WHERE id_item = ?
            payload.id_loja                         // AND id_loja = ?
        ];

        console.log("AAAA PAYLOAD", params)

        db.run(sql, params, function(err) {
            if (err) {
                console.error("❌ Erro SQL:", err.message);
                return reject(err);
            }

            console.log(`✅ Produto ${payload.id_item} atualizado com sucesso no banco local.`);
            resolve({ sucesso: true, alteracoes: this.changes });
        });
    });
}

async function GetProdutosCadastradosAlteradosOuDeletados(id_loja) {
    return new Promise((resolve, reject) => {
        // 1. Validação do ID da loja (essencial para não misturar dados)
        if (!id_loja) {
            console.error("ID da loja não fornecido para busca de pendentes.");
            return resolve([]);
        }

        // 2. Query focada nos status de alteração e deleção
        const sql = `
            SELECT * FROM produto_cadastrado 
            WHERE id_loja = ? 
            AND status_interno IN ('atualizar', 'deletar')
            ORDER BY id_item ASC
        `;

        console.log(`🔍 Verificando pendências (Update/Delete) para a loja: ${id_loja}`);

        db.all(sql, [id_loja], (err, rows) => {
            if (err) {
                console.error("❌ Erro ao consultar produto_cadastrado:", err.message);
                return reject(err);
            }

            // Log para debug no terminal do Electron
            if (rows && rows.length > 0) {
                console.log(`[SYNC] Encontrados ${rows.length} produtos para atualizar/deletar.`);
                // console.table(rows); // Opcional: para ver os dados formatados no terminal
            }

            resolve(rows || []);
        });
    });
}

async function ConfirmarEdicaoDelecaoProdutoLote(produtos) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(produtos) || produtos.length === 0) {
            return resolve({ sucesso: true });
        }

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            const sql = `
                UPDATE produto_cadastrado 
                SET status_interno = 'sync' 
                WHERE id_item = ? AND id_loja = ?
            `;

            const stmt = db.prepare(sql);

            const execucoes = produtos.map(p => {
                return new Promise((res, rej) => {
                    stmt.run([p.id_item, p.id_loja], (err) => {
                        if (err) return rej(err);
                        res();
                    });
                });
            });

            Promise.all(execucoes)
                .then(() => {
                    stmt.finalize();
                    db.run("COMMIT", (err) => {
                        if (err) {
                            db.run("ROLLBACK");
                            reject(err);
                        } else {
                            console.log(`✅ Banco Local: ${produtos.length} produtos marcados como 'sync'.`);
                            resolve({ sucesso: true });
                        }
                    });
                })
                .catch((err) => {
                    stmt.finalize();
                    db.run("ROLLBACK");
                    console.error("❌ Erro ao confirmar transação no banco:", err);
                    reject(err);
                });
        });
    });
}

module.exports = { 
    buscarProdutoPorCodigo,
    salvarProdutosCadastro,
    buscarProdutoCadastradoPorCodigo,
    salvarItensEstoque,
    buscarEntradasNaoSincronizados,
    buscarSaidasNaoSincronizados,
    setEntradaEstoque,
    marcarEntradasComoSincronizadas,
    salvarItensEstoqueLocal,
    SetSaidaEstoque,
    marcarSaidasComoSincronizadas,
    atualizarEstoqueAposSaida,
    SetCadastroProduto,
    GetProdutosPendentesSyncGeral,
    MarcarProdutosComoSincronizados,
    GetProdutosComStatusSync,
    salvarFornecedores, 
    GetFornecedoresCadastrados,
    SalvarNovoFornecedor,
    GetFornecedoresPendentes,
    ConfirmarSincronizacaoLote,
    GetTodosItensEstoque,
    GetProdutosVencidos,
    GetProdutosProximosVencimento,
    salvarProdutosComposicao,
    setProdutoComposicao,
    GetProdutosCompPendentes,
    ConfirmarSincronizacaoLoteComp,
    getAllProdutosComposicao,
    updateProdutoComp,
    GetProdutosCompAlteradosOuDeletados,
    ConfirmarEdicaoDelecaoLote,
    updateProdutoCadastrado,
    GetProdutosCadastradosAlteradosOuDeletados,
    ConfirmarEdicaoDelecaoProdutoLote,
};