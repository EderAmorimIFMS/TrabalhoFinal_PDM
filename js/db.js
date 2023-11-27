const users = [
    {
        "nome": "Eder Amorim",
        "email": "ederamorim@gmail.com",
        "senha": "senha123"
    }
];

const btn_login = document.getElementById("logar");
const login_email = document.getElementById("login_email");
const login_senha = document.getElementById("login_senha");

const sing_nome = document.getElementById("sing_nome");
const sing_email = document.getElementById("sing_email");
const sing_senha = document.getElementById("sing_senha");


btn_login.addEventListener('click', () => {
   if(users.email === input_email & users.senha === input_senha) {
        console.log("Usuario logado com sucesso!");
        //CRIAR REDIRECIONAMENTO PAGINA PRINCIPAL
   } else {
        alert("O usuario não exite!")
   }
})

import { openDB } from "idb";
import {} from "./geolocation";
import {} from "./camera";

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
                        <p>icone</p>
                    </div>`;
        });
        listagem(divLista.join(' '));
    }
}

async function cadastrarFoco() {
    let titulo = document.getElementById("titulo").value;
    let descricao = document.getElementById("descricao").value;
    //imagem e coordenadas ???


    const tx = await db.transaction('focos', 'readwrite');
    const store = tx.objectStore('focos');

    try {
        await store.add({ 
            titulo: titulo,  
            descricao: descricao,
            //imagem e coordenadas ???

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
    //imagem e coordenadas ???
}

function listagem(text){
    document.getElementById('resultados').innerHTML = text;
}