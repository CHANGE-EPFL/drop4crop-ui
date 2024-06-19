FROM node:22.3.0-alpine as builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

FROM nginx:1.27-alpine as runner

COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80

# Start application
CMD ["nginx", "-g", "daemon off;"]
