module.exports.requestActions = [
  {
    
    label: "Generate Read.me",
    action: async (context, data) => {
      const { request } = data;

      const response = await context.network.sendRequest(request);
      const regex = /https?:\/\/[^\/]+(\/[^?#]*)/;
      const match = request.url.match(regex);
      const endpoint = match && match[1];

      var parametros = `<p>| Nome | Valor | Descrição | Obrigatório? |</p>`;

      request.parameters.forEach((item) => {
        parametros += `<p>| ${item.name} | ${item.value} | Sua descrição do campo | S ou N |</p>`;
      });

      var headers = `<p>| Header | Valor |</p>`;

      request.headers.forEach((item) => {
        headers += `<p>| ${item.name} | ${item.value} |</p>`;
      });

      const html = `
      <p>### Descricao do endpoint detalhando quais dados são retornados ou operações que ele realiza </p> <br> 
      <p>## Url completa: <br>${request.url}.</p> <br>
      <p>## Endpoint: <br>${endpoint}.</p> <br>
      <p>## Method: <br>${request.method}.</p> <br>
      <p>## Url: <br>${request.url}.</p><br>
      <p>## Headers <br> ${headers}<br> </p><br>
      <p>## Filtros</p> <br>${parametros}<br> <p></p>
      <p>## Examples</p> <br>\`\`\`<embed type="text/plain" width="600" height="200" src="${response.bodyPath}"></embed> \`\`\`<br> <p></p>
      `;
      context.app.showGenericModalDialog(`# ${request.name}`, { html });
    },
  },
];
