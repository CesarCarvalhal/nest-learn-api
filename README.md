# Nest Learn Api

## Basic structure

### Api
- Listado de actividades
- Envío de respuestas
- Validación de respuestas
- Datos de usuario

## /rest/activities

The `/rest/activities` endpoint is used to get the list of activities.

### GETS

- **Get all activities**: Returns a list of all activities.
    - `/rest/activities`
- **Get a activity by ID**: Returns a specific activity by ID.
    - `/rest/activities/:id`

### POSTS 

- **Send activity**: Sends the activity.
    - `/rest/activities`

        ```json
        {
            "title": "Title of the activity",
            "description": "Description of the activity",
            "type": "Type of activity",
            "content": "Content of the activity"
        }
        ```
        ```

### PUTS

- **Update activity**: Updates a activity.
    - `/rest/activities/:id`

        ```json
        {
            "title": "New Title",
            "description": "New Description",
            "type": "New Type",
            "content": "New Content"
        }
        ```

### DELETES

- **Delete activity**: Deletes a activity.
    - `/rest/activities/:id`
  