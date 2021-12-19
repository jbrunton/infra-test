FROM node:12-alpine as builder

WORKDIR '/app'

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --no-optional

COPY . .
RUN npm run build

FROM nginx
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
