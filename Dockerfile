FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN npm install --prefix backend && npm install --prefix frontend

COPY . .

RUN npm run build --prefix frontend

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["npm", "--prefix", "backend", "start"]
