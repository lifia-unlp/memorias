FROM ghcr.io/ba-st/pharo-loader:v10.0.1 AS loader
ADD install.st /opt/pharo
RUN ["./pharo", "./Pharo.image", "--save", "--quit", "st", "./install.st"]

FROM ghcr.io/ba-st/pharo:v10.0.1
COPY --from=loader /opt/pharo/Pharo.image /opt/pharo
COPY --from=loader /opt/pharo/Pharo.changes /opt/pharo
COPY --from=loader /opt/pharo/Pharo*.sources /opt/pharo
ADD run.st /opt/pharo

EXPOSE 8080
ENTRYPOINT ["/opt/pharo/pharo", "/opt/pharo/Pharo.image", "--no-quit", "st", "/opt/pharo/run.st" ] 