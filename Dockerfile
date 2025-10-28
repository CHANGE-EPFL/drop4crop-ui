FROM node:25.0.0-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy all files and build
COPY . .
RUN yarn build

# Final stage: Use custom Nginx configuration
FROM nginx:1.27.4-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Write custom Nginx configuration using a heredoc
RUN cat <<EOF > /etc/nginx/conf.d/default.conf
    server {
        listen       80;
        server_name  localhost;
        root   /usr/share/nginx/html;
        index  index.html;

        # For any route, try to serve a file; if not found, serve index.html
        location / {
            try_files \$uri \$uri/ /index.html;
        }
    }
EOF

# Copy build output to Nginx public folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

