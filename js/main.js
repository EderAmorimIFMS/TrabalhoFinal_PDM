/*registrando a service worker*/
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      let reg;
      reg = await navigator.serviceWorker.register('/sw.js', { type: "module" });
      console.log('Service worker registrada! ', reg);
    } catch (err) {
      console.log(' Service worker registro falhou: ', err);
    }
  });
}

/*Indexeddb*/
import { openDB } from "idb";

let db;

async function criarDB(){
    try {
        db = await openDB('banco', 1, {
            upgrade(db, oldVersion, newVersion, transaction){
                switch  (oldVersion) {
                    case 0:
                    case 1:
                        const store = db.createObjectStore('focos', {
                            keyPath: 'titulo'
                        });
                        store.createIndex('id', 'id');
                        console.log("banco de dados criado!");
                }
            }
        });
        console.log("banco de dados aberto!");
    }catch (e) {
        console.log('Erro ao criar/abrir banco: ' + e.message);
    }
}

window.addEventListener('DOMContentLoaded', async event =>{
    criarDB();
    document.getElementById('btn_cadastro').addEventListener('click', cadastrarFoco);
    document.getElementById('renderizar_focos').addEventListener('click', renderizarFocos);
});

async function renderizarFocos(){
    if(db == undefined){
        console.log("O banco de dados está fechado.");
    }
 
    const tx = await db.transaction('focos', 'readonly')
    const store = tx.objectStore('focos');

    const tfocos = await store.getAll();

    if(tfocos){
        const divLista = tfocos.map(foco => {
            return `<div class="item">
                        <img src=${foco.imagem}/>
                        <p>${foco.titulo}</p>
                        <p>${foco.descricao}</p>
                        <iframe src = "http://maps.google.com/maps?q=${foco.coordenadas.latitude},${foco.coordenadas.longitude}&z=16&output=embed"></iframe
                    </div>`;
        });
        listagem(divLista.join(' '));
    }
}

async function cadastrarFoco(imagem, latitude, longitude) {
  let titulo = document.getElementById("titulo").value;
  let descricao = document.getElementById("descricao").value;

  const tx = await db.transaction('focos', 'readwrite');
  const store = tx.objectStore('focos');

  try {
    await store.add({ 
      titulo: titulo,  
      descricao: descricao,
      imagem: imagem,
      coordenadas: {
        latitude: latitude,
        longitude: longitude
      }
    });
    await tx.done;
    limparCampos();
    alert('Registro adicionado com sucesso!');
    console.log('Registro adicionado com sucesso!');
  } catch (error) {
    console.error('Erro ao adicionar:', error);
    tx.abort();
  }
}

function limparCampos() {
    document.getElementById("titulo").value = '';
    document.getElementById("descricao").value = '';
    
}

function listagem(text){
    document.getElementById('resultados').innerHTML = text;
}

/*Camera Js*/
// configurando as constraintes do video stream
let camMode = 'user';
var constraints = { video: { facingMode: camMode }, audio: false };

// capturando os elementos em tela
const cameraView = document.querySelector("#camera--view"),
  cameraOutput = document.querySelector("#camera--output"),
  cameraSensor = document.querySelector("#camera--sensor"),
  cameraTrigger = document.querySelector("#camera--trigger"),
  cameraSwitcher = document.querySelector("#camera--switcher");


//Estabelecendo o acesso a camera e inicializando a visualização 
function cameraStart() {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      let track = stream.getTracks()[0];
      console.log(track); 
      cameraView.srcObject = stream;
  })
  .catch(function (error) {
    console.error("Ocorreu um Erro.", error); 
  });
}

function stopMediaTracks(stream) {
  stream.getTracks().forEach((track) => {
    track.stop();
  });
}

// Função para tirar foto
async function cameraTriggerClick() {
  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight; 
  cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
  const imageData = cameraSensor.toDataURL("image/png");
  cameraOutput.src = imageData;
  cameraOutput.classList.add("taken");

  // Salva a imagem no IndexedDB
  await cadastrarFoco(imageData, latitude, longitude);
}

//Função para trocar de camera frontal/traseira
cameraSwitcher.onclick = function() {
  stopMediaTracks(cameraView.srcObject);
  camMode = camMode === 'user' ? 'environment' : 'user';
  constraints = { video: { facingMode: camMode }, audio: false };
  cameraStart();
}

// carrega imagem de camera quando a janela carregar 
window.addEventListener("load", cameraStart, false);


/*Geolocation Js*/
//variavel para capturar a posicao
let posicaoInicial;

const capturarLocalizacao = document.getElementById('localizacao');
const latitude = document.getElementById('latitude');
const longitude = document.getElementById('longitude');
const iframe = document.getElementById('iframe-mapa')

//callback de sucesso para captura da posicao
const sucesso = (posicao) => {
    posicaoInicial = posicao;
    coordenadas.latitude = posicaoInicial.coords.latitude;
    coordenadas.longitude = posicaoInicial.coords.longitude;
    
    //Salva as coordenadas no IndexedDB
    cadastrarFoco(imageData, coordenadas.latitude, coordenadas.longitude);
    
    console.log(coordenadas)
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
