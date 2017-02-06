FROM node:boron-wheezy
ADD . /code
WORKDIR /code
RUN npm install
CMD ["node", "server", "--announce=true"]
