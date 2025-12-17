# frontend/Dockerfile

# 1. Node.js imajını kullan
FROM node:22-alpine

# 2. Çalışma dizinini ayarla
WORKDIR /app

# 3. Paket listesini kopyala ve yükle
COPY package*.json ./
RUN npm install

# 4. Tüm kodları kopyala
COPY . .

# 5. Vite sunucusunu başlat
# --host parametresi Docker dışından erişim için şarttır
CMD ["npm", "run", "dev", "--", "--host"]