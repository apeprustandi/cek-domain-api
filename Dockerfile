# Menggunakan image resmi Bun yang ringan
FROM oven/bun:1-alpine as base
WORKDIR /usr/src/app

# Copy file konfigurasi package (jangan copy node_modules)
COPY package.json bun.lockb* ./

# Install dependencies menggunakan bun
RUN bun install --production

# Menyalin seluruh kode (server.js, dll)
COPY . .

# Ekspos port yang digunakan aplikasi
EXPOSE 3000

# Menjalankan server sebagai user non-root (lebih aman)
USER bun
ENTRYPOINT [ "bun", "run", "server.js" ]
