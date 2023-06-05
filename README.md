# Nest Learn Api
La API Nest Learn proporciona un conjunto de endpoints para interactuar con la plataforma de aprendizaje.

 
#
### Documentación
La documentación de la API se puede encontrar en Swagger en la siguiente direccion URL:

- [https://vm15.netexlearning.cloud/api](https://vm15.netexlearning.cloud/api)


#
### Requisitos previos
Antes de comenzar a utilizar la Nest Learn Api, asegúrate de tener instaladas las siguientes herramientas y tecnologías:

- Node.js LTS
- npm 
- MongoDB
- Docker

 
#
### Instalación
Sigue estos pasos para instalar y configurar la aplicación Nest Learn:

Clona este repositorio en tu máquina local.

		git clone git@github.com:CesarCarvalhal/nest-learn-api.git
    
Navega hasta el directorio del proyecto e instala las dependencias.
	
		npm install
	
Configura las variables de entorno en un archivo `.env` con la siguiente información:

 
 | Variable        | Detalles                                                                                          |
|-----------------|------------------------------------------------------------------------------------------------------|
| `URL`           | localhost/ |
| `DBNAME`        | LearnDB    |
| `SECRET_KEY`    | secret_key      |
| `CLIENT_ID`     | (Identificador único de la aplicación cliente en Auth0)                                              |
| `CLIENT_SECRET` | (Clave secreta utilizada para autenticar las solicitudes de la aplicación en Auth0)                  |
| `AUDIENCE`      | (Audiencia para la cual se emite un token de acceso en Auth0)                                         |
| `GRANT_TYPE`    | (Tipo de concesión utilizado en el proceso de autenticación y autorización con Auth0)                |
| `OPENAI`        | (Clave o token de acceso para la API de OpenAI)  |


 

Además, asegúrate de tener Docker instalado en tu sistema, y seguir los siguientes pasos.

 
Descarga de la imagen de MongoDB:

		docker pull mongo
		
Crea un contenedor de MongoDB:

		 docker run --name mongo-learn -p 27017:27017 -d mongo

Verifica el estado del contenedor:

		sudo docker ps
		
Copia la carpeta con los archivos de actividades y cursos a la carpeta del contenedor:

		sudo docker cp ruta_carpeta_mongo-api/. CONTAINER_ID:/data/db/

Restaura la base de datos:

		sudo docker exec -it CONTAINER_ID mongorestore --db LearnDB /data/db/
		
Inicia la aplicación ejecutando el comando:

		npm run start
		
El swagger estará disponible en `http://localhost:3001/api`.

 

#
### Uso
La API Nest Learn ofrece los siguientes endpoints principales:


#### Usuarios
- `PATCH /users/update-nickname`: Actualizar nickname del usuario autenticado.
- `GET /users/roles`: Obtener roles del usuario autenticado.


#### Actividades
- `GET /rest/activities`: Obtener todas las actividades.
- `POST /rest/activities`: Crear actividad.
- `GET /rest/activities/{id}`: Obtener actividad por ID.
- `PUT /rest/activities/{id}`: Actualizar actividad.
- `DELETE /rest/activities/{id}`: Eliminar actividad.
- `GET /rest/activities/{id}/viewers`: Obtener usuarios que han visto la actividad.
- `GET /rest/activities/user/{id}`: Obtener actividades vistas por un usuario.
- `POST /rest/activities/{id}/view`: Marcar actividad como vista.
- `PATCH /rest/activities/answer/{id}`: Verificar la respuesta de un estudiante a la actividad.


#### Cursos
- `POST /rest/courses`: Crear curso.
- `GET /rest/courses`: Obtener todos los cursos.
- `POST /rest/courses/{courseId}/activities/{activityId}`: Añadir actividad a un curso.
- `DELETE /rest/courses/{courseId}/activities/{activityId}`: Eliminar actividad de un curso.
- `GET /rest/courses/{id}`: Obtener curso por ID.
- `PUT /rest/courses/{id}`: Actualizar curso por ID.
- `DELETE /rest/courses/{id}`: Eliminar curso por ID.
- `GET /rest/courses/{id}/activities`: Obtener todas las actividades de un curso.

 

Consulta la documentación completa de la API en Swagger para obtener más detalles sobre cada endpoint y sus respectivas solicitudes y respuestas.
