FROM node:22.3.0-alpine AS builder

# Set the working directory in the container
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

# Copy the rest of your application source code to the container
COPY . .
RUN yarn build

FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
# Expose the port your application will listen on (if applicable)
EXPOSE 80

# Start your Yarn application
CMD ["nginx", "-g", "daemon off;"]
