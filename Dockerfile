# 1. Start with a lightweight Linux image with Node.js 20 pre-installed
FROM node:20-alpine

# 2. Create and move into the app folder inside the container
WORKDIR /app

# 3. Copy package files and Prisma schema first
COPY package*.json ./
COPY prisma ./prisma/

# 4. Install dependencies and generate the Prisma client
RUN npm install
RUN npx prisma generate

# 5. Copy the rest of your Transit Abuja source code
COPY . .

# 6. Build the production Next.js app
RUN npm run build

# 7. Expose Port 3000 and start the server
EXPOSE 3000
CMD ["npm", "start"]
