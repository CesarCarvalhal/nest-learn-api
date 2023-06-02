# Nest Learn Api

 

API para la plataforma de aprendizaje Nest Learn.

 

### Descripción

 

La API Nest Learn proporciona un conjunto de endpoints para interactuar con la plataforma de aprendizaje.

 

### Documentación
La documentación de la API se puede encontrar en Swagger en las siguientes direcciones URL:

 

- [https://vm15.netexlearning.cloud/api](https://vm15.netexlearning.cloud/api)
- [https://vm15.netexlearning.cloud/api-json](https://vm15.netexlearning.cloud/api-json)

 

### Requisitos previos

 

Antes de comenzar a utilizar la API Nest Learn, asegúrate de tener instaladas las siguientes herramientas y tecnologías:

 

- Node.js LTS
- npm 
- MongoDB
- Docker

 

### Instalación

 

Sigue estos pasos para instalar y configurar la aplicación Nest Learn:

 

1. Clona este repositorio en tu máquina local.
2. Navega hasta el directorio del proyecto.
3. Ejecuta el comando `npm install` para instalar las dependencias.
4. Configura las variables de entorno en un archivo `.env` con la siguiente información:

 

- URL=
- DBNAME=
- SECRET_KEY=
- CLIENT_ID=
- CLIENT_SECRET=
- AUDIENCE=
- GRANT_TYPE=
- OPENAI=

 

Además, asegúrate de tener Docker instalado en tu sistema, y seguir los siguientes pasos.

 

1. docker pull mongo
2. docker run --name mongo-learn -p 27017:27017 -d mongo
3. sudo docker ps
4. sudo docker cp ruta_carpeta_mongo-api/. CONTAINER_ID:/data/db/
5. sudo docker exec -it CONTAINER_ID mongorestore --db LearnDB /data/db/
6. Inicia la aplicación ejecutando el comando `npm run start`.
7. El swagger estará disponible en `http://localhost:3001/api`.

 


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
