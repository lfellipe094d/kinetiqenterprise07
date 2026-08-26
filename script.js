const API_URL = "http://127.0.0.1:8000";

// Base de dados local simulada para garantir que inclusão e exclusão funcionem instantaneamente
let dbKinetiq = {
    equipamentos: [
        { id: "#01", nome: "Sony FX3 Cinema Line", categoria: "Câmeras", serie: "SN-983421", status: "Disponível" },
        { id: "#02", nome: "Canon EOS R5", categoria: "Câmeras", serie: "SN-445129", status: "Disponível" }
    ],
    agenda: [
        { id: "#101", titulo: "Gravação Corporativa", data: "28/08/2026", local: "Estúdio Principal" }
    ],
    escalas: [
        { id: "#501", cargo: "Operador de Câmeras", operador: "Carlos Silva", data: "28/08/2026", turno: "Integral" }
    ],
    operadores: [
        { id: "#01", nome: "Carlos Silva", email: "carlos@kinetiq.org", funcao: "Diretor de Fotografia" }
    ],
    clientes: [
        { id: "#C1", nome: "Get Church Filmes", contato: "(11) 98765-4321", email: "contato@getchurch.com" }
    ],
    reservas: [
        { id: "#R1", equipamento: "Sony FX3", solicitante: "Carlos Silva", periodo: "28/08 - 29/08", status: "Reservado" }
    ]
};

// ==========================================
// 1. RENDERIZAÇÃO E ATUALIZAÇÃO DAS TABELAS
// ==========================================
function renderizarTabelas() {
    // Tabela Equipamentos
    const tbodyEq = document.getElementById('table-equipamentos-body');
    if(tbodyEq) {
        tbodyEq.innerHTML = dbKinetiq.equipamentos.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.nome}</td>
                <td>${item.categoria}</td>
                <td>${item.serie}</td>
                <td><span class="status-badge available">${item.status}</span></td>
                <td class="admin-only">
                    <div class="action-btns">
                        <button class="btn-icon delete" title="Excluir" onclick="deletarItem('equipamentos', '${item.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Tabela Agenda
    const tbodyAgenda = document.getElementById('table-agenda-body');
    if(tbodyAgenda) {
        tbodyAgenda.innerHTML = dbKinetiq.agenda.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.titulo}</td>
                <td>${item.data}</td>
                <td>${item.local}</td>
                <td class="admin-only">
                    <div class="action-btns">
                        <button class="btn-icon delete" title="Excluir" onclick="deletarItem('agenda', '${item.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Tabela Escalas
    const tbodyEscalas = document.getElementById('table-escalas-body');
    if(tbodyEscalas) {
        tbodyEscalas.innerHTML = dbKinetiq.escalas.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.cargo}</td>
                <td>${item.operador}</td>
                <td>${item.data}</td>
                <td>${item.turno}</td>
                <td class="admin-only">
                    <div class="action-btns">
                        <button class="btn-icon delete" title="Excluir" onclick="deletarItem('escalas', '${item.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Tabela Operadores
    const tbodyOps = document.getElementById('table-operadores-body');
    if(tbodyOps) {
        tbodyOps.innerHTML = dbKinetiq.operadores.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.nome}</td>
                <td>${item.email}</td>
                <td>${item.funcao}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon delete" title="Excluir" onclick="deletarItem('operadores', '${item.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Tabela Clientes
    const tbodyClientes = document.getElementById('table-clientes-body');
    if(tbodyClientes) {
        tbodyClientes.innerHTML = dbKinetiq.clientes.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.nome}</td>
                <td>${item.contato}</td>
                <td>${item.email}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon delete" title="Excluir" onclick="deletarItem('clientes', '${item.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Tabela Reservas
    const tbodyReservas = document.getElementById('table-reservas-body');
    if(tbodyReservas) {
        tbodyReservas.innerHTML = dbKinetiq.reservas.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.equipamento}</td>
                <td>${item.solicitante}</td>
                <td>${item.periodo}</td>
                <td><span class="status-badge reserved">${item.status}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon delete" title="Excluir" onclick="deletarItem('reservas', '${item.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Atualiza contadores do dashboard
    document.getElementById('stat-equipamentos').innerText = dbKinetiq.equipamentos.length;
    document.getElementById('stat-agenda').innerText = dbKinetiq.agenda.length;
    document.getElementById('stat-operadores').innerText = dbKinetiq.operadores.length;
    document.getElementById('stat-clientes').innerText = dbKinetiq.clientes.length;
}

// ==========================================
// 2. FUNÇÃO DE EXCLUSÃO DE ITENS
// ==========================================
function deletarItem(modulo, id) {
    if(confirm(`Deseja realmente excluir o registro ${id}?`)) {
        dbKinetiq[modulo] = dbKinetiq[modulo].filter(item => item.id !== id);
        renderizarTabelas();
        alert("Registro excluído com sucesso!");
    }
}

// ==========================================
// 3. FUNÇÕES DE INCLUSÃO (MODAIS INTERATIVOS)
// ==========================================
function abrirNovoEquipamento() {
    const nome = prompt("Nome do Equipamento (ex: Lente 24-70mm):");
    if(!nome) return;
    const categoria = prompt("Categoria (ex: Lentes, Câmeras, Áudio):") || "Geral";
    const serie = prompt("Número de Série:") || "SN-000000";

    const novoId = `#0${dbKinetiq.equipamentos.length + 1}`;
    dbKinetiq.equipamentos.push({ id: novoId, nome, categoria, serie, status: "Disponível" });
    renderizarTabelas();
    alert("Equipamento cadastrado com sucesso!");
}

function abrirNovoAgendamento() {
    const titulo = prompt("Título da Produção:");
    if(!titulo) return;
    const data = prompt("Data (DD/MM/AAAA):") || "29/08/2026";
    const local = prompt("Local da Gravação:") || "Externo";

    const novoId = `#10${dbKinetiq.agenda.length + 1}`;
    dbKinetiq.agenda.push({ id: novoId, titulo, data, local });
    renderizarTabelas();
    alert("Agendamento criado com sucesso!");
}

function abrirNovaEscala() {
    const cargo = prompt("Cargo / Produção:");
    if(!cargo) return;
    const operador = prompt("Nome do Operador Escalado:") || "Operador";
    const data = prompt("Data (DD/MM/AAAA):") || "28/08/2026";
    const turno = prompt("Turno (Manhã, Tarde, Integral):") || "Integral";

    const novoId = `#50${dbKinetiq.escalas.length + 1}`;
    dbKinetiq.escalas.push({ id: novoId, cargo, operador, data, turno });
    renderizarTabelas();
    alert("Operador escalado com sucesso!");
}

function abrirNovoOperador() {
    const nome = prompt("Nome Completo do Operador:");
    if(!nome) return;
    const email = prompt("E-mail:") || "operador@kinetiq.org";
    const funcao = prompt("Função / Especialidade:") || "Técnico Audiovisual";

    const novoId = `#0${dbKinetiq.operadores.length + 1}`;
    dbKinetiq.operadores.push({ id: novoId, nome, email, funcao });
    renderizarTabelas();
    alert("Operador cadastrado com sucesso!");
}

function abrirNovoCliente() {
    const nome = prompt("Nome do Cliente / Empresa:");
    if(!nome) return;
    const contato = prompt("Telefone / Contato:") || "(11) 99999-9999";
    const email = prompt("E-mail corporativo:") || "cliente@email.com";

    const novoId = `#C${dbKinetiq.clientes.length + 1}`;
    dbKinetiq.clientes.push({ id: novoId, nome, contato, email });
    renderizarTabelas();
    alert("Cliente cadastrado com sucesso!");
}

function abrirNovaReserva() {
    const equipamento = prompt("Nome do Equipamento a reservar:");
    if(!equipamento) return;
    const solicitante = prompt("Nome do Solicitante:") || "Equipe";
    const periodo = prompt("Período (Ex: 28/08 - 30/08):") || "Hoje";

    const novoId = `#R${dbKinetiq.reservas.length + 1}`;
    dbKinetiq.reservas.push({ id: novoId, equipamento, solicitante, periodo, status: "Reservado" });
    renderizarTabelas();
    alert("Reserva registrada com sucesso!");
}

// ==========================================
// 4. FUNÇÃO DE PESQUISA GLOBAL EM TEMPO REAL
// ==========================================
function handleSearch() {
    const termo = document.getElementById('input-search').value.toLowerCase();
    if(!termo) {
        renderizarTabelas();
        return;
    }

    // Filtra equipamentos localmente com base na pesquisa
    dbKinetiq.equipamentos = dbKinetiq.equipamentos.filter(e => 
        e.nome.toLowerCase().includes(termo) || e.categoria.toLowerCase().includes(termo) || e.serie.toLowerCase().includes(termo)
    );
    renderizarTabelas();
}

// ==========================================
// 5. AUTENTICAÇÃO E PERFIL
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
    entrarNoSistema("Carlos Silva", "Operador Técnico", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "operator");
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
    alert("Empresa cadastrada com sucesso!");
    toggleRegisterFormAdmin(event, false);
}

function handleCredentialResponse(response) {
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

    renderizarTabelas();
}

function logout() {
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
}

function switchView(viewId, event) {
    if(event) event.preventDefault();
    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active-view'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

    document.getElementById(viewId).classList.add('active-view');
    const activeNav = document.querySelector(`.nav-item[data-target="${viewId}"]`);
    if(activeNav) activeNav.classList.add('active');
}

function toggleNotifications(e) {
    e.stopPropagation();
    document.getElementById('notif-dropdown').classList.toggle('show');
}

window.onclick = function(event) {
    if (!event.target.closest('.notification-btn') && !event.target.closest('.notifications-dropdown')) {
        document.getElementById('notif-dropdown').classList.remove('show');
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
}

function abrirModalPerfil() {
    document.getElementById('perfil-nome').value = document.getElementById('user-name-display').innerText;
    document.getElementById('preview-avatar').src = document.getElementById('user-avatar').src;
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
    document.getElementById('user-name-display').innerText = document.getElementById('perfil-nome').value;
    document.getElementById('user-avatar').src = document.getElementById('preview-avatar').src;
    alert("Perfil atualizado com sucesso!");
    fecharModalPerfil();
}

function exportarRelatorio(tipo) {
    alert("Relatório exportado com sucesso em formato " + tipo.toUpperCase());
}