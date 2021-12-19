FROM node:12-alpine as builder
ARG REACT_APP_API_ADDRESS

WORKDIR '/app'

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --no-optional

COPY . .
RUN REACT_APP_API_ADDRESS=${REACT_APP_API_ADDRESS} npm run build

FROM nginx
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
