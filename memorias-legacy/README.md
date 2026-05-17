# Memorias

Sistema de registro de publicaciones, proyectos, becas, y dirección de recursos humanos de investigación, que simplifica la generación de reportes y su publicación en la web.

La imagen docker se encuentra disponible como [cientopolis/memorias](https://hub.docker.com/repository/docker/cientopolis/memorias)

Para construir desde los fuentes, en una imagen Pharo 8.0 evalue la siguiente expresión.

```Smalltalk
Metacello new
	baseline: 'Lifiometro';
	repository: 'github://lifia-unlp/memorias:main';
	onConflictUseLoaded;
	onWarningLog;
	load.
```
  

