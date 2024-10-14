document.addEventListener('DOMContentLoaded', function () {
	var desiredUrl = 'http://intranet.lzt.com.br/cliente/200/modulo/';
	var optionalUrl = 'http://intranet.lzt.com.br/cliente/200/view/';
	var editURL = 'http://intranet.lzt.com.br/cliente/200/edit/'

	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		if (tabs.length > 0)
		{
			var currentTab = tabs[0];
			console.log("URL da aba atual:", currentTab.url); // Log da URL da aba

			if ((currentTab.url !== desiredUrl) && (currentTab.url !== optionalUrl))
			{
				chrome.tabs.create({ url: desiredUrl });
			} else if (currentTab.url === optionalUrl)
			{
				inserirChaveECriarBotaoCopiar(); // Chama a função apenas se estiver na URL correta
			}
			else if (currentTab.url === desiredUrl)
			{
				document.querySelectorAll('.modulo').forEach(function (element) {
					element.style.display = 'block';
				});
				inserirBotoesModulo(); // Chama a função apenas se estiver na URL correta
			}
		} else
		{
			console.error('Nenhuma aba ativa encontrada');
		}
	});

	function inserirBotoesModulo() {
		var marcarButton = document.getElementById('marcar');
		if (marcarButton)
		{
			marcarButton.addEventListener('click', function () {
				var palavraChave = document.getElementById('palavra').value.toLowerCase();
				if (palavraChave)
				{
					chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
						if (tabs.length > 0)
						{
							chrome.scripting.executeScript({
								target: { tabId: tabs[0].id },
								func: function (palavraChave) {
									let count = 0;
									let textosAlterados = [];
									let regex = new RegExp(`\\b${palavraChave}\\b|\\(${palavraChave}\\)`, 'i');
									document.querySelectorAll('tr').forEach(function (linha) {
										let textoCelula = linha.innerText.toLowerCase();
										if (regex.test(textoCelula))
										{
											let checkbox = linha.querySelector('input[type="checkbox"]');
											if (checkbox && !checkbox.checked)
											{
												checkbox.checked = true;
												count++;
												textosAlterados.push(linha.innerText.trim());
											}
										}
									});
									return { count, textosAlterados };
								},
								args: [palavraChave]
							}, function (results) {
								if (results && results[0] && results[0].result !== undefined)
								{
									document.getElementById('resultado').style.display = 'block';
									document.getElementById('resultado').innerText = `⚠ ${results[0].result.count} modulos marcados`;
									if (results[0].result.count != 0)
									{
										let detalhesDiv = document.getElementById('detalhes-checkboxes');
										detalhesDiv.style.display = 'block';
										detalhesDiv.innerHTML = "Modulos marcados:\n";
										let ul = document.createElement('ul');
										results[0].result.textosAlterados.forEach(function (texto) {
											let li = document.createElement('li');
											li.textContent = texto;
											ul.appendChild(li);
										});
										detalhesDiv.appendChild(ul);
										detalhesDiv.innerHTML += "\n";
									}
									else
									{
										let detalhesDiv = document.getElementById('detalhes-checkboxes');
										detalhesDiv.style.display = 'none';
									}
								} else
								{
									console.error('Erro ao contar checkboxes');
								}
							});
						} else
						{
							console.error('Nenhuma aba ativa encontrada');
						}
					});
				}
			});
		} else
		{
			console.error('Elemento com ID "marcar" não encontrado');
		}

		var desmarcarButton = document.getElementById('desmarcar');
		if (desmarcarButton)
		{
			desmarcarButton.addEventListener('click', function () {
				var palavraChave = document.getElementById('palavra').value.toLowerCase();
				if (palavraChave)
				{
					chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
						if (tabs.length > 0)
						{
							chrome.scripting.executeScript({
								target: { tabId: tabs[0].id },
								func: function (palavraChave) {
									let count = 0;
									let textosAlterados = [];
									let regex = new RegExp(`\\b${palavraChave}\\b|\\(${palavraChave}\\)`, 'i');
									document.querySelectorAll('tr').forEach(function (linha) {
										let textoCelula = linha.innerText.toLowerCase();
										if (regex.test(textoCelula))
										{
											let checkbox = linha.querySelector('input[type="checkbox"]');
											if (checkbox && checkbox.checked)
											{
												checkbox.checked = false;
												count++;
												textosAlterados.push(linha.innerText.trim());
											}
										}
									});
									return { count, textosAlterados };
								},
								args: [palavraChave]
							}, function (results) {
								if (results && results[0] && results[0].result !== undefined)
								{
									document.getElementById('resultado').style.display = 'block';
									document.getElementById('resultado').innerText = `⚠ ${results[0].result.count} modulos desmarcados`;
									if (results[0].result.count != 0)
									{
										let detalhesDiv = document.getElementById('detalhes-checkboxes');
										detalhesDiv.style.display = 'block';
										detalhesDiv.innerHTML = "Modulos desmarcados\n";
										let ul = document.createElement('ul');
										results[0].result.textosAlterados.forEach(function (texto) {
											let li = document.createElement('li');
											li.textContent = texto;
											ul.appendChild(li);
										});
										detalhesDiv.appendChild(ul);
										detalhesDiv.innerHTML += "\n";
									}
									else
									{
										let detalhesDiv = document.getElementById('detalhes-checkboxes');
										detalhesDiv.style.display = 'nonne';
									}
								} else
								{
									console.error('Erro ao contar checkboxes');
								}
							});
						} else
						{
							console.error('Nenhuma aba ativa encontrada');
						}
					});
				}
			});
		} else
		{
			console.error('Elemento com ID "desmarcar" não encontrado');
		}

		var salvarButton = document.getElementById('salvar');
		if (salvarButton)
		{
			salvarButton.addEventListener('click', function () {
				chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
					if (tabs.length > 0)
					{
						chrome.scripting.executeScript({
							target: { tabId: tabs[0].id },
							func: function () {
								var submitButton = document.querySelector('input[type="submit"].default');
								if (submitButton)
								{
									submitButton.click();
									return true; // Retorna true se o botão for clicado
								} else
								{
									console.error('Elemento não encontrado');
									return false;
								}
							}
						}, function (results) {
							if (chrome.runtime.lastError)
							{
								console.error('Erro ao injetar script:', chrome.runtime.lastError);
							} else if (results[0] && results[0].result === true)
							{
								// Aguarda um pequeno intervalo para o formulário ser processado antes de redirecionar
								setTimeout(function () {
									chrome.tabs.update(tabs[0].id, { url: optionalUrl }, function (tab) {
										console.log('Aba atualizada com a URL:', tab.url);
									});
								}, 1000); // Ajuste o tempo conforme necessário
							} else
							{
								console.log('O botão submit não foi encontrado ou clicado.');
							}
						});
					} else
					{
						console.error('Nenhuma aba ativa encontrada');
					}
				});
			});
		} else
		{
			console.error('Elemento com ID "salvar" não encontrado');
		}
	}

	function inserirChaveECriarBotaoCopiar() {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			if (tabs.length > 0)
			{
				chrome.scripting.executeScript({
					target: { tabId: tabs[0].id },
					func: function () {
						const tdElements = document.querySelectorAll("td");
						let chaveSenha = "";

						tdElements.forEach(td => {
							if (td.textContent.includes("Chave - Senha:"))
							{
								const bElement = td.querySelector("b");
								if (bElement)
								{
									chaveSenha = bElement.textContent.trim();
								}
							}
						});

						console.log("Chave encontrada:", chaveSenha); // Log da chave encontrada
						return chaveSenha; // Retorna a chave encontrada
					}
				}, function (results) {
					if (results && results[0] && results[0].result)
					{
						const spanChave = document.getElementById('key');
						if (spanChave)
						{
							spanChave.innerText = `${results[0].result.replace(/\n/g, '')}`;
							spanChave.style.display = 'block';
							console.log("Texto no span 'key':", spanChave.innerText); // Log do texto do span

							// Criar o botão de copiar
							if (!document.getElementById('copiarChaveButton'))
							{
								var copiarButton = document.createElement('button');
								copiarButton.id = 'copiarChaveButton';
								copiarButton.textContent = '📋 Copiar chave';
								copiarButton.addEventListener('click', function () {
									navigator.clipboard.writeText(spanChave.innerText).then(function () {
										copiarButton.textContent = 'Chave copiada!';
										copiarButton.style.backgroundColor = 'lightgreen';
									}).catch(function (err) {
										copiarButton.textContent = 'Erro ao copiar chave!';
										copiarButton.style.backgroundColor = 'lightcoral';
										console.error('Erro ao copiar texto: ', err);
									});
								});
								spanChave.insertAdjacentElement('afterend', copiarButton);
							}
							if (!document.getElementById('botaoEdit'))
							{
								var editButton = document.createElement('button');
								editButton.id = 'botaoEdit';
								editButton.textContent = 'Editar chave';
								editButton.addEventListener('click', function () {
									chrome.tabs.update(tabs[0].id, { url: editURL });
								});
								copiarButton.insertAdjacentElement('afterend', editButton);
							}
						}
					} else
					{
						console.error('Chave não encontrada ou erro ao executar script.');
					}
				});
			}
		});
	}
});
