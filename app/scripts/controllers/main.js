'use strict';

angular.module('yeomanApp').controller('MainCtrl', ['$scope', 'Utils', function ($scope, Utils) {
    $scope.groupA = generateGroup();
    $scope.groupB = generateGroup();

    // genero stats de cada grupo
    $scope.groupA.stats = generateGroupStats($scope.groupA);
    $scope.groupB.stats = generateGroupStats($scope.groupB);

    $scope.history = [];

    $scope.start = function () {
        inicioInteraccion();
    };

    /************************************************************************/
    /*********************** COMBATE **************************************/
    /************************************************************************/

    function inicioInteraccion() {
        $scope.history = [];
        history('Inicio de la interacción');

        //**** Reseteo el miedo de los grupos al principio de la
        $scope.groupA.stats.miedo = 0;
        $scope.groupB.stats.miedo = 0;

        //**** A ver si alguien embosca
        var AvenB = Utils.grupoDetectado($scope.groupB, $scope.groupA),
            BvenA = Utils.grupoDetectado($scope.groupA, $scope.groupB),
            quienEmbosca = null;

        console.log("A ve a B: " + AvenB);
        console.log("B ve a A: " + BvenA);

        if (!AvenB && !BvenA) {
            //fin de encuentro
            history("--- FIN DEL ENCUENTRO --- (No hay combate ya que no se ven)");
        } else if (AvenB && !BvenA) {
            history("A embosca a B");
            quienEmbosca = $scope.groupA.id;
        } else if (!AvenB && BvenA) {
            history("B embosca a A");
            quienEmbosca = $scope.groupB.id;
        } else {
            history("Combate normal");
        }

        //**** INICIO EL PRIMER TURNO
        nuevoTurno(true, quienEmbosca);
    }

    function nuevoTurno(esPrimerTurno, idGrupoQueEmbosca) {
        // Miro a ver si quedan personajes en ambos grupos, por si acaso
        if (combateFinalizado()) {
            history("FIN DE LA MASACRE");
            return;
        }

        var personajes = Utils.listarPersonajes($scope.groupA.mercs, $scope.groupB.mercs),
            arrayTodosPersonajes = $scope.groupA.mercs.concat($scope.groupB.mercs);

        //**** Lo primero es ordenar los mercenarios por orden de actuación (reflejos) este turno
        var ordenActuacionMercenarios = Utils.ordenarPersonajesPorReflejos(arrayTodosPersonajes, 0, 0, idGrupoQueEmbosca);

        //**** Si es el primer turno y alguien embosca, sólo actúa ese grupo
        /*if (esPrimerTurno && idGrupoQueEmbosca) {
         ordenActuacionMercenarios = Utils.emboscada(ordenActuacionMercenarios, idGrupoQueEmbosca);
         }*/

        //LOG
        ordenActuacionMercenarios.forEach(function (m) {
            history("Actúa " + personajes[m].name + " del grupo " + personajes[m].group);
        });


        //**** Si no es el primer turno calculo los miedos de los grupos y miro si alguno huye
        if (!esPrimerTurno) {
            // TODO calcular miedo
            // TODO calcular si huye alguno => return y fin de combate
        }

        //**** Voy viendo qué hace cada personaje
        inicioCombate(personajes, ordenActuacionMercenarios);
    }


    function inicioCombate(personajes, ordenActuacionMercenarios) {
        var arrayTodosPersonajes, muertosEnCombate = [], i,
            combateTerminado = false;

        // Por cada personaje de la lista de orden de actuación
        for (i = 0; i < ordenActuacionMercenarios.length; i++) {
            var idMerc = ordenActuacionMercenarios[i];

            // Si el pj que estoy mirando ha muerto en este combate, no sigo
            if (muertosEnCombate.indexOf(idMerc) !== -1) {
                continue;
            }

            arrayTodosPersonajes = $scope.groupA.mercs.concat($scope.groupB.mercs);

            //**** Calculamos el nivel de amenaza de cada mercenario
            var ordenAmenazaMercenarios = Utils.calcularAmenazaPersonajes(arrayTodosPersonajes, $scope.groupA.id, $scope.groupB.id);
            console.log("ORDEN AMENAZA (estoy con " + idMerc + ")");
            console.log(ordenAmenazaMercenarios);

            //LOG
            console.info(personajes);
            ordenAmenazaMercenarios[$scope.groupA.id].forEach(function (m) {
                history("    -> Amenaza de " + personajes[m.id].name + " del grupo A " + personajes[m.id].group + " -> " + m.amenaza);
            });
            ordenAmenazaMercenarios[$scope.groupB.id].forEach(function (m) {
                history("    -> Amenaza de " + personajes[m.id].name + " del grupo B " + personajes[m.id].group + " -> " + m.amenaza);
            });

            // Grupo del personaje y grupo rival
            var ownGroup, rivalGroup;

            if (personajes[idMerc].group === $scope.groupA.id) {
                ownGroup = $scope.groupA.id;
                rivalGroup = $scope.groupB.id;
            } else {
                ownGroup = $scope.groupB.id;
                rivalGroup = $scope.groupA.id;
            }

            // Selección de un objetivo rival según el nivel de amenaza
            var idTarget = Utils.seleccionaObjetivo(ordenAmenazaMercenarios[rivalGroup]);

            // El personaje ataca al rival
            console.log("Antes");
            console.log(personajes[idTarget]);
            enfrentamientoPersonajes(personajes[idMerc], personajes[idTarget]);
            console.log("Despues:");
            console.log(personajes[idTarget]);

            // Si ha muerto el objetivo, lo elimino de la lista
            if (personajes[idTarget].vidaRestante <= 0) {
                history("*** Ha muerto " + personajes[idTarget].name);
                console.warn("MUERE " + personajes[idTarget].name + "(" + idTarget + ")");
                matarPersonaje(rivalGroup, idTarget);

                // Llevo la cuenta de los caídos
                muertosEnCombate.push(idTarget);

                // A ver no sea que no quede nadie
                combateTerminado = combateFinalizado();
                if (combateTerminado) {
                    history("FIN DE LA MASACRE");
                    break;
                }
            }
        }

        // Una vez han actuado todos los personajes hago lo que sea antes de dar por terminado el turno
        if (!combateTerminado) {
            nuevoTurno(false, null);
        }
    }

    /**
     * Compruebo si alguno de los grupos ya no tiene personajes
     */
    function combateFinalizado() {
        var countA = Utils.contarPersonajes($scope.groupA.mercs),
            countB = Utils.contarPersonajes($scope.groupB.mercs);

        return (countA === 0 || countB === 0);
    }

    /**
     * Elimino al pj de la lista en scope
     */
    function matarPersonaje(grupo, idPersonaje) {
        console.info("ANTES " + $scope.groupA.mercs.length + " " + $scope.groupB.mercs.length);
        if ($scope.groupA.id === grupo) {
            $scope.groupA.mercs.forEach(function (pj, index) {
                if (pj.id === idPersonaje) {
                    console.log(index);
                    console.log($scope.groupA.mercs);
                    delete $scope.groupA.mercs[index];
                }
            });
        } else {
            $scope.groupB.mercs.forEach(function (pj, index) {
                if (pj.id === idPersonaje) {
                    console.log(index);
                    delete $scope.groupB.mercs[index];
                }
            });
        }

        console.info("DESPUES " + $scope.groupA.mercs.length + " " + $scope.groupB.mercs.length);
    }

    function enfrentamientoPersonajes(pjAtacante, pjDefensor) {
        // El daño que hace el pj es el del arma que lleve más el suyo.
        var damageA = pjAtacante.dano;

        // La reducción de daño del defensor es un % que si pasa la tirada recibe la mitad de daño.
        var reduccion = pjDefensor.reduccion;
        var tirada = Utils.dado(100, 1);
        if (tirada <= reduccion) {
            damageA = Math.ceil(damageA / 2);
        }

        var vidaAntes = pjDefensor.vidaRestante;

        // Resto el daño final a la vida del defensor
        pjDefensor.vidaRestante -= damageA;

        history(pjAtacante.name + " ataca a " + pjDefensor.name + " y le hace " + damageA +
            " puntos de daño, bajándole la vida de " + vidaAntes + " a " + pjDefensor.vidaRestante);
    }

    /************************************************************************/
    /*********************** FUNCIONES **************************************/
    /************************************************************************/

    function generateGroup(size) {
        var group = {},
            id = Math.random().toString();

        if (!size) {
            size = 5;
        }

        group.id = id;
        group.mercs = [];

        for (var i = 1; i <= size; i++) {
            group.mercs.push(generateMercStats(generateMerc(id)));
        }

        return group;
    }

    function generateMerc(grupo) {
        var merc = {};

        merc.id = "" + random() + random() + random() + random() + random() + random();
        merc.name = "MERC" + random() + random() + random();
        merc.group = grupo;
        merc.nivel = random();
        merc.fuerza = random();
        merc.constitucion = random();
        merc.agilidad = random();
        merc.conocimiento = random();

        return merc;
    }

    function generateMercStats(merc) {
        var stats = merc;

        stats.dano = (merc.fuerza + merc.constitucion) * 5;
        stats.reduccion = (merc.fuerza + merc.agilidad) * 5;
        stats.vida = ((merc.fuerza + merc.constitucion) * 5) + 100;
        stats.vidaRestante = stats.vida;
        stats.sigilo = (merc.conocimiento + merc.agilidad) * 5;
        stats.reflejos = (merc.fuerza + merc.agilidad) * 5;
        stats.percepcion = (merc.conocimiento + merc.agilidad) * 5;
        stats.veneno = (merc.conocimiento + merc.constitucion) * 5;
        stats.hambre = (merc.conocimiento + merc.constitucion) * 5;
        stats.cansancio = (merc.fuerza + merc.agilidad) * 5;
        stats.curacion = (merc.conocimiento + merc.constitucion) * 5;
        stats.especialidad = 0;

        return stats;
    }

    function generateGroupStats(grupo) {
        var stats = {
            hambre: 0,
            cansancio: 0,
            sigilo: 0,
            percepcion: 0,
            miedo: 0
        };

        grupo.mercs.forEach(function (merc) {
            // Si sigilo aún no está asignado lo hago para que no se quede a 0 siempre
            if (stats.sigilo === 0) {
                stats.sigilo = merc.sigilo;
            }

            stats.hambre += merc.hambre;
            stats.cansancio += merc.cansancio;
            // El sigilo es el que menos sigilo tenga
            stats.sigilo = Math.min(merc.sigilo, stats.sigilo);
            // La percepción es el que mejor percepción tenga
            stats.percepcion = Math.max(merc.percepcion, stats.percepcion);
        });

        //El hambre y cansancio es la media
        stats.hambre = Math.floor(stats.hambre / grupo.mercs.length);
        stats.cansancio = Math.floor(stats.cansancio / grupo.mercs.length);

        return stats;
    }

    function random() {
        return Math.floor((Math.random() * 5) + 1);
    }

    function history(msg) {
        $scope.history.push(msg);
    }


}]);
