const API_URL = "http://127.0.0.1:8000";

// ==========================================
// 1. GERENCIAMENTO DE AUTENTICAÇÃO E PORTAIS
// ==========================================
function switchLoginPortal(portal) {
    document.querySelectorAll('.login-tab-btn').forEach(btn => btn.classList.remove('active'));
    if(portal === 'equipe') {
        document.querySelectorAll('.login-tab-btn')[0].classList.add('active');
        document.getElementById('portal-equipe').style.display = 'block';
        document.getElementById('portal-admin').style.display = 'none';
        document.getElementById('form-register-operator').style.display = 'none';
        document.getElementById('form-register-admin').style.display = 'none';
    } else {
        document.querySelectorAll('.login-tab-btn')[1].classList.add('active');
        document.getElementById('portal-admin').style.display = 'block';
        document.getElementById('portal-equipe').style.display = 'none';
        document.getElementById('form-register-operator').style.display = 'none';
        document.getElementById('form-register-admin').style.display = 'none';
    }
}

function toggleRegisterFormOperator(e, show) {
    e.preventDefault();
    document.getElementById('portal-equipe').style.display = show ? 'none' : 'block';
    document.getElementById('form-register-operator').style.display = show ? 'block' : 'none';
    document.getElementById('auth-tabs').style.display = show ? 'none' : 'flex';
}

function toggleRegisterFormAdmin(e, show) {
    e.preventDefault();
    document.getElementById('portal-admin').style.display = show ? 'none' : 'block';
    document.getElementById('form-register-admin').style.display = show ? 'block' : 'none';
    document.getElementById('auth-tabs').style.display = show ? 'none' : 'flex';
}

function handleEmailLogin(event) {
    event.preventDefault();
    const email = document.getElementById('input-email-equipe').value;
    entrarNoSistema(email.split('@')[0], "Operador Técnico", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "operator");
}

function handleAdminLogin(event) {
    event.preventDefault();
    entrarNoSistema("Administrador Master", "Administrador", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", "admin");
}

function handleRegisterOperator(event) {
    event.preventDefault();
    alert("Cadastro de operador realizado com sucesso!");
    toggleRegisterFormOperator(event, false);
}

function handleRegisterAdmin(event) {
    event.preventDefault();
    alert("Empresa cadastrada com sucesso! Faça login com suas credenciais master.");
    toggleRegisterFormAdmin(event, false);
}

function handleCredentialResponse(response) {
    console.log("Google JWT Token:", response.credential);
    entrarNoSistema("Usuário Google", "Operador", "https://via.placeholder.com/150", "operator");
}

function entrarNoSistema(nome, cargo, avatar, role) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
    
    document.getElementById('user-name-display').innerText = nome;
    document.getElementById('user-role-display').innerText = cargo;
    document.getElementById('user-avatar').src = avatar;

    if(role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    } else {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
    }

    carregarDadosIniciais();
}

function logout() {
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
}

// ==========================================
// 2. NAVEGAÇÃO ENTRE TELAS (VIEWS)
// ==========================================
function switchView(viewId, event) {
    if(event) event.preventDefault();
    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active-view'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

    document.getElementById(viewId).classList.add('active-view');
    const activeNav = document.querySelector(`.nav-item[data-target="${viewId}"]`);
    if(activeNav) activeNav.classList.add('active');
}

// ==========================================
// 3. GESTÃO DE PERFIL, UPLOAD DE FOTO E SENHA
// ==========================================
function abrirModalPerfil() {
    document.getElementById('perfil-nome').value = document.getElementById('user-name-display').innerText;
    document.getElementById('preview-avatar').src = document.getElementById('user-avatar').src;
    document.getElementById('perfil-nova-senha').value = ""; // Limpa campo de senha ao abrir
    document.getElementById('modal-perfil').style.display = 'flex';
}

function fecharModalPerfil() {
    document.getElementById('modal-perfil').style.display = 'none';
}

function previewNovaFoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('preview-avatar').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

function salvarAlteracoesPerfil(event) {
    event.preventDefault();
    
    const novoNome = document.getElementById('perfil-nome').value;
    const novoEmail = document.getElementById('perfil-email').value;
    const novaFoto = document.getElementById('preview-avatar').src;
    const novaSenha = document.getElementById('perfil-nova-senha').value;

    // Atualiza visualmente na barra lateral
    document.getElementById('user-name-display').innerText = novoNome;
    document.getElementById('user-avatar').src = novaFoto;

    // Validação ou envio da senha
    if(novaSenha) {
        if(novaSenha.length < 6) {
            alert("A nova senha deve ter pelo menos 6 caracteres.");
            return;
        }
        console.log("Nova senha configurada com sucesso para o usuário:", novoEmail);
    }

    alert("Dados de perfil e configurações de acesso atualizados com sucesso!");
    fecharModalPerfil();
}

// ==========================================
// 4. COMPONENTES DE INTERFACE E NOTIFICAÇÕES
// ==========================================
function toggleNotifications(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('notif-dropdown');
    dropdown.classList.toggle('show');
}

window.onclick = function(event) {
    if (!event.target.closest('.notification-btn') && !event.target.closest('.notifications-dropdown')) {
        document.getElementById('notif-dropdown').classList.remove('show');
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
}

// ==========================================
// 5. CARREGAMENTO DE DADOS E AÇÕES DO SISTEMA
// ==========================================
async function carregarDadosIniciais() {
    try {
        const res = await fetch(`${API_URL}/api/dashboard/estatisticas`);
        if(res.ok) {
            const data = await res.json();
            document.getElementById('stat-equipamentos').innerText = data.inventario?.total_ativos || 142;
            document.getElementById('stat-agenda').innerText = 18;
            document.getElementById('stat-operadores').innerText = 12;
            document.getElementById('stat-clientes').innerText = 24;
        }
    } catch (e) {
        console.log("Backend offline ou em modo estático, aplicando dados padrões.");
        document.getElementById('stat-equipamentos').innerText = "142";
        document.getElementById('stat-agenda').innerText = "18";
        document.getElementById('stat-operadores').innerText = "12";
        document.getElementById('stat-clientes').innerText = "24";
    }
}

function abrirNovoEquipamento() { alert("Abrir modal de novo equipamento"); }
function abrirNovoAgendamento() { alert("Abrir modal de novo agendamento"); }
function abrirNovaEscala() { alert("Abrir modal de nova escala"); }
function abrirNovoOperador() { alert("Abrir modal de novo operador"); }
function abrirNovoCliente() { alert("Abrir modal de novo cliente"); }
function abrirNovaReserva() { alert("Abrir modal de nova reserva"); }
function exportarRelatorio(tipo) { alert("Exportando relatório em formato " + tipo.toUpperCase()); }
function handleSearch() {}