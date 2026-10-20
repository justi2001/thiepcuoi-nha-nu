const http = require('http');
const fs = require('fs');
const path = require('path');

let PORT = parseInt(process.env.PORT || '3001', 10);
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.mp4': 'audio/mp4',
  '.m4a': 'audio/mp4',
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const DATA_DIR = path.join(__dirname, 'data');
const WISHES_FILE = path.join(DATA_DIR, 'wishes.json');
const RSVPS_FILE = path.join(DATA_DIR, 'rsvps.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON(file, defaultData = []) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultData, null, 2), 'utf8');
      return defaultData;
    }
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.error('Error reading ' + file + ':', e.message);
    return defaultData;
  }
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error writing ' + file + ':', e.message);
    return false;
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) { // 1MB limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const reqPath = decodeURI(parsedUrl.pathname);

  // ==========================================
  // API: WISHES (SỔ LƯU BÚT)
  // ==========================================
  if (reqPath === '/api/wishes' && req.method === 'GET') {
    const wishes = readJSON(WISHES_FILE, []);
    sendJSON(res, 200, { success: true, data: wishes });
    return;
  }

  if (reqPath === '/api/wishes' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      if (!body.name || !body.message) {
        sendJSON(res, 400, { success: false, message: 'Vui lòng nhập họ tên và lời chúc!' });
        return;
      }
      const wishes = readJSON(WISHES_FILE, []);
      const newWish = {
        id: Date.now(),
        name: String(body.name).trim().slice(0, 100),
        message: String(body.message).trim().slice(0, 1000),
        time: 'Vừa xong',
        createdAt: new Date().toISOString(),
        likes: 0
      };
      wishes.unshift(newWish);
      writeJSON(WISHES_FILE, wishes);
      sendJSON(res, 201, { success: true, wish: newWish, count: wishes.length });
    } catch (e) {
      sendJSON(res, 500, { success: false, message: e.message });
    }
    return;
  }

  // Like a wish
  const likeMatch = reqPath.match(/^\/api\/wishes\/(\d+)\/like$/);
  if (likeMatch && req.method === 'POST') {
    const id = parseInt(likeMatch[1], 10);
    const wishes = readJSON(WISHES_FILE, []);
    const item = wishes.find(w => w.id === id);
    if (!item) {
      sendJSON(res, 404, { success: false, message: 'Không tìm thấy lời chúc!' });
      return;
    }
    item.likes = (item.likes || 0) + 1;
    writeJSON(WISHES_FILE, wishes);
    sendJSON(res, 200, { success: true, likes: item.likes });
    return;
  }

  // ==========================================
  // API: RSVP (XÁC NHẬN THAM DỰ)
  // ==========================================
  if (reqPath === '/api/rsvp' && req.method === 'GET') {
    const rsvps = readJSON(RSVPS_FILE, []);
    sendJSON(res, 200, { success: true, count: rsvps.length, data: rsvps });
    return;
  }

  if (reqPath === '/api/rsvp' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      if (!body.name) {
        sendJSON(res, 400, { success: false, message: 'Vui lòng nhập họ và tên!' });
        return;
      }
      const rsvps = readJSON(RSVPS_FILE, []);
      const newRsvp = {
        id: Date.now(),
        name: String(body.name).trim(),
        email: String(body.email || '').trim(),
        attendance: String(body.attendance || 'Có, tôi sẽ tham dự'),
        guestOf: String(body.guestOf || 'Chú Rể & Cô Dâu'),
        guestCount: String(body.guestCount || '1'),
        eventTarget: String(body.eventTarget || 'Tất cả Sự kiện nhà Trai'),
        submittedAt: new Date().toISOString()
      };
      rsvps.unshift(newRsvp);
      writeJSON(RSVPS_FILE, rsvps);
      sendJSON(res, 201, { success: true, rsvp: newRsvp, total: rsvps.length });
    } catch (e) {
      sendJSON(res, 500, { success: false, message: e.message });
    }
    return;
  }

  // Export RSVP as CSV
  if (reqPath === '/api/rsvp/export' && req.method === 'GET') {
    const rsvps = readJSON(RSVPS_FILE, []);
    let csv = '\uFEFFHọ và tên,Email,Tham dự,Khách của ai,Số người,Sự kiện,Thời gian gửi\n';
    rsvps.forEach(r => {
      csv += `"${(r.name || '').replace(/"/g, '""')}","${(r.email || '').replace(/"/g, '""')}","${r.attendance || ''}","${r.guestOf || ''}","${r.guestCount || ''}","${r.eventTarget || ''}","${r.submittedAt || ''}"\n`;
    });
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="Danh_sach_RSVP_Dam_cuoi.csv"'
    });
    res.end(csv);
    return;
  }

  // ==========================================
  // STATIC FILES
  // ==========================================
  let localPath = reqPath;
  if (localPath === '/') localPath = '/index.html';

  let filePath = path.join(__dirname, 'public', localPath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, localPath);
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const isStaticAsset = ['.jpg', '.jpeg', '.webp', '.png', '.svg', '.mp3', '.mp4', '.m4a', '.woff', '.woff2', '.ttf', '.otf'].includes(ext);
    const cacheControl = isStaticAsset 
      ? 'public, max-age=604800, immutable' 
      : 'no-cache, no-store, must-revalidate';

    // Support HTTP Range requests for instant seeking in audio files
    const range = req.headers.range;
    if (range && (ext === '.mp4' || ext === '.mp3' || ext === '.m4a')) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Accept-Ranges': 'bytes',
      'Cache-Control': cacheControl,
      'Access-Control-Allow-Origin': '*'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[Cảnh báo] Cổng ${PORT} đang bận, tự động thử cổng kế tiếp: ${PORT + 1}...`);
    PORT++;
    setTimeout(() => {
      server.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}/ with full RSVP & Wishes API`);
      });
    }, 300);
  } else {
    console.error('Lỗi khởi động server:', err);
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/ with full RSVP & Wishes API`);
});
