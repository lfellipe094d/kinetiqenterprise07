function mudarAba(aba) {
    const abas = ['escalas', 'equipamentos', 'agenda', 'relatorios'];
    abas.forEach(a => {
        document.getElementById(`tab-${a}`).classList.add('hidden');
        document.getElementById(`btn-${a}`).className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition";
    });

    document.getElementById(`tab-${aba}`).classList.remove('hidden');
    document.getElementById(`btn-${aba}`).className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-kinetiqOrange text-white font-medium transition";

    const titulos = {
        escalas: 'Escalas de Produção',
        equipamentos: 'Inventário de Equipamentos',
        agenda: 'Agenda de Produções',
        relatorios: 'Relatórios e Desempenho'
    };
    document.getElementById('titulo-pagina').textContent = titulos[aba];
}

async function carregarDados() {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
        // Escalas
        const resEscalas = await fetch(`${API_URL}/escalas`, { headers });
        if (resEscalas.ok) {
            const escalas = await resEscalas.json();
            document.getElementById('lista-escalas').innerHTML = escalas.map(e => `
                <div class="bg-kinetiqCard border border-gray-800 p-5 rounded-xl shadow">
                    <h3 class="font-bold text-lg text-white mb-1">${e.titulo}</h3>
                    <p class="text-sm text-gray-400">Operador: <span class="text-white">${e.operador}</span></p>
                    <p class="text-sm text-gray-400">Data: <span class="text-white">${e.data} (${e.turno})</span></p>
                </div>
            `).join('');
        }

        // Equipamentos
        const resEq = await fetch(`${API_URL}/equipamentos`, { headers });
        if (resEq.ok) {
            const equipamentos = await resEq.json();
            document.getElementById('lista-equipamentos').innerHTML = equipamentos.map(eq => `
                <div class="bg-kinetiqCard border border-gray-800 p-5 rounded-xl shadow flex flex-col justify-between">
                    <div>
                        <h3 class="font-bold text-white mb-1">${eq.nome}</h3>
                        <p class="text-xs text-gray-400">Categoria: ${eq.categoria}</p>
                        <p class="text-xs text-gray-400 mb-4">Série: ${eq.numero_serie || 'N/A'}</p>
                    </div>
                    <span class="self-start px-2.5 py-1 text-xs rounded-full font-medium ${eq.disponivel ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}">
                        ${eq.disponivel ? 'Disponível' : 'Em Uso'}
                    </span>
                </div>
            `).join('');
        }

        // Agenda
        const resAgenda = await fetch(`${API_URL}/agenda`, { headers });
        if (resAgenda.ok) {
            const agenda = await resAgenda.json();
            document.getElementById('lista-agenda').innerHTML = agenda.map(a => `
                <div class="bg-kinetiqCard border border-gray-800 p-5 rounded-xl shadow">
                    <h3 class="font-bold text-lg text-white mb-1">${a.titulo}</h3>
                    <p class="text-sm text-gray-400">Local: <span class="text-white">${a.local}</span></p>
                    <p class="text-sm text-gray-400">Data: <span class="text-white">${a.data}</span></p>
                </div>
            `).join('');
        }

        // Relatórios
        const resRel = await fetch(`${API_URL}/relatorios`, { headers });
        if (resRel.ok) {
            const rel = await resRel.json();
            document.getElementById('dados-relatorios').innerHTML = `
                <div class="bg-kinetiqCard border border-gray-800 p-6 rounded-xl">
                    <p class="text-gray-400 text-sm">Total de Equipamentos</p>
                    <h3 class="text-3xl font-bold text-kinetiqOrange mt-2">${rel.total_equipamentos}</h3>
                </div>
                <div class="bg-kinetiqCard border border-gray-800 p-6 rounded-xl">
                    <p class="text-gray-400 text-sm">Equipamentos Livres</p>
                    <h3 class="text-3xl font-bold text-green-400 mt-2">${rel.equipamentos_disponiveis}</h3>
                </div>
                <div class="bg-kinetiqCard border border-gray-800 p-6 rounded-xl">
                    <p class="text-gray-400 text-sm">Total de Reservas</p>
                    <h3 class="text-3xl font-bold text-kinetiqBlue mt-2">${rel.total_reservas}</h3>
                </div>
            `;
        }
    } catch (err) {
        console.error("Erro ao carregar dados:", err);
    }
}