FROM node:12-alpine
ARG REACT_APP_API_ADDRESS

WORKDIR '/app'

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --no-optional

COPY . .
RUN npm run build
