FROM node:latest
WORKDIR /app
COPY . .
RUN yarn install 
RUN yarn build
EXPOSE 8001
CMD ["yarn","prod"]