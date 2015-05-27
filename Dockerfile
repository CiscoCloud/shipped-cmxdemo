FROM google/nodejs
EXPOSE 3000
WORKDIR /app
COPY . /app
RUN ["/app/bin/build"]
CMD ["node", "server"]

