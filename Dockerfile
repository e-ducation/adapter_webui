FROM nginx:latest

COPY ./src /usr/share/nginx/html
COPY ./adapter.conf /etc/nginx/conf.d/default.conf