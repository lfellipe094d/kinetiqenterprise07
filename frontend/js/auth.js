const API_URL = ''

async function fazerLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const errorDiv = document.getElementById('login-error');

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            verificarAutenticacao();
        } else {
            errorDiv.textContent = data.detail || 'Erro ao realizar login.';
            errorDiv.classList.remove('hidden');
        }
    } catch (err) {
        errorDiv.textContent = 'Erro de conexão com o backend FastAPI.';
        errorDiv.classList.remove('hidden');
    }
}

function verificarAutenticacao() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    if (token) {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');
        document.getElementById('user-display').textContent = `Logado como: ${usuario.nome || 'Usuário'}`;
        if (typeof carregarDados === 'function') carregarDados();
    } else {
        document.getElementById('login-section').classList.remove('hidden');
        document.getElementById('app-section').classList.add('hidden');
    }
}

function fazerLogout() {
    localStorage.clear();
    verificarAutenticacao();
}

window.onload = verificarAutenticacao;