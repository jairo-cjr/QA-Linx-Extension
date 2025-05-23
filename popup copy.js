document.addEventListener('DOMContentLoaded', function () {
    var desiredUrl = 'http://intranet.lzt.com.br/cliente/200/modulo/'
    var optionalUrl = 'http://intranet.lzt.com.br/cliente/200/view/'
    var editURL = 'http://intranet.lzt.com.br/cliente/200/edit/'
	var jiraUrl = 'https://jira.linx.com.br/'

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0)
        {
            var currentTab = tabs[0];
            console.log("URL da aba atual:", currentTab.url);

            if (currentTab.url === optionalUrl)
            {
                inserirChaveECriarBotaoCopiar();
                var moduloPageButton = document.getElementById('moduloPage');
                moduloPageButton.style.display = 'block';
                moduloPageButton.addEventListener('click', function () {
                    chrome.tabs.create({ url: desiredUrl });
                });
            }
            else if (currentTab.url === desiredUrl)
            {
                document.querySelectorAll('.modulo').forEach(function (element) {
                    element.style.display = 'block';
                });
                inserirBotoesModulo();
            }
			else if (currentTab.url.includes('jira.linx')) {
				document.getElementById('snippetsContainer').style.display = 'block';
				inserirBotoesSnippets();
				inserirBotoesIssue();
			}
            else
            {
                document.querySelectorAll('.default').forEach(function (element) {
                    element.style.display = 'block';
                });
                var homeButton = document.getElementById('home');
                homeButton.addEventListener('click', function () {
                    chrome.tabs.create({ url: optionalUrl });
                });

                var moduloPageButton = document.getElementById('moduloPage');
                moduloPageButton.addEventListener('click', function () {
                    chrome.tabs.create({ url: desiredUrl });
                });
                inserirBotoesIssue();
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
                                var submitButton = Array.from(document.querySelectorAll('input[type="submit"].default')).find(button => button.value === 'Salvar');
                                if (submitButton)
                                {
                                    submitButton.click();
                                    return true;
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

                                setTimeout(function () {
                                    chrome.tabs.update(tabs[0].id, { url: optionalUrl }, function (tab) {
                                        console.log('Aba atualizada com a URL:', tab.url);
                                    });
                                }, 1000);
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

                        console.log("Chave encontrada:", chaveSenha);
                        return chaveSenha;
                    }
                }, function (results) {
                    if (results && results[0] && results[0].result)
                    {
                        const spanChave = document.getElementById('key');
                        if (spanChave)
                        {
                            spanChave.innerText = `${results[0].result.replace(/\n/g, '')}`;
                            spanChave.style.display = 'block';
                            console.log("Texto no span 'key':", spanChave.innerText);

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

	function inserirBotoesSnippets() {
		var snippetsContainer = document.getElementById('snippetsContainer');
		if (!snippetsContainer)
		{
			console.error('snippetsContainer não encontrado');
			return;
		}

		fetch('snippets.json')
			.then(response => response.json())
			.then(snippets => {
				Object.values(snippets).forEach(snippet => {
					if (snippet.body && snippet.body.length > 0 && snippet.enable)
					{
						let button = document.createElement('button');
						button.textContent = snippet.prefix.toLowerCase();
						button.classList.add('snippet-button'); // Classe base
						if (snippet.bgColor) {
							button.style.backgroundColor = snippet.bgColor;
						}
						if (snippet.prefix.toLowerCase() === 'issue-regressivo'){
							button.classList.add('regressivo');
						}
						button.setAttribute('title', snippet.body.join('\n'));

						button.addEventListener('click', () => {
							let formattedText = snippet.body.join('\n');
							navigator.clipboard.writeText(formattedText)
								.then(() => {
									button.classList.add('copied');
									button.textContent = `✔ ${snippet.prefix.toLowerCase()}`;
									setTimeout(() => {
										button.classList.remove('copied');
										button.textContent = snippet.prefix.toLowerCase();
									}, 1500);
								})
								.catch(err => console.error('Erro ao copiar:', err));
						});

						snippetsContainer.appendChild(button);
					}
				});
			})
			.catch(error => console.error('Erro ao carregar snippets:', error));
	}

    function inserirBotoesIssue() {
        var issueButton = document.getElementById('issueButton');
        var issueInput = document.getElementById('issue');
        issueButton.style.display = 'block';
        issueInput.style.display = 'block';

        if (issueInput) {
            issueInput.focus();
        }

        if (issueButton) {
            issueButton.addEventListener('click', function () {
                var issueInputValue = issueInput.value;
                if (issueInputValue) {
                    var jiraUrl;
                    if (issueInputValue.toLowerCase().startsWith('as3-')) {
                        issueInputValue = issueInputValue.substring(4);
                        jiraUrl = 'https://jira.linx.com.br/browse/POSTOSAS3-' + issueInputValue;
                    } else {
						issueInputValue = issueInputValue.replace(/\D/g, '');
                        jiraUrl = 'https://jira.linx.com.br/browse/POSTOSPOS-' + issueInputValue;
                    }
                    chrome.tabs.create({ url: jiraUrl });
                }
            });
        }

        if (issueInput) {
            issueInput.addEventListener('keypress', function (event) {
                if (event.key === 'Enter') {
                    document.getElementById('issueButton').click();
                }
            });
        }
    }
})
