FROM node:4-onbuild
# replace this with your application's default port
EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080
