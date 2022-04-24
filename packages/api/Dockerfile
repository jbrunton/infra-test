FROM node:12-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --no-optional

COPY . .

CMD ["./start.sh"]
