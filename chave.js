function inserirChaveECriarBotaoCopiar() {
	// Encontrar o elemento <td> que contém o texto "Chave - Senha:"
	var tdElement = Array.from(document.querySelectorAll('td')).find(td => td.textContent.includes('Chave - Senha:'));
	var chaveSenha = "";

	if (tdElement)
	{
		// Encontrar o elemento <b> dentro do <td>
		var bElement = tdElement.querySelector('b');
		if (bElement)
		{
			chaveSenha = bElement.textContent.trim();
		}
	}

	if (chaveSenha)
	{
		var divChave = document.getElementById('key'); // Certifique-se de que o ID está correto
		if (divChave)
		{
			divChave.innerHTML = `${chaveSenha}`;
			if (!document.getElementById('copiarChaveButton'))
			{
				var copiarButton = document.createElement('button');
				copiarButton.id = 'copiarChaveButton';
				copiarButton.textContent = '📝';
				// Adicionar função de cópia ao botão
				copiarButton.addEventListener('click', function () {
					navigator.clipboard.writeText(chaveSenha).catch(function (err) {
						console.error('Erro ao copiar texto: ', err);
					});
				});
				// Adicionar o botão logo após o divChave
				divChave.insertAdjacentElement('afterend', copiarButton);
			}
		} else
		{
			console.error('Elemento com ID "key" não encontrado');
		}
	}
}

document.addEventListener('DOMContentLoaded', function () {
	inserirChaveECriarBotaoCopiar();
});
