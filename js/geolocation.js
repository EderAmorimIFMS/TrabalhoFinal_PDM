//variavel para capturar a posicao
let posicaoInicial;
const capturarLocalizacao = document.getElementById('localizacao');
const latitude = document.getElementById('latitude');
const longitude = document.getElementById('longitude');

const iframe = document.getElementById('iframe-mapa')

//callback de sucesso para captura da posicao
const sucesso = (posicao) => {
    posicaoInicial = posicao;
    let lat, lon;
    lat = posicaoInicial.coords.latitude;
    lon = posicaoInicial.coords.longitude;
    latitude.innerHTML = lat;
    longitude.innerHTML = lon;
    iframe.src = `http://maps.google.com/maps?q=${lat},${lon}&z=16&output=embed`
};

//callback de error (falha para captura de localizacao)
const erro = (error) => {
    let errorMessage;
    switch(error.code){
        case 0:
        errorMessage = "Erro desconhecido"
        break;
        case 1:
        errorMessage = "Permissão negada!"
        break;
        case 2:
        errorMessage = "Captura de posição indisponível!"
        break;
        case 3:
        errorMessage = "Tempo de solicitação excedido!"
        break;
    }
    console.log('Ocorreu um erro: ' + errorMessage);
};

capturarLocalizacao.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(sucesso, erro);
})

export {}