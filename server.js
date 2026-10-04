import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

const CONFIG = {
    API_URL: process.env.VERCEL_API_URL || 'https://api.vercel.com/v1/registrar/domains/search',
    TOKEN: process.env.VERCEL_TOKEN
};

if (!CONFIG.TOKEN) {
    console.error("❌ ERROR: VERCEL_TOKEN tidak ditemukan di environment variables (.env)!");
    process.exit(1);
}

const EXTS = [".dev", ".app", ".tech", ".online", ".store", ".site"];

// Mengaktifkan CORS agar bisa diakses dari frontend mana pun
app.use('/*', cors());

// Halaman utama API (Root Endpoint)
app.get('/', (c) => {
    return c.json({
        status: "success",
        message: "Cek Domain API berjalan dengan baik 🚀",
        usage: "Gunakan endpoint GET https://cekdomain.duniakedol.store/api/check?domain=namadomain"
    });
});

app.get('/api/check', async (c) => {
    const baseDomain = c.req.query('domain');

    if (!baseDomain) {
        return c.json({ error: "Parameter 'domain' wajib diisi. Contoh: /api/check?domain=namakeren" }, 400);
    }

    const cleanBase = baseDomain.split('.')[0];
    const targetDomains = EXTS.map(ext => `${cleanBase}${ext}`);

    try {
        // Bun memiliki native fetch yang sangat cepat, jadi kita tidak perlu menginstal Axios lagi
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ domains: targetDomains })
        });

        const data = await response.json();
        const results = data.domains || data.results || [];

        // Filter hanya yang tersedia dan bukan premium
        const availableDomains = results.filter(d => d.available === true && d.premium === false);

        return c.json(availableDomains);
    } catch (error) {
        return c.json({ error: error.message }, 500);
    }
});

app.notFound((c) => {
    return c.json({ error: "Endpoint tidak ditemukan. Gunakan GET /api/check?domain=namadomain" }, 404);
});

const port = 3111;

console.log(`\x1b[92m✔ Server Hono (Bun native) berjalan dengan baik!\x1b[0m`);
console.log(`\x1b[94mℹ API Anda dapat diakses di:\x1b[0m https://cekdomain.duniakedol.store (atau http://localhost:${port} untuk testing)`);

export default {
    port: port,
    hostname: '0.0.0.0', // Buka akses untuk Docker & Cloudflare Tunnel
    fetch: app.fetch
};
