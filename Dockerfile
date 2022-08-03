FROM node:13-alpine3.10
RUN mkdir -p /home/broomsticks
COPY . /home/broomsticks
WORKDIR /home/broomsticks
RUN npm install
CMD ["npm", "start"] 