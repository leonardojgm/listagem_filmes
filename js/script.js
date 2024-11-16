const filmesMock = [
    {
        image: 'https://img.elo7.com.br/product/original/3FBA809/big-poster-filme-batman-2022-90x60-cm-lo002-poster-batman.jpg',
        title: 'Batman',
        rating: 9.2,
        year: 2022,
        description: "Descrição do filme…",
        isFavorited: true,
    },
    {
        image: 'https://upload.wikimedia.org/wikipedia/pt/thumb/9/9b/Avengers_Endgame.jpg/250px-Avengers_Endgame.jpg',
        title: 'Avengers',
        rating: 9.2,
        year: 2019,
        description: "Descrição do filme…",
        isFavorited: false
    },
    {
        image: 'https://upload.wikimedia.org/wikipedia/en/1/17/Doctor_Strange_in_the_Multiverse_of_Madness_poster.jpg',
        title: 'Doctor Strange',
        rating: 9.2,
        year: 2022,
        description: "Descrição do filme…",
        isFavorited: false
    },
]
const checkbox = document.querySelector('#checkbox');
const busca = document.querySelector('#pesquisa');
const chave = document.querySelector('#chave');
const botao = document.querySelector('.cabecalho__botao');
const baseUrl = "https://api.themoviedb.org/3";
const imgUrl = "https://image.tmdb.org/t/p/w500";
const listaFilmes = document.querySelector('.principal__filmes');
let filmesFavoritos = getFromLocalStorage("favoritos") ?? [];

listaFilmes.innerHTML = "";

function desenharFilme(filme) {
    const listaFilmes = document.querySelector('.principal__filmes');
    const filmeElement = document.createElement('li');

    filmeElement.classList.add('principal__filme');
    filmeElement.innerHTML = `
        <img class="principal__filme-imagem" src="${filme.image}" alt="Capa do filme ${filme.title}">
        <div class="principal__filme-dados">
            <h2 class="principal__filme-titulo">${filme.title} (${filme.year})</h2>
            <div class="principal__filme-acoes">
                <div class="principal__filme-estrelas">
                    <img class="principal__filme-estrela" src="img/estrela.svg" alt="Icone de avaliação">
                    <p class="principal__filme-avaliacao">${filme.rating}</p>
                </div>
                <div class="principal__filme-favoritos">
                    <img class="principal__filme-favorito" src="img/${(filme.isFavorited ? 'coracao' : 'coracao_vazio')}.svg" alt="Icone de favorito">
                    <p class="principal__filme-favoritar">Favoritar</p>
                </div>
            </div>
        </div>
        <p class="principal__filme-descricao">${filme.description}</p>
    `

    listaFilmes.appendChild(filmeElement);
}
// filmesMock.forEach(filme => desenharFilme(filme))

async function obterTMDB(endpoint, params = {}) {
    const baseUrl = "https://api.themoviedb.org/3";
    const url = new URL(`${baseUrl}/${endpoint}`);
    
    url.searchParams.append("api_key", chave.value);

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
    }

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erro: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();

        return data;
    } catch (error) {
        console.error("Erro ao acessar a API do TMDB:", error);

        return null;
    }
}

function exibirFavoritos() {
    listaFilmes.innerHTML = "";

    if (checkbox.checked) {
        if (filmesFavoritos.length === 0) {
            listaFilmes.innerHTML = "Nenhum filme favorito encontrado.";
    
            return;
        } else if (busca.value) {
            atualizar('search/movie', { language: "pt-BR", page: 1, query: busca.value });
        } else {
            filmesFavoritos.forEach(filme => atualizar(`movie/${filme}`, { language: "pt-BR", page: 1}));
        }
    } else {
        if (busca.value) {
            atualizar('search/movie', { language: "pt-BR", page: 1, query: busca.value });
        } else {
            atualizar("movie/popular", { language: "pt-BR", page: 1 });
        }
    }
}

function recuperarChave() {
    chave.value = getFromLocalStorage("chave");

    if (chave.value) {
        botao.textContent = "Limpar";

        chave.setAttribute("type", "password");
    } 
}

function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFromLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}

function favoritar(element, id) {
    // console.log(element, filme);
    if (element.src.endsWith('coracao.svg')) {
        element.src = `img/coracao_vazio.svg`;

        filmesFavoritos.splice(filmesFavoritos.indexOf(id), 1);
    } else {
        element.src = `img/coracao.svg`;

        filmesFavoritos.push(id);
    }

    saveToLocalStorage("favoritos", filmesFavoritos);

    if (checkbox.checked) {
        exibirFavoritos();
    }
}

function desenharFilmeTMDB(filme) {
    const filmeElement = document.createElement('li');

    filmeElement.classList.add('principal__filme');
    filmeElement.innerHTML = `
        <img class="principal__filme-imagem" src="${imgUrl}${filme.poster_path}" alt="Capa do filme ${filme.title}">
        <div class="principal__filme-dados">
            <h2 class="principal__filme-titulo">${filme.title} (${filme.release_date.split('-')[0]})</h2>
            <div class="principal__filme-acoes">
                <div class="principal__filme-estrelas">
                    <img class="principal__filme-estrela" src="img/estrela.svg" alt="Icone de avaliação">
                    <p class="principal__filme-avaliacao">${filme.vote_average}</p>
                </div>
                <div class="principal__filme-favoritos">
                    <img class="principal__filme-favorito" src="img/${(filme.isFavorited ? 'coracao' : 'coracao_vazio')}.svg" alt="Icone de favorito" onclick="favoritar(this, '${filme.id}')">
                    <p class="principal__filme-favoritar">Favoritar</p>
                </div>
            </div>
        </div>
        <p class="principal__filme-descricao">${filme.overview}</p>
    `

    listaFilmes.appendChild(filmeElement);
}

function atualizar(endpoint, params) {
    obterTMDB(endpoint, params).then(data => {
        if (data) {
            if (data.results?.length === 0) {
                listaFilmes.innerHTML = "Nenhum filme encontrado.";                
            } else if (checkbox.checked && filmesFavoritos.length === 0) {
                listaFilmes.innerHTML = "Nenhum filme favorito encontrado.";
            } else if (data.results?.length > 0){
                data.results.forEach(filme => {
                    // console.log(filmesFavoritos, filme);
                    filme.isFavorited = filmesFavoritos.some(favorito => favorito == filme.id);

                    if (checkbox.checked) {
                        if (filme.isFavorited) {
                            desenharFilmeTMDB(filme);
                        }
                    } else {
                        desenharFilmeTMDB(filme);
                    }
                });                
            } else {
                console.log(filmesFavoritos, data);
                data.isFavorited = filmesFavoritos.some(favorito => favorito == data.id);
                
                desenharFilmeTMDB(data);
            }

            if (listaFilmes.innerHTML === "") {                
                listaFilmes.innerHTML = "Nenhum filme encontrado.";    
            }
        }
    });
}

document.addEventListener('keydown', (event) => {
    // console.log(event.key);
    if (event.key === 'Enter') {
        // console.log(busca.value);

        if (busca.value) {
            listaFilmes.innerHTML = "";

            atualizar('search/movie', { language: "pt-BR", page: 1, query: busca.value });
        }
    }
})

checkbox.addEventListener('change', () => {
    exibirFavoritos();
})

botao.addEventListener('click', () => {
    if (botao.textContent === "Limpar") {
        botao.textContent = "Salvar";
        chave.value = "";

        chave.setAttribute("type", "text");
    } else {        
        botao.textContent = "Limpar";

        chave.setAttribute("type", "password");
    }

    saveToLocalStorage("chave", chave.value);

    window.location.reload();
})

recuperarChave();
atualizar("movie/popular", { language: "pt-BR", page: 1 });