FROM casco/pharo:8.0
USER root
EXPOSE 8080
ADD install.st /opt/pharo
ADD run.st /opt/pharo
WORKDIR /opt/pharo
RUN ["./pharo", "./Pharo.image", "--save", "--quit", "st", "./install.st"]
RUN rm -Rf pharo-local && rm *.sources && rm Pharo.changes
# use -v /folder/in/host:/opt/pharo/data to mount your data here
ENTRYPOINT ["/opt/pharo/pharo", "/opt/pharo/Pharo.image", "--no-quit", "st", "/opt/pharo/run.st" ] 