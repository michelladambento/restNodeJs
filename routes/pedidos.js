const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;

// RETORNA TODOS OS PEDIDOS
router.get("/", (req, res, next) => {
	mysql.getConnection((error, conn) => {
		if (error) {
			return res.status(500).send({ error: error });
		}
		conn.query("SELECT * FROM pedidos", (error, result, fields) => {
			if (error) {
				return res.status(500).send({ error: error });
			}
			const response = {
				quantidade: result.length,
				pedidos: result.map((pedido) => {
					return {
						id_pedido: pedido.id_pedido,
						quantidade: pedido.quantidade,
						id_produto: pedido.id_produto,
						request: {
							tipo: "GET",
							descricao: "Retorna detalhe de um Pedido específico",
							url:
								"http://michellbento-tk.umbler.net/pedidos/" + pedido.id_pedido,
						},
					};
				}),
			};
			return res.status(200).send(response);
		});
	});
});

// INSERE UM PEDIDOS
router.post("/", (req, res, next) => {
	mysql.getConnection((error, conn) => {
		if (error) {
			return res.status(500).send({ error: error });
		}
		conn.query(
			"SELECT * FROM produtos WHERE id_produto = ?",
			[req.body.id_produto],
			(error, result, field) => {
				if (error) {
					return res.status(500).send({ error: error });
				}
				if (result.length == 0) {
					return res.status(404).send({
						mensagem: "Produto não encontrado",
					});
				}
				conn.query(
					"INSERT INTO pedidos(quantidade, id_produto) VALUES(?,?)",
					[req.body.quantidade, req.body.id_produto],
					(error, result, field) => {
						conn.release(); // pool de conection tem um limit de conexao aberta é preciso dar um pool, se não colocar acumula o pool de conexao
						if (error) {
							return res.status(500).send({ error: error });
						}
						const response = {
							mensagem: "Pedido inserido com sucesso",
							pedidoCriado: {
								id_pedido: result.id_pedido,
								quantidade: req.body.quantidade,
								id_produto: req.body.id_produto,
								request: {
									tipo: "GET",
									descricao: "Retorna todos os pedidos",
									url: "http://michellbento-tk.umbler.net/pedidos",
								},
							},
						};
						return res.status(201).send(response);
					}
				);
			}
		);
	});
});

// RETORNA OS DADOS DE UM PEDIDOS
router.get("/:id_pedido", (req, res, next) => {
	mysql.getConnection((error, conn) => {
		if (error) {
			return res.status(500).send({ error: error });
		}
		conn.query(
			"SELECT * FROM pedidos WHERE id_pedido = ?",
			[req.params.id_pedido],
			(error, result, fields) => {
				if (error) {
					return res.status(500).send({ error: error });
				}
				if (result.length == 0) {
					return res.status(404).send({
						mensagem: "Não foi encontrado pedido com esse ID",
					});
				}
				const response = {
					pedido: {
						id_pedido: result[0].id_pedido,
						quantidade: result[0].quantidade,
						id_produto: result[0].id_produto,
						request: {
							tipo: "GET",
							descricao: "Retorna todos os pedidos",
							url: "http://michellbento-tk.umbler.net/pedidos",
						},
					},
				};
				return res.status(200).send(response);
			}
		);
	});
});

// EXCLUI UM PEDIDOS
router.delete("/", (req, res, next) => {
	mysql.getConnection((error, conn) => {
		if (error) {
			return res.status(500).send({ error: error });
		}
		conn.query(
			`DELETE FROM pedidos WHERE id_pedido = ?`,
			[req.body.id_pedido],
			(error, result, field) => {
				conn.release(); // pool de conection tem um limit de conexao aberta é preciso dar um pool, se não colocar acumula o pool de conexao
				if (error) {
					return res.status(500).send({ error: error });
				}
				const response = {
					mensagem: "Pedido removido com sucesso",
					request: {
						tipo: "POST",
						descricao: "Insere um pedido",
						url: "http://michellbento-tk.umbler.net/pedidos",
						body: {
							quantidade: "Number",
							id_produto: "Number",
						},
					},
				};
				return res.status(202).send(response);
			}
		);
	});
});

module.exports = router;
