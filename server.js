const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const cors = require('cors');

const app = express();
app.use(cors()); // Isso permite todas as origens, você pode configurar para aceitar apenas origens específicas se desejar

// Configuração do MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'lg260294',
  database: 'dados'
});

connection.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conexão com o MySQL estabelecida com sucesso');
});

// Middleware para análise do corpo da solicitação
app.use(bodyParser.json());

// Rota para registrar usuario
app.post('/registrarUsuario', (req, res) => {
  const pessoa = req.body;
  const query = 'INSERT INTO pessoas (nome, cpf, id_card, status) VALUES (?, ?, ?, ?)';
  connection.query(query, [pessoa.nome, pessoa.cpf, pessoa.id_card, pessoa.status], (err, result) => {
    if (err) {
      console.error('Erro ao registrar usuário:', err);
      res.status(500).send('Erro ao registrar usuário');
      return;
    }
    console.log('Usuario cadastrado com sucesso');
    res.status(200).send('Usuario cadastrado com sucesso');
  });
});

app.delete('/removerUsuario/:id', (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM pessoas WHERE id = ?';
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Erro ao remover usuário:', err);
      res.status(500).send('Erro ao remover usuário');
      return;
    }
    if (result.affectedRows === 0) {
      console.log('Nenhum registro encontrado para remover');
      res.status(404).send('Nenhum registro encontrado para remover');
      return;
    }
    console.log('Usuario removido com sucesso');
    res.status(200).send('Usuario removido com sucesso');
  });
});

app.get('/consultarUsuario/:tipo/:identifier', (req, res) => {
  const tipo = req.params.tipo;
  const identifier = req.params.identifier;

  let query;

  if (tipo.toLowerCase() === 'cpf') {
    query = 'SELECT * FROM pessoas WHERE cpf = ?';
  } else if (tipo.toLowerCase() === 'id_card') {
    query = 'SELECT * FROM pessoas WHERE id_card = ?';
  } else if (tipo.toLowerCase() === 'id') {
    query = 'SELECT * FROM pessoas WHERE id = ?';
  } else {
    return res.status(400).json({ error: 'Tipo de consulta inválido' });
  }

  connection.query(query, [identifier], (err, results) => {
    if (err) {
      console.error('Erro ao consultar usuário:', err);
      res.status(500).json({ error: 'Erro ao consultar usuário' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ exists: false });
    } else {
      const pessoa = results[0];
      res.status(200).json({ exists: true, pessoa: pessoa });
    }
  });
});

app.put('/atualizarStatus/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT * FROM pessoas WHERE id_card = ?';
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Erro ao consultar usuário:', err);
      res.status(500).send('Erro ao consultar usuário');
      return;
    }
    if (result.length === 0) {
      console.log('Nenhum registro encontrado para o ID especificado');
      res.status(404).send('Nenhum registro encontrado para o ID especificado');
      return;
    }

    const pessoa = result[0];
    const novoStatus = pessoa.status === 0 ? 1 : 0;

    const updateQuery = 'UPDATE pessoas SET status = ? WHERE id_card = ?';
    connection.query(updateQuery, [novoStatus, id], (updateErr, updateResult) => {
      if (updateErr) {
        console.error('Erro ao atualizar status de usuário:', updateErr);
        res.status(500).send('Erro ao atualizar status de usuário');
        return;
      }
      console.log('Status de acesso atualizado com sucesso');
      res.status(200).send('Status de acesso atualizado com sucesso');
    });
  });
});

app.get('/verificarCPF/:cpf', (req, res) => {
  const cpf = req.params.cpf;

  // Execute a consulta SQL para verificar se o CPF já existe na tabela
  connection.query('SELECT COUNT(*) AS count FROM pessoas WHERE cpf = ?', [cpf], (err, results) => {
    if (err) {
      console.error('Erro ao verificar CPF:', err);
      res.status(500).json({ error: 'Erro ao verificar CPF' });
      return;
    }

    const count = results[0].count;
    res.status(200).json({ exists: count > 0 });
  });
});

app.get('/verificarIdCard/:id_card', (req, res) => {
  const id_card = req.params.id_card;

  // Execute a consulta SQL para verificar se o ID card já existe na tabela
  connection.query('SELECT COUNT(*) AS count FROM pessoas WHERE id_card = ?', [id_card], (err, results) => {
    if (err) {
      console.error('Erro ao verificar ID card:', err);
      res.status(500).json({ error: 'Erro ao verificar ID card' });
      return;
    }

    const count = results[0].count;
    res.status(200).json({ exists: count > 0 });
  });
});

app.put('/editarDados/:id', (req, res) => {
  const id = req.params.id;
  const novoDado = req.body;

  // Verificar qual dado está sendo atualizado
  let query = '';
  let parametro = '';

  if (novoDado.nome) {
    query = 'UPDATE pessoas SET nome = ? WHERE id = ?';
    parametro = novoDado.nome;
  } else if (novoDado.cpf) {
    query = 'UPDATE pessoas SET cpf = ? WHERE id = ?';
    parametro = novoDado.cpf;
  } else if (novoDado.id_card) {
    query = 'UPDATE pessoas SET id_card = ? WHERE id = ?';
    parametro = novoDado.id_card;
  } else {
    res.status(400).send('Nenhum dado para atualizar');
    return;
  }

  // Execute a consulta SQL para atualizar o dado específico
  connection.query(query, [parametro, id], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar dado:', err);
      res.status(500).send('Erro ao atualizar dado');
      return;
    }
    if (result.affectedRows === 0) {
      console.log('Nenhum registro encontrado para o ID especificado');
      res.status(404).send('Nenhum registro encontrado para o ID especificado');
      return;
    }

    console.log('Dado atualizado com sucesso');
    res.status(200).send('Dado atualizado com sucesso');
  });
});

// Outras rotas podem ser definidas de maneira semelhante

// Inicializar o servidor
app.listen(3000, () => {
    console.log('Servidor iniciado e ouvindo na porta 3000');
  });