FROM requestly/private-images:backend-config-latest

ARG PORT
ARG ENV

ENV PORT ${PORT}
ENV ENV ${ENV}
ENV CERT_PATH "/usr/src/certfiles2"
ENV NODE_ENV "PRODUCTION"

WORKDIR /usr/src/app
COPY ./app/ .
RUN cp -r /usr/src/secrets ./src/configs
EXPOSE ${PORT}
RUN npm install
ENTRYPOINT npm start
