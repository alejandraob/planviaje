
# Generar una app de viaje
- Idea Que ayude a la organización de logistica de actividades y alojamientos, ademas gestion de finanzas individual y compartidas.
- Objetivo: Diseñar el blueprint funcional y la interfaz (UI/UX) de una aplicación web y móvil llamada "Plan Viaje" para organizar un viaje individual o en grupo de amigos/familia y pueda utilizarse nacional o internacional (por ahora pais Argentina y Chile)
- Idea de Negocio
* Usuario: una persona se registra, y crea un nuevo evento, que le consultará si es un viaje en familia, con amigos o solo, seleccionara y le asignara un nombre, que se llamara por ejemplo viaje en familia, el paso siguiente es en solicitar a los miembros que estaran incluidos al viaje, aqui deberia poder tener acceso a la agenda de telefono para que a los usuarios le llegue una invitacion y puedan usar la app; si no tiene el telefono, deberá poder asignar un mail. En caso que no quiera hacerlo en el momento poner omitir. El usuario primario queda el como administrador pero le puede asignar a otros miembros que puedan ser administrador. 
Rol administador, pueden agregar, editar o eliminar cronograma, lugares de estadia. Tanto el administrador como los otros pueden hacer uso de las finanzas.
Hay que considerar que puede existir menores de edad 0 a 18 años, por lo que se deberia asignar que es menor y selecionar quien es el responsable. Igualmente puede hacer uso de la app para que pueda aprender de sus finanzas y sea participe del evento viaje.
Cronograma: crear el cronograma con fecha inicio y fecha fin, poder establecer los días en que se esta en un lugar, por ejemplo un viaje de 15 dias, fecha de inicio 01/01/2026 hasta el 15/01/2026 y la asignacion seria 01/01/2026 al 05/01/2026 Chocon, 05/01/2026 al 10/01/2026 Villa traful, 10/01/2026 al 14/01/2026 Bariloche, 15/01/2026 Regreso Catriel
Cada "franja" podra tener "actividades" por ejemplo 03/01/2026 visita al parque Dinosaurios 
Cada "franja" si es modificada deberia afectar a la subsiguiente, por ejemplo Se extiende estadia en villa traful mi fecha estimada de finalizacion paso hacer el 11/01/2026 por ende el viaje de bariloche se corre automaticamente el inicio al 12/01/2026
Ahora si existe dias intermedios que no estan en una franja asignada este podra restar o no los dias, explicacion un viaje de 20 días, 4 iniciales estan en una franja 05/02/2026 al 08/02/2026 Mehuin chile, 3 de ellos no (9,10, y 11), a partir del 12/02/2026 y los dias restantes es temuco, Me deberia permitir asignar franja tiempo y/o actividad. Por ejemplo 9,10,11,y 12 ya le restaria un dia al subsiguiente ó si coloco 8,9,10 y 11 quito un dia en el antesesor y sucesor de franja.

* Finanzas: cada usuario podra ir registrando su consumo tanto individual como en grupo. Si el viaje es individual no deberia mostrarse ninguna opcion de gastos en grupo. 
Si es un viaje en grupo, este tendria que tener la opcion de un registro de gastos personales, otro en grupo.
Tener como generico el grupo en general y dejar crear sub grupos, por ejemplo si es un viaje de familia 
2 Abuelos, 3 hijos, 2 conyuges y 3nietos,  se crea un grupo filia GomezPerez que cuenta con 1 hijo, 1 conyuge y 2 niños, se crea un grupo GomezPatiño 1 hijo, 1 coyugue y 1 niño. Entonces el gasto que genera el subgrupo  GomezPerez se representa por 1 representando su familia. Ejemplo gasto cena, total 250000 no se divide directamente por 10, sino por 5 (1 abuela, 1 abuelo, 1 hijo, 1 subgrupo, 2 subgrupo) Los subgrupos pagan el total por sus integrantes entonces Abuela 25000, abuelo 25000, hijo 25000, subgrupo 1 $100000, subgrupo2 $8333.33
Si es un viaje internacional, tener la columna de pesos arg, pesos chilenos y dolares para saber el costo, ejemplo estoy en el inicio del viaje y todavia estoy en arg y debo registrar el gasto de nafta, este debe quedarme con la plata arg 45mil pesos, columna chile y dolar no debe aparecer nada, ahora estoy en chile, cargo 15mil pedos chilenos por comida, me debe aparecer el valor estimativo en pesos arg, el precio de chile y el valor estimativo en dolares.
Si el viaje en grupo, en el grupo general, por ejemplo son 5 personas (Ana, maria, lau, xime y andrea) paga Ana 37800, al restro del grupo le debe aparecer el monto a pagar a Ana,
Lo mismo si es grupo general con sub grupo, el responsable del subgrupo debe pagar a quien gestiono el pago.
La persona que gestiono el pago tiene la posibilidad de ver quien le pago y que pago.
Tener registro de lo consumido tanto individual, en grupo grl y subgrupo

* Alojamientos: 
Para no estar rebuscando en las paginas externas, se crea card donde uno pondra el enlace por ejemplo booking, con el alojamiento reservado, asignar fecha y hora de ingreso y egreso, si esta pagado, si se paga en el lugar, monto total de reserva y quien gestiono reserva, para que se pueda registrar en finanzas el pago de alojamiento y el pendiente de pago a la persona que reservo. Además en caso de ser un alojamiento internacional, se debra proporcionar monto en valor arg, y visualizar su valor en pesos chilenos y en dolares (osea poder ver los 3 valores)



* Clarificar varios puntos críticos para asegurar que el blueprint sea sólido. Dudas por secciones:

# Gestión de Usuarios y Roles
- 1 Menores de edad y permisos: Un menor (0-18 años) con responsable asignado, ¿puede el menor ver gastos ajenos o solo los suyos y los del grupo? ¿El responsable tiene acceso total a los datos financieros del menor o también está limitado?
- Administrador secundario: Si hay múltiples administradores, ¿hay un nivel jerárquico (admin principal y admin secundario) o todos los admins tienen permisos iguales? ¿Un admin puede remover a otro admin?
- 2 Invitaciones rechazadas: Si alguien rechaza la invitación o se retira del viaje, ¿sus gastos previos quedan registrados? ¿Cómo se redistribuyen sus deudas?
# Cronograma y Franjas
 - 3 Cascada de cambios: Cuando extiedo una franja, ¿se recalculan automáticamente TODAS las actividades de las franjas subsiguientes? Por ejemplo, si muevo una actividad de fecha porque se corrió su franja, ¿se notifica a los usuarios?
 - 4 Días intermedios sin franja: En tu ejemplo (9, 10, 11 sin asignar), ¿estos días "flotantes" aparecen en la vista del cronograma como un estado especial? ¿El usuario puede hacer actividades en esos días incluso sin franja?
 - 5 Edición retrospectiva: ¿Se puede editar el cronograma una vez iniciado el viaje? ¿Si cambio una fecha pasada, afecta el cálculo de gastos de esos días?
# Finanzas - Lógica Crítica
- 6 Grupos y Subgrupos - Divisiones: En tu ejemplo de la cena (250k), veo que cada subgrupo paga "por sus integrantes". ¿Esto significa que un subgrupo es tratado como UNA entidad en el cálculo? Entonces si el subgrupo GomezPerez tiene 4 personas, ¿el cálculo es: total / número de entidades (5) y luego ese monto se divide internamente entre las 4 personas del subgrupo?
- 7 Gastos dentro de subgrupos: Si un gasto se registra dentro del subgrupo GomezPerez, ¿ese gasto NO se divide con el grupo general? ¿O hay un mecanismo para marcar gastos como "subgrupo privado" vs "compartible con grupo general"?
- 8 Conversión de monedas: ¿Tienes una API o servicio definido para los tipos de cambio (ARS → CLP, ARS → USD)? ¿Se usa tipo de cambio oficial, paralelo o promedio? ¿Se recalcula diariamente o es fijo por viaje?
- 9 Deudas encadenadas: Si Ana paga 37.800 y el grupo debe pagarle, pero también hay un subgrupo que debe pagar al grupo general, ¿cómo se resuelven esas deudas? ¿Un único "liquidación final" o pagos progresivos?
# Alojamientos
- 10 Vinculación con finanzas: Cuando registro un alojamiento "pagado en el lugar", ¿ese monto aparece automáticamente como gasto en la sección de finanzas o debo registrarlo manualmente?
- 11 Múltiples alojamientos: Si hay 3 alojamientos en el viaje y uno es en Argentina (solo pesos), uno en Chile (3 columnas) y otro mixto, ¿la interfaz debe ser sensible a esto o siempre muestro las 3 columnas?
# Arquitectura y Datos
- 12 Persistencia de cambios: Cuando se modifica una franja, ¿necesito un sistema de "historial/auditoría"? ¿Los usuarios deben ver qué cambió y quién lo cambió?
- 13 Sincronización offline: ¿La app debe funcionar offline y sincronizar luego? ¿O es siempre online?
- 14 Notificaciones: Cuando hay cambios en cronograma, nuevos gastos, o deudas pendientes, ¿todos los miembros deben ser notificados? ¿Por qué canales (push, email, in-app)?

### Respondiendo preguntas
- 1- Solo puede ver los suyos y grupo familiar. El familiar a cargo debe ver todo lo que el menor registra.
- 2-Debe existir dos administradores principal y secundario, el secundario no podra eliminar el evento del viaje y no podrá eliminar el administrador principal, pero si el principal puede eliminar un admi secundario (quitar rol), me gusta como tiene la app whatsapp que si el administrador se va del grupo, asigna otro participante como administrador, en este caso si el administador principal se va, de los administradores secundarios queda asignado como principal.
- 3-Suponiendo que todavia no hay ningun registro de alojamiento y gasto, y solo se cae un viajero, no pasa nada, se elimina por completo. Ahora armo el viaje hoy 15/10 y agrego 5 compañeros, el 17/10 ingreso el alojamiento, tengo caso 1: si el alojamiento se marco como se paga en el sitio y el viaje es para 05/04/2026, y un compañero se baja el 11/11/2025, la "deuda" se reorganiza para los que quedan, no se cobra nada al que se bajo y se elimina el registro de esa persona. En caso 2: Misma situacion que opcion 1 pero la diferencia es que Dario pago por todos el mismo 17/10 y Jaime se baja el 11/11, Dario debera devolver la plata a Jaime y dividir la cuota que habia pagado jaime por el resto de los viajantes; debiendo aparecer como un plus o algo indicativo. Ahora suponiendo que exista una opcion 3 de que el viaje siga en curso, se agregaron los alojamientos, se compraron entradas anticipadas, pasajes y ya se esta en el viaje 08/04/2026 y por inconvenientes Maria se debe regresar a su casa, Maria tendra que pagar por lo consumido y por lo que no alcanzo a consumir dejar una opcion de pausa porque la solucion puede ser arreglada por fuera del sistema ya aqui no le podemos obligar a pagar o omitir su pago pago haciendo que el resto se haga cargo, ya que cada uno viaja con un presupuesto estipulado.
- 4-Si, y si hay una franja y un espacio no asignado, tambien se deben correr
- 5-Si, el estado puede ser sin asignacion y si puede agregar actividades que se hagan ahi
- 6-Si se puede modificar ya iniciado el viaje, pero solo a futuro si tengo una semana y recien voy el primer dia, puedo modificar del 2dia para adelante
- 7-No entendi lo consultado, hazlo un poco mas simple
- 8-Se debria poder seleccionar como gasto del sub grupo como privado y otra compartible. Igualmente podemos hablar mas de esto porque esta medio confuso.
- 9-No tengo una api, si no es dificil se deberia integrar, sino permitir un ingreso manual en que pueda ser modificable en cualquier momento y tomar el dolar tarjeta como ref
- 10-Haber si entendi la pregunta, ANa es parte del grupo general y paga ella los 37800,  laura, Xenia y La Famillia Ruiz (subgrupo que son Jorge, Diego y lucas ), internamente se dividira por 6, pero la famial ruiz representa el pago *3, Laura, Xenia y la familia ruiz le pagaran a ana de manera inmediata o por cuotas. Ahora supongamos que la familia ruiz don 3 hermanos, Jorge es quien representa y hace el pago por los 3, pero pueden generar como subgrupo su propio gasto interno de ellos para determinar si diego y lucas le pagaron a jorge su cuota de los 37800 que le correspondia pagar.
- 11-Debe aparecer en finanzas pero deshabilitado la opcion a pagar a quien haga el pago
- 12-Si es un viaje internacional siempre deben estar las 3 columnas los campos que no se llenen poner un guion medio (-), Si es nacional solo debe mostrar la moneda arg
- 13-SI a todas las preguntas
- 14-deberia funcionar offline y sincronizar despues
- 15-Los administradores deben seleccionar si el mensaje es para todos los miembros o solo para algunos, lo mismo que si le llega un mail o notificacion al telefono o wspp
- 16-Simultaneamente
- 18-No entendi de Arg y Chile, por ahora solo sera probado por una fraccion de personas y seran de argentina, pero el logueo puede ser por facebook, google o numero de telefono

Hay mas preguntas? aclaramos los puntos que me quedaron a mi con dudas que no supe responder?


* Clarificaciones
- 1 - Sobre Retiros y Reembolsos (punto 3)

-  En el Caso 2 (Dario pagó todo el 17/10, Jaime se baja el 11/11): Cuando Dario recibe el reembolso de Jaime, ¿ese dinero se distribuye automáticamente entre los restantes o Dario lo recibe y luego debe redistribuir manualmente? ¿O queda como un "crédito pendiente de distribución" visible en finanzas?
-  En el Caso 3 (viaje en curso, Maria se pausa): ¿Maria sigue siendo miembro del grupo para futuras decisiones/votaciones o queda como "pausada" sin permisos? ¿Su estado aparece diferente en la lista de miembros?

- 2 - Sobre Gastos de Subgrupos (punto 8)

Aclaraste bien. Entonces un gasto del subgrupo "Familia Ruiz" puede tener dos etiquetas:
Privado: Solo se divide entre Jorge, Diego y Lucas
Compartible: Se incluye en la división general con Ana, Laura, Xenia y la Familia Ruiz (como entidad)
¿Correcto? ¿Y un gasto puede cambiar de etiqueta después de crearse o es inmutable?

- 3 - Sobre Conversión de Monedas (punto 9)

Entonces la estrategia es:
Opción A: Integrar API de tipos de cambio (ej: ExchangeRate-API, xe.com) si no es complicado
Opción B: Si no se integra, formulario manual donde ingreso el valor del dólar y CLP, y eso queda fijo para todo el viaje
¿Prefieres intentar A primero y fallback a B? ¿O directo B por simplicidad?

- 4 -Sobre Modificación Futura del Cronograma (punto 6)

Confirmando: Si estoy el día 1 de un viaje de 7 días, puedo modificar días 2-7, pero NO puedo tocar el día 1 (pasado). ¿Esto aplica también a actividades? (ej: no puedo modificar actividad del día 1 si ya pasó)


- 5 -Sobre Comunicaciones (punto 15)
Los admins seleccionan destinatarios + canal (Mail, WhatsApp, Push). ¿Hay un contenido por defecto o cada mensaje es completamente personalizado? ¿Y si un miembro desactiva notificaciones, ¿se respeta o fuerzo envío de mails?

-  6- Sobre Firebase vs PostgreSQL (punto 17)

Firebase simplifica bastante la autenticación y sincronización offline. Mi recomendación:
Realtime Database o Firestore para la app (sincronización automática offline + online)
PostgreSQL si quieres más control para reportes/analytics futuros
¿Prefieres uno, o un híbrido (Firebase para la app + PostgreSQL como respaldo)?

- 7 -Sobre Login por Teléfono (punto 18)

¿El login por teléfono es con SMS (one-time code) o con WhatsApp? ¿Y cómo se vincula el teléfono con la invitación al viaje? (ej: agendo a +54 9 11 2345 6789 desde mis contactos)
Puntos que TÚ dejaste sin responder (revisa tus mensajes)
Historial/Auditoría: ¿Necesitas que los usuarios vean "qué cambió y quién lo cambió" en el cronograma, o solo ves los cambios aplicados?
Notificación de cambios en cascada: Si extiendo una franja y se corre todo lo demás, ¿se notifica a todos o es silencioso?
Eliminación de actividades: Si elimino una actividad, ¿afecta algo en finanzas o cronograma?
Dudas Mías de Arquitectura

- 8 - Estructura de Subgrupos: Un usuario puede estar en:
El grupo general + 1 subgrupo (familia)
El grupo general + múltiples subgrupos (familia + amigos cercanos)
¿O es solo 1 subgrupo máximo por usuario?

- 9- Gastos antes de definir subgrupos: Si ingreso un gasto grupal el 17/10 (sin subgrupos creados), y luego el 18/10 creo los subgrupos, ¿ese gasto debe redistribuirse según los nuevos subgrupos o queda con la división antigua?
Reportes finales: Al terminar el viaje, ¿necesitas un reporte PDF/Excel de gastos, deudas y quién pagó a quién?
Responde estos últimos puntos y ya arrancamos con el diagrama de datos y flujo visual. ¿Dale?

Respondiendo: 
- 1- No esta mal, Jaime le pago a Dario su parte del alojamiento, Jaime se baja, por lo tanto Dario debe devolver el pago a Jaime, pero la cuota de jaime debe ser pagada, esto implica que la cuota de los demas asumira la fraccion de la cuota que dejo jaime, quedo mas claro?
- - Queda inhabilitada para todo lo restante. Y solo debe aparecer visible para los registros de informes, no para asignarla en actividades, gastos, etc.
- - Dame un ejemplo de lo que vos consideras una posibilidad de cambio y lo analizamos: lo demas esta bien.
- - Las dos al mismo tiempo, si no funciona A se elimina, pero ya nos queda B implementado
- - Las actividades si se pueden modificar siendo el dia 1
- - Un mensaje por defecto dependiendo de lo que se notifica, como Pagar Alojamiento, un mensaje Hey! ya hay que pagar el alojamiento! o algo asi; Si desactivanotificacions, enviar por mail
- - Uno hibrido
- - En el tema de invitacion, debe ser un mensaje hey registre tal viaje, accede a este link (que tendra el id del viaje en cuestion) para abrir el programa y este pueda crear su usuario y ver ya su viaje, tomando aquí como ref wspp, cuando armas un grupo te muestra tu agenda de contactos, por lo tanto deberia creo y si no me equivoco una api que me solicite el acceso a mi agenda del telefono. Ahora one-time code es cuando te manda un codigo y vos lo ingresas y logea?? si es así si
- - Solo los administrativos, el que cambio y quien, lo demas los cambios aplicados
- -Se debe notifica a todos
- - Depende, si una actividad gratuita no afecta a finanzas, si implica un costo pero, esa actividad se suspende por clima y la traspasan dia, se modifica dia, tambien hay que considerar si es paga pero todavia no se registra el pago solo esta el valor de referencia se podra eliminar, ahora fue pagada y no van por x motivo, el gasto se asume como perdida y no puede ser eliminado.
- - grupo general + múltiples subgrupos
- - Si

Fui mas clara? te surgieron mas preguntas?

# Últimos Puntos
* Sobre cambio de etiqueta en gastos (21)

Tu pregunta me pidió ejemplo. Aquí va:

Escenario: Creo un gasto "Cena familia Ruiz" por $5000, marcado como Privado (solo Jorge, Diego, Lucas pagan). Después me arrepiento y quiero que sea Compartible (todos pagan).

¿Esto debe permitirse y recalcular automáticamente todas las deudas, o una vez creado el gasto es inmutable en ese aspecto?

* Sobre gestión de actividades pagadas no consumidas (29)

Quedó clara la lógica. Pero tengo una duda operativa:

¿Hay un "estado" de actividad? Tipo:

Programada (solo valor ref, no pagada)
Pagada (dinero real salió)
Suspendida (por clima, etc)
Completada (sucedió)
Cancelada (pagada pero no fue)
¿O simplemente es binario: Pagada/No Pagada?

* Sobre Sincronización Offline (14 + 23)

Cuando funciona offline:

¿Puedo editar un gasto, una actividad, un cronograma estando sin conexión?
¿Qué pasa si 2 usuarios editan lo mismo offline y luego se sincronizan? (conflicto de versiones)
Sobre Invitación por WhatsApp + Contactos (26)

Entendí. Entonces el flujo es:

Admin crea viaje y selecciona contactos de su agenda
Se envía un mensaje WhatsApp con link + ID del viaje
El contacto hace clic → abre la app → registra usuario → ve el viaje ya asignado

* Preguntas:

Si el contacto hace clic pero NO tiene la app instalada, ¿lo redirijo a descargar?
El link es tipo: miapp.com/viaje/abc123defxyz?
¿Y si invito por mail? ¿El flujo es igual o diferente?
Sobre reportes finales (32)

¿Necesitas:

PDF/Excel descargable con resumen de gastos?
Pantalla de "Resumen Final" dentro de la app que muestre quién debe pagar a quién?
Ambos?
Nueva pregunta que se me ocurre:

Límites y restricciones:
¿Máximo de miembros por viaje?
¿Máximo de subgrupos por viaje?
¿Máximo de franjas de alojamiento?
¿Duración máxima del viaje?
Permisos de menores: Un menor de 15 años, ¿puede crear gastos sin aprobación del responsable o crea libremente y el responsable solo ve?
Validaciones: ¿Se puede crear un viaje con fecha inicio = fecha fin (viaje de 1 día)? ¿O mínimo 2 días?
Con esto cerramos. Luego vamos directo al diagrama de datos (ERD), casos de uso, y wireframes/mockups de la UI.

¿Responden estas últimas?

# Respondiendo:
Escenario: Creo un gasto "Cena familia Ruiz" por $5000, marcado como Privado (solo Jorge, Diego, Lucas pagan). Después me arrepiento y quiero que sea Compartible (todos pagan).
¿Esto debe permitirse y recalcular automáticamente todas las deudas, o una vez creado el gasto es inmutable en ese aspecto?
Si yo no estuve en esa cena, no, aunque analisando tu punto, podriamos considerar un rechazo o desconozco gasto, o la posibilidad de que si pueda cambiar en todos en un un plazo de una hora desde la creacion del gasto. Pero generalmente los gastos de ese tipo se van anotando después del hecho, por ejemplo si vamos a una cena vos y yo, no lo anotamos cena claude y ale por 5mil(a no ser que puedas editar el monto posterior, pero no seria recomendado porque es mas facil el olvido de huu y esto cuanto era), porque vos y yo no sabemos que vamos a comer y si sera 5mil, se sabe despues que recibis el ticket dela comida y ahi es bueno vamos a media? o cada uno paga lo que consumio? y se regista cena de claude y ale total 17mil, pago ale, claude le debe 8mil, claude marca pago realizado
Entonces Entonces aqui, el concepto es que tipo de gasto es, porque si es algo comida, generalmente son los miembros presentes, si empezaron solo Jorge, Diego, Lucas a comer y los 5 minutos cayo maria, ahi deben crear un gasto de familia ruiz + maria
Ahora si son entradas que por conveniencia se compran anticipadamente se asume que es un gasto general de todos o de los que quieran ir, entonces aqui podemos tener un caso de  Se compran antes del viaje entradas para el zoo pero el registro es solo para Ana, Laura y Xenia a los chicos no les intereso, ese costo lo pagan las chicas, ahora llegado el momento de ir al zoo los Ruiz deciden ir, ellos compran su entrada y registran su gasto como familia como decidan hacerlo, pero no se debe considerar de modificar el registro de gasto de las chicas para incorporar el de los ruiz. Me doy a entender? EL otro caso puede ser que ahi en el mismo momento estan todos los 6 y se les ocurrio ir a un camping y ahi cada uno pago lo suyo no hubo uno del grupo que pago por los 6 y lo demas le dieron el valor de la entrada al quien pago. entonces aqui vas a tener que guardar 6 registros que pertenecen a cada miembro del viaje con el nombre que deseen de ticket camping, campig re careta, lo que sea. Avisame si requeris que profundicemos mas en esto con ejemplos.
-Sobre gestión de actividades pagadas no consumidas (29); sí, es un estado por actividad
-Sobre Sincronización Offline (14 + 23); Pueden visualizar, pero no podran editar o ingresar gastos.
-Sobre Invitación por WhatsApp + Contactos (26); Si no tiene la app se re dirije para descargar y el link esta bien, podriamos ponerle un token y si es por mail debe ser igual excepto que si abrio el correo en la computadora le ofrezca ir a la web y no descargar la app, osea bajarla despues
-Sobre reportes finales; me gustan ambos
33-Máximo de miembros por viaje: 30, Máximo de subgrupos por viaje:30, Máximo de franjas de alojamiento: sin (se desconoce cuantas franjas, capas que cada dos dias me estoy moviendo), Duración máxima del viaje: 1 año
34-crea libremente, la restriccion sera fisica en donde el niño ya no tenga plata y no pueda seguir registrando sus gastos
35-Si, puede ser de 1 dia

Como estamos con estas respuestas? hay mas para despejar?

Excelente, ya casi cerramos. Tus explicaciones sobre gastos quedaron cristalinas. Solo faltan detalles operativos finales:

# Últimos Detalles Operativos
36. Sobre Edición de Gastos ya registrados

Un gasto fue registrado ayer. Hoy quiero editarlo (cambiar monto, descripción, quién pagó). ¿Esto debe permitirse siempre o solo dentro de cierto plazo? ¿Y si afecta deudas ya "saldadas"?

Ejemplo: Ana pagó $10k hace 3 días, Laura le transfirió los $5k que le debía. Hoy Ana detecta que el gasto era $12k, no $10k. ¿Puede editarlo y generarse una nueva deuda de $1k a Laura?

37. Sobre Eliminación de Gastos

¿Quién puede eliminar un gasto?

Solo quien lo creó?
Solo administradores?
Ambos pero dejan una "marca" de auditoría?
38. Sobre Pagos/Transferencias entre Usuarios

Cuando Ana le debe $5k a Laura:

¿Laura puede marcar como "pagado" cuando recibe la transferencia, o Ana debe confirmar que pagó?
¿O ambos deben confirmar (como Mercado Pago)?
¿Hay un registro de quién transfirió y cuándo (fecha/hora)?
39. Sobre Estados de Pago de Alojamientos

Un alojamiento puede estar:

Reservado, no pagado (se paga en el sitio)
Pagado (anticipo + responsable)
Parcialmente pagado (ej: 50% ahora, 50% al llegar)
¿Puedo tener estos 3 estados o hay otros?

40. Sobre Retiro de Miembro con Gastos Compartidos Complejos

Jaime estaba en:

Grupo general
Subgrupo "Familia Ruiz"
Se retira. ¿Cómo se calcula su deuda/crédito?

¿Solo por gastos donde participó directamente?
¿También por gastos generales que ya se dividieron?
¿Hay un "liquidación al momento del retiro"?
41. Sobre Conversión de Monedas en Reportes

En el PDF final, ¿todos los montos deben estar en una sola moneda (ej: ARS) o muestro cada gasto en su moneda original + equivalencia a ARS?

42. Sobre Acceso a la Información Post-Viaje

Termina el viaje el 15/01/2026. ¿Los miembros pueden seguir accediendo a la app para ver gastos/reportes, o la app se "cierra" y solo acceden admins?

43. Sobre Categorización de Gastos

¿Necesitas categorías de gastos (Comida, Transporte, Alojamiento, Entradas, Otros) o cada usuario registra libremente con descripción?

44. Sobre Validación de Teléfono para Invitaciones

Cuando invito por teléfono, ¿debo validar que es un número válido de Argentina/Chile o acepto cualquier formato?

45. Sobre Persistencia de Datos Post-Viaje

¿Los datos del viaje se mantienen "forever" en la BD o hay una política de eliminación (ej: 2 años después del viaje)?

Con esto cierre. Luego vamos a diagramar TODO: Estructura de datos (ERD), casos de uso, y empezamos con wireframes/mockups de UI.

¿Respondés estas y arrancamos con el blueprint visual?

#respestas
- 36-Si, esa es una posibilidad, yo creo que lo conveniente es como crear un "hijo" del gasto padre, haciendo referencia saldo faltante del pago realizado el 12/10 tener una observacion que pueda ser escrita "me faltaron agregar gasto de servicio en total eran 12k recien encontre el ticket" y ahi generar deuda a laura.
- 37-Ambos y con registro auditoria
- 38-Laura debe confirmar el pago, ahora si me decis que se pueda hacer una api con mercado pago e integrarla para que sea automatico estaria genial. Y si, debe haber un registro que ana paga a laura, que tenga el gatso en relacion, el monto y el pago, la fevha y hora sera actualizada cuando Laura confirme.
- 39-Por ahora esos 3 estados
- 40-Liquidara en el momento que el pueda, y sera en donde participo lo que pagara, si es algo en general, recordar las opciones si todavia ese gasto no sucede ejemplo si es algo ocurrente como entrada a un zoo en grl y jaime ya no esta, no se le va a cobrar a jaime, si es algo que por ejemplo alojamiento que esta en estado de se abona en el momento y jaime se va antes de ir a ese alojamiento no se le cobra, su parte debe ser reasignada a los que quedan. Ahora, puede existir dos caminos de que hay un alojamiento que si lo dejaron pagado y jaime no lo use, Jaime puede ser generoso y decir chicos no me devuelvan la plata disfruten por mi o el que che necesito mi parte del alojamiento lo lamento, pues ahi se le devuelvo lo que jaime aporto, y ese importe faltante debe ser pagado por los que quedaron.
- 41-En moneda original + equivalencia a ARS en caso de ser internacional, sino solo peso arg
- 42-Pueden seguir accediendo, para ver el viaje realizado y ellos mismos poder usar la app para crear su propio viaje. También dar la posibilidad de baja, como listo no quiero mas esto y se borra el usuario logicamente.
- 43-Categorias basicas como las mencionadas y que pueda crear a su gusto
- 44-La invitacion siempre sera para personas de arg, por ahora no se considera chile u otros paises
- 45-Que se elimine todo en 1 año