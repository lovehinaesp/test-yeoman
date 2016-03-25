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
        inicioTurno(true, quienEmbosca);
    }

    function inicioTurno(esPrimerTurno, idGrupoQueEmbosca) {
        var personajes = Utils.listarPersonajes($scope.groupA, $scope.groupB);
    
        //**** Lo primero es ordenar los mercenarios por orden de actuación (reflejos) este turno
        var ordenActuacionMercenarios = Utils.ordenarPersonajesPorReflejos($scope.groupA, $scope.groupB, 0, 0);

        //**** Si es el primer turno y alguien embosca, sólo actúa ese grupo
        if (esPrimerTurno && idGrupoQueEmbosca) {
            ordenActuacionMercenarios = Utils.emboscada(ordenActuacionMercenarios, idGrupoQueEmbosca);
        }

        //LOG
        ordenActuacionMercenarios.forEach(function (m) {
            history("Actúa " + m.name + " del grupo " + m.group);
        });

        //**** Ahora calculamos el nivel de amenaza de cada mercenario
        var ordenAmenazaMercenarios = Utils.calcularAmenazaPersonajes(ordenActuacionMercenarios, $scope.groupA.id);

        //LOG
        ordenAmenazaMercenarios.grupoA.forEach(function (m) {
            history("Amenaza de " + m.name + " del grupo A " + m.group + " -> " + m.amenaza);
        });
        ordenAmenazaMercenarios.grupoB.forEach(function (m) {
            history("Amenaza de " + m.name + " del grupo B " + m.group + " -> " + m.amenaza);
        });

        //**** Si no es el primer turno calculo los miedos de los grupos y miro si alguno huye
        var continuaCombate = true;
        if (!esPrimerTurno) {
            // TODO calcular miedo
            // TODO calcular si huye alguno
        }

        // Si continua el combate pasaré a las acciones de cada personaje
        if (continuaCombate) {
            //**** Voy viendo qué hace cada personaje
            inicioCombate();
        }
    }


    function inicioCombate() {

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

        merc.id = random() + random() + random() + random() + random() + random();
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
        stats.vida = (merc.fuerza + merc.constitucion) * 5;
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
