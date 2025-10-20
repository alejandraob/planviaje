# Reglas
### DOCUMENTACIÓN

* **PHP:** PHPDoc obligatorio en todas las clases y métodos
* **JS:** JSDoc obligatorio en todas las funciones (`@param`, `@returns`, `@throws`)
* Actualizar README para nuevas features
* Comentar la lógica de negocio compleja

### PRINCIPIOS DE DESARROLLO

* Escribir código mínimo viable
* No realizar cambios no relacionados
* No romper funcionalidad existente
* Mantener código modular y testeable
* Fallar rápido con mensajes de error claros

### PRÁCTICAS GIT

* Commits descriptivos y concisos
* Un cambio lógico por commit
* Testear antes de hacer commit

### TESTING INTEGRADO

* **Backend Tests:** Interfaz web para ejecutar tests
* **Cobertura:** Tests unitarios para modelos y controladores
* **API Testing:** Validación de endpoints y respuestas
* **Reportes:** Resultados visuales con métricas


## SEGURIDAD Y BUENAS PRÁCTICAS

* **Variables de entorno** para configuración sensible
* **Prepared statements** obligatorios para consultas SQL
* **Validación** de inputs en frontend y backend
* **Sanitización** de datos antes de procesamiento
* **CORS** configurado correctamente para el frontend
* **Rate limiting** en endpoints críticos
* **Logs de seguridad** para auditoría
* Charset `utf8mb4` en conexiones MySQL

---

## TESTING FRAMEWORK

### Interfaz Web de Testing
* Dashboard visual para ejecutar tests
* Resultados en tiempo real con colores
* Métricas de cobertura por módulo
* Historial de ejecuciones
* Exportación de reportes


## MANEJO DE ERRORES Y LOGS

* **Backend:** JSON estructurado con códigos de error
* **Frontend:** Mensajes user-friendly sin información técnica
* **Logs:** Archivo `/logs/log.txt` con rotación automática
* **Debugging:** Modo desarrollo con detalles adicionales

### Formato de Logs
```
[2024-10-14 15:30:45] INFO - Usuario admin@example.com ha iniciado sesión
[2024-10-14 15:31:02] ERROR - Fallo en conexión a BD: Connection timeout
[2024-10-14 15:31:15] WARN - Intento de acceso no autorizado desde IP: 192.168.1.100
```
