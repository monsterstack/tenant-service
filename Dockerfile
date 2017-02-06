FROM node:boron-wheezy
ADD . /code
WORKDIR /code
RUN npm install
ENTRYPOINT ["bash", "entrypoint.sh"]

CMD ["node", "server", "--announce=true"]
