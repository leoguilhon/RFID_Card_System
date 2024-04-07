// Função para a mensagem de acesso

export async function mensagemDeAcesso(tipo, nome) {
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
  export async function desabilitarFormulario() {
    const formElements = document.getElementById('formAcesso').elements;
    for (let i = 0; i < formElements.length; i++) {
      formElements[i].disabled = true;
    }
  }
  
  export async function habilitarFormulario() {
    const formElements = document.getElementById('formAcesso').elements;
    for (let i = 0; i < formElements.length; i++) {
      formElements[i].disabled = false;
      document.getElementById('idCard').focus();
    }
  }
  
  export async function desabilitarBotoes() {
    const botoes = document.querySelectorAll("button");
    botoes.forEach(botao => {
      botao.disabled = true;
    });
  }
  export async function habilitarBotoes() {
    const botoes = document.querySelectorAll("button");
    botoes.forEach(botao => {
      botao.disabled = false;
      document.getElementById("mensagem").textContent = "";
    });
  }
  
  export async function exibirMensagem(id) {
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