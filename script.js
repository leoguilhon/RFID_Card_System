var menuElement = document.getElementById("menu");
let date = new Date();

function registrarUsuario() {
  const nome = prompt("Qual é o seu nome?");
  const cpf = prompt("Qual é o seu CPF? (sem ponto)");
  const id_card = prompt("Qual é o ID card?");

  const pessoa = {
    nome: nome,
    cpf: cpf,
    id_card: id_card,
    status: 0,
  };

  if (!pessoa.nome || !pessoa.cpf || !pessoa.id_card) {
    alert('Por favor, preencha todos os campos');
    return;
  }

  // Verificar se o CPF já existe antes de enviar a solicitação POST
  fetch(`http://localhost:3000/verificarCPF/${cpf}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(response => response.json())
  .then(data => {
    if (data.exists) {
      alert('O CPF já está em uso. Por favor, escolha outro.');
    } else {
      // Verificar se o ID card já existe antes de enviar a solicitação POST
      fetch(`http://localhost:3000/verificarIdCard/${id_card}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => response.json())
      .then(data => {
        if (data.exists) {
          alert('O ID card já está em uso. Por favor, escolha outro.');
        } else {
          // Se o CPF e o ID card não existirem, enviar a solicitação POST
          fetch('http://localhost:3000/registrarUsuario', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(pessoa),
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Erro ao registrar acesso');
            }
            console.log('Usuario cadastrado com sucesso');
          })
          .catch(error => {
            console.error('Erro ao registrar acesso:', error);
            alert('Erro ao registrar acesso');
          });
        }
      })
      .catch(error => {
        console.error('Erro ao verificar ID card:', error);
        alert('Erro ao verificar ID card');
      });
    }
  })
  .catch(error => {
    console.error('Erro ao verificar CPF:', error);
    alert('Erro ao verificar CPF');
  });
}

function removerUsuario() {
  try {
    var idToRemove = prompt('Qual é o ID da pessoa que você deseja remover o acesso?');
    fetch(`http://localhost:3000/removerUsuario/${idToRemove}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao remover acesso');
      }
      console.log('Usuario removido com sucesso');
    })
    .catch(error => {
      console.error('Erro ao remover acesso:', error);
      alert('Erro ao remover acesso');
    });
  } catch (e) {
    alert(e);
  }
}

function consultarUsuario() {
  const escolha = prompt('Você deseja pesquisar por CPF, ID ou ID card? Digite "CPF", "ID" ou "ID card" para escolher.');
  let tipo;
  let identifier;

  if (escolha.toLowerCase() === 'cpf') {
    tipo = 'cpf';
    identifier = prompt('Insira o CPF que você deseja consultar:');
  } else if (escolha.toLowerCase() === 'id card') {
    tipo = 'id_card';
    identifier = prompt('Insira o ID card que você deseja consultar:');
  } else if (escolha.toLowerCase() === 'id') {
    tipo = 'id';
    identifier = prompt('Insira o ID que você deseja consultar:');
  } else {
    alert('Escolha inválida. Por favor, digite "CPF", "ID card" ou "ID".');
    return;
  }

  fetch(`http://localhost:3000/consultarUsuario/${tipo}/${identifier}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      console.error('Erro ao consultar acesso:', data.error);
      alert('Erro ao consultar acesso');
    } else if (data.exists) {
      const pessoa = data.pessoa;
      const statusTexto = pessoa.status === 1 ? 'Acessado' : 'Não acessado';
      alert(`ID: ${pessoa.id}\nNome: ${pessoa.nome}\nCPF: ${pessoa.cpf}\nID card: ${pessoa.id_card}\nStatus: ${statusTexto}`);
    } else {
      if (tipo === 'cpf') {
        alert('Nenhum registro encontrado para o CPF especificado');
      } else {
        alert('Nenhum registro encontrado para o ID card especificado');
      }
    }
  })
  .catch(error => {
    console.error('Erro ao consultar acesso:', error);
    alert('Erro ao consultar acesso');
  });
}

function editarDados() {
  try {
    var idToUpdate = parseInt(prompt('Qual é o ID do usuário que você deseja editar?'));
    var campo = prompt('Qual campo você deseja editar (nome, cpf ou id_card)?');
    if (campo.toLowerCase() === "id") {
      campo = "id_card";
    }
    var novoValor = prompt(`Insira o novo valor para o campo ${campo}:`);

    const dadosAtualizados = {};
    dadosAtualizados[campo] = novoValor;

    fetch(`http://localhost:3000/editarDados/${idToUpdate}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosAtualizados),
    })
    .then(response => {
      if (!response.ok) {
        if(response.status === 404) {
          throw new Error('ID do usuário não encontrado');
        } else {
          throw new Error('Erro ao atualizar dados');
        }
      }
      console.log('Dados atualizados com sucesso');
    })
    .catch(error => {
      console.error('Erro ao editar dados:', error);
      alert(error.message);
    });
  } catch (e) {
    alert(e);
  }
}

function realizarAcesso() {
  try {
    var idToAccess = parseInt(prompt('Qual é o ID card que você deseja registrar o acesso?'));
    fetch(`http://localhost:3000/atualizarStatus/${idToAccess}`, {
      method: 'PUT'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao atualizar status de acesso');
      }
      console.log('Status de acesso atualizado com sucesso');
      exibirMensagem(idToAccess);
    })
    .catch(error => {
      console.error('Erro ao atualizar status de acesso:', error);
      alert('Erro ao atualizar status de acesso');
    });
  } catch (e) {
    alert(e);
  }
}

function realizarAcessoForm(idToAccess) {
  try {
    fetch(`http://localhost:3000/verificarIdCard/${idToAccess}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao verificar ID card');
      }
      return response.json();
    })
    .then(data => {
      if (data.exists) {
        fetch(`http://localhost:3000/atualizarStatus/${idToAccess}`, {
          method: 'PUT'
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Erro ao atualizar status de acesso');
          }
          console.log('Status de acesso atualizado com sucesso');
          exibirMensagem(idToAccess);
          document.getElementById('idCard').value = ''; // Limpa o campo do formulário
        })
        .catch(error => {
          console.error('Erro ao atualizar status de acesso:', error);
        });
      } else {
        console.log('ID Card não encontrado');
        document.getElementById('idCard').value = ''; // Limpa o campo do formulário
      }
    })
    .catch(error => {
      console.error('Erro ao verificar ID card:', error);
    });
  } catch (e) {
    alert(e);
  }
}

document.getElementById('formAcesso').addEventListener('submit', function(event) {
  event.preventDefault();
  const idToAccess = parseInt(document.getElementById('idCard').value);
  realizarAcessoForm(idToAccess);
});

document.getElementById('idCard').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    const idToAccess = parseInt(document.getElementById('idCard').value);
    realizarAcessoForm(idToAccess);
  }
});



function mensagemDeAcesso(tipo, nome) {
  const agora = new Date();
  const hora = agora.getHours();
  let saudacao;

  if (tipo === 1) {
    if (hora >= 5 && hora < 12) {
      saudacao = "Bom dia";
    } else if (hora >= 12 && hora < 18) {
      saudacao = "Boa tarde";
    } else {
      saudacao = "Boa noite";
    }
    document.getElementById("mensagem").innerText = `${saudacao}, ${nome}! Bem-vindo.`;
  } else if (tipo === 0) {
    document.getElementById("mensagem").innerText = `Até logo, ${nome}! Volte em breve.`;
  }
}


// Função para trocar a cor da borda para verde por 2 segundos
function desabilitarFormulario() {
  const formElements = document.getElementById('formAcesso').elements;
  for (let i = 0; i < formElements.length; i++) {
    formElements[i].disabled = true;
  }
}

function habilitarFormulario() {
  const formElements = document.getElementById('formAcesso').elements;
  for (let i = 0; i < formElements.length; i++) {
    formElements[i].disabled = false;
    document.getElementById('idCard').focus();
  }
}

function exibirMensagem(id) {
  const menuElement = document.getElementById("menu");
  menuElement.style.borderColor = "green"; // Altera a cor da borda para verde
  desabilitarFormulario(); // Desabilita o formulário

  // Desabilita todos os botões
  const botoes = document.querySelectorAll("button");
  botoes.forEach(botao => {
    botao.disabled = true;
  });

  const tipo = "id_card";
  fetch(`http://localhost:3000/consultarUsuario/${tipo}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(response => response.json())
  .then(data => {
    if (data.error) {
      console.error('Erro ao consultar acesso:', data.error);
      alert('Erro ao consultar acesso');
    } else if (data.exists) {
      const pessoa = data.pessoa;
      const tipoAcesso = pessoa.status; // Supondo que o servidor retorne o tipo de acesso (entrada ou saída)
      const nomePessoa = pessoa.nome; // Supondo que o servidor retorne o nome da pessoa
      mensagemDeAcesso(tipoAcesso, nomePessoa); // Chamando a função para manipular e exibir a mensagem de acesso
    } else {
      alert('Nenhum registro encontrado para o ID card especificado');
    }
  })
  .catch(error => {
    console.error('Erro ao consultar acesso:', error);
    alert('Erro ao consultar acesso');
  });

  // Após 2 segundos, volta a cor da borda para preto e habilita os botões
  setTimeout(() => {
    menuElement.style.borderColor = "black"; // Volta a cor da borda para preto
    habilitarFormulario(); // Habilita o formulário
    // Habilita todos os botões
    botoes.forEach(botao => {
      botao.disabled = false;
      document.getElementById("mensagem").textContent = "";
    });
  }, 2000); // 2 segundos em milissegundos
}

document.getElementById('idCard').focus();


