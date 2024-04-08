
// Função para registrar o usuário

async function registrarUsuario() {
  const nome = prompt("Qual é o seu nome?");
  let cpf = prompt("Qual é o seu CPF? (sem ponto)");
  const id_card = prompt("Qual é o ID card?");

  // Função para validar o CPF
  function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g,'');
    if(cpf.length !== 11) {
      alert('CPF inválido. Por favor, insira um CPF válido.');
      return false;
    }

    // Calcula o primeiro dígito verificador
    var soma = 0;
    for (var i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    var primeiroDigito = 11 - (soma % 11);
    if (primeiroDigito > 9) {
      primeiroDigito = 0;
    }

    // Verifica se o primeiro dígito verificador é válido
    if (parseInt(cpf.charAt(9)) !== primeiroDigito) {
      alert('CPF inválido. Por favor, insira um CPF válido.');
      return false;
    }

    // Calcula o segundo dígito verificador
    soma = 0;
    for (var i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    var segundoDigito = 11 - (soma % 11);
    if (segundoDigito > 9) {
      segundoDigito = 0;
    }

    // Verifica se o segundo dígito verificador é válido
    if (parseInt(cpf.charAt(10)) !== segundoDigito) {
      alert('CPF inválido. Por favor, insira um CPF válido.');
      return false;
    }

    return true;
  }

  // Valida o CPF inserido
  if (!validarCPF(cpf)) {
    return;
  }

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

  try {
    // Verificar se o CPF já existe
    const cpfResponse = await fetch(`http://localhost:3000/verificarCPF/${cpf}`);
    if (!cpfResponse.ok) {
      throw new Error('Erro ao verificar CPF');
    }
    const cpfData = await cpfResponse.json();
    if (cpfData.exists) {
      throw new Error('O CPF já está em uso. Por favor, escolha outro.');
    }

    // Verificar se o ID card já existe
    const idCardResponse = await fetch(`http://localhost:3000/verificarIdCard/${id_card}`);
    if (!idCardResponse.ok) {
      throw new Error('Erro ao verificar ID card');
    }
    const idCardData = await idCardResponse.json();
    if (idCardData.exists) {
      throw new Error('O ID card já está em uso. Por favor, escolha outro.');
    }

    // Registrar usuário
    const registroResponse = await fetch('http://localhost:3000/registrarUsuario', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pessoa),
    });
    if (!registroResponse.ok) {
      throw new Error('Erro ao registrar usuário');
    }

    // Exibir mensagem de sucesso
    alert('Usuário registrado com sucesso');
  } catch (error) {
    console.error('Erro ao registrar usuário:', error.message);
    alert(error.message);
  }
}

// Função para remover o usuário

async function removerUsuario() {
  try {
    var idToRemove = prompt('Qual é o ID da pessoa que você deseja remover o acesso?');
    fetch(`http://localhost:3000/removerUsuario/${idToRemove}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('O ID especificado não existe');
        }
        throw new Error('Erro ao remover acesso');
      }
      console.log('Usuário removido com sucesso');
      alert('Usuário removido com sucesso');
    })
    .catch(error => {
      console.error('Erro ao remover acesso:', error);
      alert(error.message);
    });
  } catch (e) {
    alert(e);
  }
}


// Função para consultar informações do usuário

async function consultarUsuario() {
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

// Função para editar os dados do usuário

async function editarDados() {
  try {
    const idToUpdate = parseInt(prompt('Qual é o ID do usuário que você deseja editar?'));
    const campo = prompt('Qual campo você deseja editar (nome, cpf ou id_card)?').toLowerCase();

    const camposValidos = ["nome", "cpf", "id_card"];
    if (!camposValidos.includes(campo)) {
      throw new Error('Campo inválido');
    }

    let campoAtualizado = campo;
    if (campo === "id") {
      campoAtualizado = "id_card";
    }

    const novoValor = prompt(`Insira o novo valor para o campo ${campoAtualizado}:`);

    const dadosAtualizados = {};
    dadosAtualizados[campoAtualizado] = novoValor;

    const response = await fetch(`http://localhost:3000/editarDados/${idToUpdate}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosAtualizados),
    });

    if (!response.ok) {
      if(response.status === 404) {
        throw new Error('ID do usuário não encontrado');
      } else {
        throw new Error('Erro ao atualizar dados');
      }
    }
    console.log('Dados atualizados com sucesso');
  } catch (error) {
    console.error('Erro ao editar dados:', error);
    alert(error.message);
  }
}

// Função para realizar o acesso do usuário

async function realizarAcesso() {
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

// Função para realizar o acesso do usuário via formulário

async function realizarAcessoForm(idToAccess) {
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


// Função para a mensagem de acesso

async function mensagemDeAcesso(tipo, nome) {
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
  
  
// Função para desabilitar e habilitar o formulário
async function desabilitarFormulario() {
  const formElements = document.getElementById('formAcesso').elements;
  for (let i = 0; i < formElements.length; i++) {
    formElements[i].disabled = true;
  }
}

async function habilitarFormulario() {
  const formElements = document.getElementById('formAcesso').elements;
  for (let i = 0; i < formElements.length; i++) {
    formElements[i].disabled = false;
    document.getElementById('idCard').focus();
  }
}

async function desabilitarBotoes() {
  const botoes = document.querySelectorAll("button");
  botoes.forEach(botao => {
    botao.disabled = true;
  });
}
async function habilitarBotoes() {
  const botoes = document.querySelectorAll("button");
  botoes.forEach(botao => {
    botao.disabled = false;
    document.getElementById("mensagem").textContent = "";
  });
}

async function exibirMensagem(id) {
  const menuElement = document.getElementById("menu");
  menuElement.style.borderColor = "green"; // Altera a cor da borda para verde
  desabilitarFormulario(); // Desabilita o formulário

  // Desabilita todos os botões
  desabilitarBotoes();

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
    habilitarBotoes(); // Habilita todos os botões
  }, 2000); // 2 segundos em milissegundos
}



// Funções para realizar o acesso através do formulário pelo ID Card

document.getElementById('formAcesso').addEventListener('submit', function(event) {
  event.preventDefault();
  const idToAccess = parseInt(document.getElementById('idCard').value);
  if (!isNaN(idToAccess)) {
    realizarAcessoForm(idToAccess);
  } else {
    document.getElementById('idCard').value = ''; // Limpa o campo se o valor não for um número
  }
});

document.getElementById('idCard').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    const idToAccess = parseInt(document.getElementById('idCard').value);
    if (!isNaN(idToAccess)) {
      realizarAcessoForm(idToAccess);
    } else {
      document.getElementById('idCard').value = ''; // Limpa o campo se o valor não for um número
    }
  }
});


document.getElementById('idCard').focus(); // Deixa selecionado o campo Card ID ao carregar a página


