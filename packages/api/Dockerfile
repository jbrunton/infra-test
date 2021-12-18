FROM node:alpine

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --no-optional

COPY . .

CMD ["npm", "run", "start"]
