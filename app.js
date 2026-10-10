const STORAGE_KEY = 'itInventoryAppState';

const defaultState = {
  inventory: [
    { id: 1, code: 'IT-001', name: 'Laptop Lenovo ThinkPad T14', category: 'Laptop', location: 'Ruang IT', status: 'Ready', assignedTo: 'Dinda', qr: 'IT-001' },
    { id: 2, code: 'IT-002', name: 'Printer Canon MF445dw', category: 'Printer', location: 'Kantor', status: 'Maintenance', assignedTo: 'Riska', qr: 'IT-002' },
    { id: 3, code: 'IT-003', name: 'Router Cisco 9300', category: 'Router', location: 'Server Room', status: 'In Use', assignedTo: 'Bagus', qr: 'IT-003' },
    { id: 4, code: 'IT-004', name: 'Monitor Dell 24 inch', category: 'Monitor', location: 'Ruang Admin', status: 'Ready', assignedTo: 'Sari', qr: 'IT-004' },
    { id: 5, code: 'IT-005', name: 'UPS APC 1500VA', category: 'UPS', location: 'Ruang IT', status: 'Maintenance', assignedTo: 'Nadia', qr: 'IT-005' }
  ],
  tickets: [
    { id: 'T-101', title: 'Internet kantor lambat', priority: 'High', status: 'Open', assetCode: 'IT-003', description: 'Jaringan Wi-Fi di area kantor sering putus dan stabilitas sinyal menurun sejak pagi.', createdAt: '2026-10-09' },
    { id: 'T-102', title: 'Printer sering macet', priority: 'Medium', status: 'In Progress', assetCode: 'IT-002', description: 'Printer GPS gagal mencetak berulang dan sering memunculkan error toner.', createdAt: '2026-10-10' },
    { id: 'T-103', title: 'Laptop Dinda tidak bisa login', priority: 'High', status: 'Resolved', assetCode: 'IT-001', description: 'User tidak dapat masuk ke akun karena password expired dan antivirus memblokir akses.', createdAt: '2026-10-07' }
  ]
};

let state = loadState();
let activeNav = 'dashboard';
let activeTicketFilter = 'all';

const elements = {
  summary: {
    totalAssets: document.getElementById('totalAssets'),
    readyAssets: document.getElementById('readyAssets'),
    activeTickets: document.getElementById('activeTickets'),
    maintenanceCount: document.getElementById('maintenanceCount')
  },
  inventoryTableBody: document.getElementById('inventoryTableBody'),
  inventoryCount: document.getElementById('inventoryCount'),
  ticketList: document.getElementById('ticketList'),
  ticketCount: document.getElementById('ticketCount'),
  recentAssets: document.getElementById('recentAssets'),
  recentTickets: document.getElementById('recentTickets'),
  inventorySearch: document.getElementById('inventorySearch'),
  assetScanResult: document.getElementById('assetScanResult'),
  qrCanvas: document.getElementById('qrCanvas'),
  qrCodeInput: document.getElementById('qrCodeInput')
};

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return JSON.parse(JSON.stringify(defaultState));
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse localStorage state:', error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return JSON.parse(JSON.stringify(defaultState));
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function statusClass(status) {
  return status.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
}

function formatStatusLabel(status) {
  const normalized = status.toLowerCase();
  if (normalized === 'in use') return 'In Use';
  if (normalized === 'in_progress' || normalized === 'in progress') return 'In Progress';
  return status;
}

function createStatusPill(status) {
  const cssClass = statusClass(status);
  return `<span class="status-pill ${cssClass}">${formatStatusLabel(status)}</span>`;
}

function renderSummary() {
  const totalAssets = state.inventory.length;
  const readyAssets = state.inventory.filter((item) => item.status === 'Ready').length;
  const activeTickets = state.tickets.filter((ticket) => ticket.status !== 'Closed' && ticket.status !== 'Resolved').length;
  const maintenanceCount = state.inventory.filter((item) => item.status === 'Maintenance').length;

  elements.summary.totalAssets.textContent = totalAssets;
  elements.summary.readyAssets.textContent = readyAssets;
  elements.summary.activeTickets.textContent = activeTickets;
  elements.summary.maintenanceCount.textContent = maintenanceCount;
}

function renderInventoryTable() {
  const searchText = elements.inventorySearch.value.trim().toLowerCase();
  const filtered = state.inventory.filter((item) => {
    const textRepo = [item.code, item.name, item.location, item.assignedTo, item.category].join(' ').toLowerCase();
    return textRepo.includes(searchText);
  });

  elements.inventoryCount.textContent = `${filtered.length} barang`;

  if (!filtered.length) {
    elements.inventoryTableBody.innerHTML = '<tr><td colspan="7" class="empty-state">Data barang tidak ditemukan.</td></tr>';
    return;
  }

  elements.inventoryTableBody.innerHTML = filtered.map((item) => `
    <tr>
      <td class="asset-code">${item.code}</td>
      <td>
        <strong>${item.name}</strong><br />
        <span class="muted">${item.category}</span>
      </td>
      <td>${item.location}</td>
      <td>${createStatusPill(item.status)}</td>
      <td>${item.assignedTo}</td>
      <td><span class="qr-badge">${item.qr}</span></td>
      <td>
        <div class="actions">
          <button class="small-btn" data-action="view-qr" data-code="${item.code}">QR</button>
          <button class="small-btn" data-action="ticket" data-code="${item.code}">Ticket</button>
          <button class="small-btn danger" data-action="delete" data-code="${item.code}">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderRecentAssets() {
  const recent = [...state.inventory].slice(0, 4);

  elements.recentAssets.innerHTML = recent.map((item) => `
    <div class="asset-row">
      <div class="asset-meta">
        <strong>${item.name}</strong>
        <span>${item.code} • ${item.location}</span>
      </div>
      ${createStatusPill(item.status)}
    </div>
  `).join('');
}

function renderTickets() {
  const filtered = state.tickets.filter((ticket) => {
    if (activeTicketFilter === 'all') return true;
    return ticket.status.toLowerCase().replace(/\s+/g, '_') === activeTicketFilter;
  });

  elements.ticketCount.textContent = `${filtered.length} tiket`;

  if (!filtered.length) {
    elements.ticketList.innerHTML = '<div class="empty-state">Belum ada tiket pada filter ini.</div>';
    return;
  }

  elements.ticketList.innerHTML = filtered.map((ticket) => `
    <article class="ticket-card">
      <div class="ticket-head">
        <h4>${ticket.title}</h4>
        ${createStatusPill(ticket.status)}
      </div>
      <div class="ticket-meta">
        <strong>${ticket.id}</strong> • ${ticket.assetCode} • ${ticket.priority} priority • ${ticket.createdAt}
      </div>
      <p class="ticket-body">${ticket.description}</p>
    </article>
  `).join('');
}

function renderRecentTickets() {
  const recent = state.tickets.slice(0, 4);

  elements.recentTickets.innerHTML = recent.map((ticket) => `
    <div class="ticket-row">
      <div class="ticket-meta">
        <strong>${ticket.title}</strong>
        <span>${ticket.id} • ${ticket.assetCode}</span>
      </div>
      ${createStatusPill(ticket.status)}
    </div>
  `).join('');
}

function renderAll() {
  renderSummary();
  renderInventoryTable();
  renderRecentAssets();
  renderTickets();
  renderRecentTickets();
  renderQrPreview();
}

function openSection(target) {
  activeNav = target;
  document.querySelectorAll('.nav-item').forEach((button) => {
    button.classList.toggle('active', button.dataset.target === target);
  });

  document.querySelectorAll('.view').forEach((section) => {
    section.classList.toggle('active', section.id === target);
  });

  if (target === 'inventory') {
    elements.inventorySearch.focus();
  }
}

function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function generateQr(code) {
  const canvas = elements.qrCanvas;
  if (!code) return;

  QRCode.toCanvas(canvas, code, { width: 220, margin: 1 }, function (error) {
    if (error) {
      console.error('QR generation failed:', error);
      return;
    }
  });
}

function renderQrPreview() {
  const defaultCode = state.inventory[0]?.code || 'IT-001';
  generateQr(defaultCode);
}

function handleScanQr() {
  const query = (elements.qrCodeInput.value || '').trim();
  if (!query) {
    alert('Masukkan kode asset atau QR terlebih dahulu.');
    return;
  }

  const match = state.inventory.find((item) => item.code.toLowerCase() === query.toLowerCase() || item.qr.toLowerCase() === query.toLowerCase());

  if (!match) {
    elements.assetScanResult.className = 'asset-detail empty';
    elements.assetScanResult.innerHTML = '<p>Kode tidak ditemukan. Pastikan kode asset valid.</p>';
    return;
  }

  const openTickets = state.tickets.filter((ticket) => ticket.assetCode === match.code && ticket.status !== 'Resolved' && ticket.status !== 'Closed').length;

  generateQr(match.code);
  elements.assetScanResult.className = 'asset-detail';
  elements.assetScanResult.innerHTML = `
    <h4>${match.name}</h4>
    <div class="ticket-meta">${match.code} • ${match.category}</div>
    <div class="detail-grid">
      <div class="detail-item"><span>Status</span>${createStatusPill(match.status)}</div>
      <div class="detail-item"><span>Lokasi</span>${match.location}</div>
      <div class="detail-item"><span>PIC</span>${match.assignedTo}</div>
      <div class="detail-item"><span>Ticket aktif</span>${openTickets}</div>
    </div>
  `;
}

function handleInventoryActions(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const { action, code } = button.dataset;
  const itemIndex = state.inventory.findIndex((item) => item.code === code);

  if (action === 'delete') {
    if (itemIndex === -1) return;
    state.inventory.splice(itemIndex, 1);
    state.tickets = state.tickets.filter((ticket) => ticket.assetCode !== code);
    saveState();
    renderAll();
    return;
  }

  if (action === 'view-qr') {
    const item = state.inventory[itemIndex];
    if (!item) return;
    elements.qrCodeInput.value = item.code;
    openSection('scanner');
    handleScanQr();
    return;
  }

  if (action === 'ticket') {
    const item = state.inventory[itemIndex];
    if (!item) return;
    const form = document.getElementById('ticketForm');
    form.assetCode.value = item.code;
    openModal('ticketModal');
  }
}

function handleAssetSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const payload = Object.fromEntries(data.entries());

  const code = payload.code.trim();
  if (!code) {
    alert('Kode asset tidak boleh kosong.');
    return;
  }

  const itemExists = state.inventory.some((item) => item.code.toLowerCase() === code.toLowerCase());
  if (itemExists) {
    alert('Kode asset sudah terdaftar. Gunakan kode unik lain.');
    return;
  }

  state.inventory.unshift({
    id: Date.now(),
    code,
    name: payload.name.trim(),
    category: payload.category,
    location: payload.location.trim(),
    status: payload.status,
    assignedTo: payload.assignedTo.trim(),
    qr: code
  });

  saveState();
  form.reset();
  closeModal('assetModal');
  renderAll();
}

function handleTicketSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const payload = Object.fromEntries(data.entries());

  const title = payload.title.trim();
  const description = payload.description.trim();
  const assetCode = payload.assetCode.trim();

  if (!title || !description) {
    alert('Judul dan deskripsi tiket wajib diisi.');
    return;
  }

  const ticketId = `T-${String(Date.now()).slice(-5)}`;
  const newTicket = {
    id: ticketId,
    title,
    priority: payload.priority,
    status: payload.status,
    assetCode: assetCode || 'UMUM',
    description,
    createdAt: new Date().toISOString().slice(0, 10)
  };

  state.tickets.unshift(newTicket);
  saveState();
  form.reset();
  closeModal('ticketModal');
  renderAll();
}

function bindEvents() {
  document.querySelectorAll('.nav-item').forEach((button) => {
    button.addEventListener('click', () => openSection(button.dataset.target));
  });

  document.querySelectorAll('[data-target]').forEach((control) => {
    if (control.dataset.target) {
      control.addEventListener('click', () => {
        const target = control.dataset.target;
        if (target === 'inventory' || target === 'helpdesk' || target === 'scanner' || target === 'dashboard') {
          openSection(target);
        }
      });
    }
  });

  document.getElementById('openAssetModal').addEventListener('click', () => openModal('assetModal'));
  document.getElementById('openTicketModal').addEventListener('click', () => openModal('ticketModal'));
  document.getElementById('newTicketBtn').addEventListener('click', () => openModal('ticketModal'));

  document.querySelectorAll('[data-close]').forEach((closeBtn) => {
    closeBtn.addEventListener('click', () => closeModal(closeBtn.dataset.close));
  });

  document.getElementById('assetForm').addEventListener('submit', handleAssetSubmit);
  document.getElementById('ticketForm').addEventListener('submit', handleTicketSubmit);
  elements.inventorySearch.addEventListener('input', renderInventoryTable);

  document.getElementById('scanQrBtn').addEventListener('click', handleScanQr);
  elements.qrCodeInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleScanQr();
  });

  document.getElementById('inventoryTableBody').addEventListener('click', handleInventoryActions);

  document.querySelectorAll('[data-ticket-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      activeTicketFilter = button.dataset.ticketFilter;
      document.querySelectorAll('[data-ticket-filter]').forEach((chip) => chip.classList.toggle('active', chip === button));
      renderTickets();
    });
  });
}

bindEvents();
renderAll();
