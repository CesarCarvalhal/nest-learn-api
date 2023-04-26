FROM node:14

WORKDIR /app
COPY . .
RUN npm install

EXPOSE 3001

ENV URL=mongo/
ENV DBNAME=LearnDB
ENV SECRET_KEY=secret_key
ENV CLIENT_ID=sM1FUwRYAZMMOQGCggfsC1Ju9NGbDUIK
ENV CLIENT_SECRET=929dNFK0gT04rc9RWQpE51VclAqwn3YmixJB9rspo3BO3uipHpDzAuWosJYEh_fR
ENV AUDIENCE=https://fct-netex.eu.auth0.com/api/v2/
ENV GRANT_TYPE=client_credentials

CMD ["npm", "run", "start"]