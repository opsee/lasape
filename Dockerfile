FROM opsee/nginx

MAINTAINER Greg Poirier <greg@opsee.co>

ENV BARTNET_HOST="api-beta.opsee.co"
ENV BARTNET_PORT="80"

RUN mkdir -p /app
COPY robots.txt index.html /app/
RUN mkdir -p /app/public /app/nginx
COPY public /app/public/
COPY nginx /app/nginx/

RUN rm -f /etc/nginx/conf/nginx.conf
RUN ln -s /app/nginx/nginx.conf /etc/nginx/conf/nginx.conf
